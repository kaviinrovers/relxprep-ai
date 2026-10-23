import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS_ORIGIN can be a comma-separated list of allowed frontends (e.g. your Vercel URL).
// Leave it unset to allow all origins (fine for development only).
const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

import { supabase } from './config/supabase.js';

// Import routes
import dashboardRoutes from './routes/dashboard.js';
import examRoutes from './routes/exams.js';
import studySessionRoutes from './routes/studySessions.js';
import studyProgressRoutes from './routes/studyProgress.js';
import aiRoutes from './routes/ai.js';
import questionRoutes from './routes/questions.js';
import mockTestRoutes from './routes/mockTests.js';
import proctorRoutes from './routes/proctor.js';

// Mount routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/study-sessions', studySessionRoutes);
app.use('/api/study-progress', studyProgressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/proctor', proctorRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('RelxPrep AI Backend is running 🚀');
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database connection check (verifies Supabase is reachable with the configured keys)
app.get('/api/health/db', async (req, res) => {
    if (!supabase) {
        return res.status(503).json({ status: 'error', database: 'not configured' });
    }
    try {
        const { error } = await supabase.from('exams').select('id', { head: true, count: 'exact' }).limit(1);
        if (error) throw error;
        res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        console.error('DB health check failed:', err.message);
        res.status(503).json({ status: 'error', database: 'unreachable', message: err.message });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 RelxPrep AI server running on port ${PORT}`);
});
