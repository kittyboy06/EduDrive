require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the client instance in some versions, 
        // but let's try to just run a simple prompt on a few known candidates.
        console.log("Testing gemini-1.5-flash...");
        const result = await model.generateContent("Hello");
        console.log("gemini-1.5-flash worked!");
    } catch (e) {
        console.log("gemini-1.5-flash failed:", e.message);
    }

    try {
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        console.log("Testing gemini-pro...");
        const result2 = await model2.generateContent("Hello");
        console.log("gemini-pro worked!");
    } catch (e) {
        console.log("gemini-pro failed:", e.message);
    }
}

listModels();
