require('dotenv').config();
const https = require('https');

const key = process.env.GEMINI_API_KEY;
console.log("Key length:", key ? key.length : 0);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Status:", res.statusCode);
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("Available models:");
                json.models.forEach(m => console.log(m.name));
            } else {
                console.log("Response:", data);
            }
        } catch (e) {
            console.log("Raw:", data);
        }
    });
}).on('error', (e) => {
    console.error("Error:", e);
});
