import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// Get study sessions
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { period } = req.query; // daily, weekly, monthly
        const now = new Date();
        let startDate;

        if (period === 'weekly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        } else if (period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        const { data, error } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', req.user.id)
            .gte('start_time', startDate.toISOString())
            .order('start_time', { ascending: false });

        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch study sessions' });
    }
});

// Start study session
router.post('/start', authMiddleware, async (req, res) => {
    try {
        const { subject } = req.body;

        const { data, error } = await supabase
            .from('study_sessions')
            .insert({
                user_id: req.user.id,
                subject,
                start_time: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to start study session' });
    }
});

// Stop study session
router.put('/:id/stop', authMiddleware, async (req, res) => {
    try {
        const endTime = new Date();

        // Get the session to calculate duration
        const { data: session } = await supabase
            .from('study_sessions')
            .select('start_time')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const startTime = new Date(session.start_time);
        const durationMin = Math.round((endTime - startTime) / (1000 * 60));

        const { data, error } = await supabase
            .from('study_sessions')
            .update({
                end_time: endTime.toISOString(),
                duration_min: durationMin,
            })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to stop study session' });
    }
});

export default router;
