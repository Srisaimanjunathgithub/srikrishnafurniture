const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function test() {
    console.log("Testing Hugging Face Connection...");
    const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
            headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
            method: "POST",
            body: JSON.stringify({ inputs: "A simple wooden chair" }),
        }
    );

    const result = await response.json().catch(() => null);
    
    if (result && result.error) {
        console.log("❌ API ERROR:", result.error);
        if (result.estimated_time) {
            console.log(`⏳ The model is waking up. Try again in ${Math.round(result.estimated_time)} seconds.`);
        }
    } else if (response.ok) {
        console.log("✅ SUCCESS! The API is sending image data.");
    } else {
        console.log("❓ UNKNOWN STATUS:", response.status);
    }
}

test();