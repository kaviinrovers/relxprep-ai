import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();

router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();

        // Get today's study time
        const { data: todaySessions } = await supabase
            .from('study_sessions')
            .select('duration_min')
            .eq('user_id', userId)
            .gte('start_time', todayStart);

        const todayMinutes = (todaySessions || []).reduce((sum, s) => sum + (s.duration_min || 0), 0);

        // Get weekly study time
        const { data: weekSessions } = await supabase
            .from('study_sessions')
            .select('duration_min')
            .eq('user_id', userId)
            .gte('start_time', weekStart);

        const weekMinutes = (weekSessions || []).reduce((sum, s) => sum + (s.duration_min || 0), 0);

        // Get upcoming exams
        const { data: upcomingExams } = await supabase
            .from('exams')
            .select('*')
            .eq('user_id', userId)
            .gte('exam_date', now.toISOString().split('T')[0])
            .order('exam_date', { ascending: true })
            .limit(5);

        // Get syllabus completion
        const { data: progress } = await supabase
            .from('study_progress')
            .select('status')
            .eq('user_id', userId);

        const totalUnits = (progress || []).length;
        const completedUnits = (progress || []).filter(p => p.status === 'completed').length;

        // Performance level
        const todayHours = todayMinutes / 60;
        let performanceLevel = 'Poor';
        if (todayHours >= 4) performanceLevel = 'Excellent';
        else if (todayHours >= 2) performanceLevel = 'Good';
        else if (todayHours >= 1) performanceLevel = 'Average';

        res.json({
            todayStudyMinutes: todayMinutes,
            weekStudyMinutes: weekMinutes,
            upcomingExams: upcomingExams || [],
            syllabusCompletion: totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0,
            performanceLevel,
            totalUnits,
            completedUnits,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
});

export default router;
