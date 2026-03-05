import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// Get progress for an exam
router.get('/:examId', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('study_progress')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('exam_id', req.params.examId)
            .order('unit_number', { ascending: true });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch progress' });
    }
});

// Initialize units for an exam
router.post('/init', authMiddleware, async (req, res) => {
    try {
        const { exam_id, units_count } = req.body;

        const units = Array.from({ length: units_count }, (_, i) => ({
            user_id: req.user.id,
            exam_id,
            unit_number: i + 1,
            status: 'not_started',
        }));

        const { data, error } = await supabase
            .from('study_progress')
            .insert(units)
            .select();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to initialize progress' });
    }
});

// Update unit status
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body; // not_started, in_progress, completed

        const { data, error } = await supabase
            .from('study_progress')
            .update({ status })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update progress' });
    }
});

export default router;
