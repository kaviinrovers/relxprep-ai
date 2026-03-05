import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// Get all exams for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('user_id', req.user.id)
            .order('exam_date', { ascending: true });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch exams' });
    }
});

// Create exam
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { subject, exam_date, units_count } = req.body;

        // Generate study schedule
        const examDate = new Date(exam_date);
        const today = new Date();
        const daysLeft = Math.max(1, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));

        const schedule = [];
        for (let i = 0; i < Math.min(daysLeft, units_count); i++) {
            const day = new Date(today);
            day.setDate(day.getDate() + i);

            if (i < units_count - 1) {
                schedule.push({
                    day: i + 1,
                    date: day.toISOString().split('T')[0],
                    task: `Study Unit ${i + 1}`,
                });
            }
        }

        // Add revision days
        if (daysLeft > units_count) {
            for (let i = units_count; i < daysLeft; i++) {
                const day = new Date(today);
                day.setDate(day.getDate() + i);
                schedule.push({
                    day: i + 1,
                    date: day.toISOString().split('T')[0],
                    task: i === daysLeft - 1 ? 'Final Revision & Relax' : 'Revision',
                });
            }
        }

        const { data, error } = await supabase
            .from('exams')
            .insert({
                user_id: req.user.id,
                subject,
                exam_date,
                units_count,
                schedule,
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({ message: 'Failed to create exam' });
    }
});

// Update exam
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('exams')
            .update(req.body)
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update exam' });
    }
});

// Delete exam
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete exam' });
    }
});

export default router;
