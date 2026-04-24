const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Gemini is processing:", prompt);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${process.env.GOOGLE_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    response_modalities: ["IMAGE"] 
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return res.status(response.status).json(data);
        }

        // Extract the image data from Gemini's response
        const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
        
        if (imagePart) {
            const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
            res.type('image/png');
            res.send(buffer);
            console.log("✅ Image generated and sent!");
        } else {
            console.log("❌ No image in response. Gemini might have sent text instead.");
            res.status(500).send("No image data received.");
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3000, () => console.log("🚀 Gemini Server running on http://localhost:3000"));