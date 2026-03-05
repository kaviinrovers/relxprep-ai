import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();

// Log proctoring violation
router.post('/log', authMiddleware, async (req, res) => {
    try {
        const { mock_test_id, violation_type } = req.body;
        // violation_type: 'no_face', 'multiple_faces', 'looking_away', 'tab_switch', 'background_talking'

        const { data, error } = await supabase
            .from('proctor_logs')
            .insert({
                mock_test_id,
                user_id: req.user.id,
                violation_type,
                timestamp: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to log violation' });
    }
});

// Get violation count for a test
router.get('/:testId/violations', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('proctor_logs')
            .select('*')
            .eq('mock_test_id', req.params.testId)
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        res.json({
            violations: data || [],
            count: (data || []).length,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch violations' });
    }
});

export default router;
