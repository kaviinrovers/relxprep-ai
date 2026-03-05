import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { evaluateAnswer } from '../services/openaiService.js';

const router = Router();

// Create mock test
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { subject, type, questions } = req.body;

        const { data, error } = await supabase
            .from('mock_tests')
            .insert({
                user_id: req.user.id,
                subject,
                type, // 'written' or 'voice'
                questions,
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create mock test' });
    }
});

// Submit mock test answers
router.post('/:id/submit', authMiddleware, async (req, res) => {
    try {
        const { answers } = req.body;

        // Get the test
        const { data: test } = await supabase
            .from('mock_tests')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Evaluate each answer with AI
        let totalScore = 0;
        let totalMax = 0;
        const evaluations = [];

        for (const ans of answers) {
            const evaluation = await evaluateAnswer(ans.question, ans.answer, ans.max_marks);
            evaluations.push({ ...ans, evaluation });
            totalScore += evaluation.score || 0;
            totalMax += ans.max_marks;
        }

        const percentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

        // Save results
        const { data: result, error } = await supabase
            .from('test_results')
            .insert({
                mock_test_id: req.params.id,
                user_id: req.user.id,
                score: percentage,
                total_marks: totalMax,
                obtained_marks: totalScore,
                ai_feedback: evaluations,
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            score: percentage,
            totalMarks: totalMax,
            obtainedMarks: totalScore,
            evaluations,
        });
    } catch (error) {
        console.error('Mock test submit error:', error);
        res.status(500).json({ message: 'Failed to evaluate test' });
    }
});

// Get test history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('test_results')
            .select('*, mock_tests(subject, type)')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch test history' });
    }
});

export default router;
