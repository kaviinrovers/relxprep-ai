import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import { analyzeQuestions } from '../services/openaiService.js';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: 'uploads/' });
const router = Router();

// Upload and analyze question paper
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { subject } = req.body;
        const filePath = req.file.path;

        // OCR extraction
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        // AI analysis
        const analysis = await analyzeQuestions(text, subject || 'General');

        // Save to database
        const { data, error } = await supabase
            .from('question_papers')
            .insert({
                user_id: req.user.id,
                subject: subject || 'General',
                extracted_text: text,
                analysis,
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: data.id,
            extracted_text: text,
            analysis,
        });
    } catch (error) {
        console.error('Question upload error:', error);
        res.status(500).json({ message: 'Failed to process question paper' });
    }
});

// Get analyzed papers
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('question_papers')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch question papers' });
    }
});

// Get saved important questions
router.get('/important', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('important_questions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('probability', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch important questions' });
    }
});

export default router;
