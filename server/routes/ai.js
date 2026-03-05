import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import {
    generateStudyPlan,
    generateImportantQuestions,
    detectWeakTopics,
    generateFlashcards,
    calculateReadinessScore,
    evaluateAnswer,
} from '../services/openaiService.js';

const router = Router();

// Generate AI study plan
router.post('/study-plan', authMiddleware, async (req, res) => {
    try {
        const { subject, exam_date, units } = req.body;
        const plan = await generateStudyPlan(subject, exam_date, units);
        res.json(plan);
    } catch (error) {
        console.error('AI study plan error:', error);
        res.status(500).json({ message: 'Failed to generate study plan' });
    }
});

// Generate important questions
router.post('/important-questions', authMiddleware, async (req, res) => {
    try {
        const { subject, topics } = req.body;
        const result = await generateImportantQuestions(subject, topics);

        // Save to database
        if (result.questions) {
            const questionsToInsert = result.questions.map(q => ({
                user_id: req.user.id,
                subject,
                question: q.question,
                importance: q.importance,
                probability: q.probability,
            }));

            await supabase.from('important_questions').insert(questionsToInsert);
        }

        res.json(result);
    } catch (error) {
        console.error('Important questions error:', error);
        res.status(500).json({ message: 'Failed to generate questions' });
    }
});

// Detect weak topics
router.post('/weak-topics', authMiddleware, async (req, res) => {
    try {
        const { data: studySessions } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('start_time', { ascending: false })
            .limit(50);

        const { data: testResults } = await supabase
            .from('test_results')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        const result = await detectWeakTopics(studySessions || [], testResults || []);
        res.json(result);
    } catch (error) {
        console.error('Weak topics error:', error);
        res.status(500).json({ message: 'Failed to detect weak topics' });
    }
});

// Generate flashcards
router.post('/flashcards', authMiddleware, async (req, res) => {
    try {
        const { subject, topics } = req.body;
        const result = await generateFlashcards(subject, topics);
        res.json(result);
    } catch (error) {
        console.error('Flashcards error:', error);
        res.status(500).json({ message: 'Failed to generate flashcards' });
    }
});

// Calculate readiness score
router.post('/readiness', authMiddleware, async (req, res) => {
    try {
        // Get last 7 days study hours
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: sessions } = await supabase
            .from('study_sessions')
            .select('duration_min')
            .eq('user_id', req.user.id)
            .gte('start_time', weekAgo.toISOString());

        const studyHours = (sessions || []).reduce((sum, s) => sum + (s.duration_min || 0), 0) / 60;

        // Get mock test scores
        const { data: testResults } = await supabase
            .from('test_results')
            .select('score, created_at')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        // Get syllabus completion
        const { data: progress } = await supabase
            .from('study_progress')
            .select('status')
            .eq('user_id', req.user.id);

        const total = (progress || []).length;
        const completed = (progress || []).filter(p => p.status === 'completed').length;
        const syllabusCompletion = total > 0 ? Math.round((completed / total) * 100) : 0;

        const mockScores = (testResults || []).map(t => t.score);

        const result = await calculateReadinessScore(studyHours, mockScores, syllabusCompletion);
        res.json(result);
    } catch (error) {
        console.error('Readiness score error:', error);
        res.status(500).json({ message: 'Failed to calculate readiness score' });
    }
});

// Evaluate answer
router.post('/evaluate', authMiddleware, async (req, res) => {
    try {
        const { question, answer, max_marks } = req.body;
        const result = await evaluateAnswer(question, answer, max_marks);
        res.json(result);
    } catch (error) {
        console.error('Evaluate error:', error);
        res.status(500).json({ message: 'Failed to evaluate answer' });
    }
});

export default router;
