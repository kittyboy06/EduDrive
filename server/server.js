require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Multer Setup
const upload = multer({ dest: 'uploads/' });

// Routes

// 1. Get Subjects (optionally filtered by semester)
app.get('/api/subjects', async (req, res) => {
    const { semester } = req.query;
    let query = supabase.from('subjects').select('*');
    if (semester) query = query.eq('semester', semester);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. Create Subject
app.post('/api/subjects', async (req, res) => {
    const { name, code, semester } = req.body;
    const { data, error } = await supabase
        .from('subjects')
        .insert([{ name, code, semester }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// 3. Get Resources for a Subject
app.get('/api/resources/:subjectId', async (req, res) => {
    const { subjectId } = req.params;
    const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('subject_id', subjectId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 4. Upload Resource
// Simplified: We assume file is saved locally or validated here, 
// in prod you'd upload to Supabase Storage and get a URL.
// We also extract text here.
app.post('/api/resources', upload.single('file'), async (req, res) => {
    try {
        const { subject_id, title, type } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        // 1. Extract Text
        let extractedText = '';
        const dataBuffer = fs.readFileSync(file.path);

        try {
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } catch (e) {
            console.error("PDF Parse failed, trying OCR", e);
        }

        // If text is too short, assuming scanned -> OCR
        if (extractedText.length < 50) {
            console.log("Low text count, running OCR...");
            const { data: { text } } = await Tesseract.recognize(file.path, 'eng');
            extractedText = text;
        }

        // 2. Save Metadata to DB
        // NOTE: In real app, upload file to Storage bucket first to get URL.
        // For this demo, we'll just store a placeholder URL or local path.
        const file_url = file.path;

        const { data, error } = await supabase
            .from('resources')
            .insert([{
                subject_id,
                title,
                type,
                file_url,
                extracted_text: extractedText
            }])
            .select();

        // Cleanup temp file
        // fs.unlinkSync(file.path); 

        if (error) throw error;
        res.json(data[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 5. Chat with Agent
app.post('/api/chat', async (req, res) => {
    try {
        const { query, subjectId } = req.body;

        // 1. Retrieve Context
        const { data: resources, error } = await supabase
            .from('resources')
            .select('extracted_text, title')
            .eq('subject_id', subjectId);

        if (error) throw error;

        // Naive RAG: Combine all text (Warning: Context window limits)
        // Better: Chunking and Vector Search (pgvector).
        // For this demo/ MVP, we limit context.
        let context = "";
        resources.forEach(r => {
            context += `Source: ${r.title}\n${r.extracted_text.substring(0, 5000)}\n\n`; // Limit per doc
        });

        const prompt = `
        You are an AI teaching assistant. 
        Answer the student's question based ONLY on the following context.
        If the answer is not in the context, say so.
        
        Context:
        ${context.substring(0, 30000)} -- Hard limit to avoid errors
        
        Question: ${query}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
