import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ExamMode from './pages/ExamMode';
import StudyTimer from './pages/StudyTimer';
import SyllabusTracker from './pages/SyllabusTracker';
import AIPlanner from './pages/AIPlanner';
import QuestionAnalyzer from './pages/QuestionAnalyzer';
import ImportantQuestions from './pages/ImportantQuestions';
import AnswerGuide from './pages/AnswerGuide';
import MockTest from './pages/MockTest';
import WeakTopics from './pages/WeakTopics';
import Flashcards from './pages/Flashcards';
import ReadinessScore from './pages/ReadinessScore';

export default function App() {
    const [showSplash, setShowSplash] = useState(true);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    // 1. Loading state
    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <p style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</p>
            </div>
        );
    }

    // 2. Splash screen
    if (showSplash) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#020617',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                }} />
                <p style={{ color: '#818cf8', fontSize: '1.5rem', fontWeight: 'bold' }}>RelxPrep AI</p>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p>
            </div>
        );
    }

    // 3. No user → Login page
    if (!user) {
        return (
            <div style={{ backgroundColor: '#020617', minHeight: '100vh' }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        );
    }

    // 4. User exists → Dashboard
    return (
        <div style={{ backgroundColor: '#020617', minHeight: '100vh' }}>
            <Routes>
                <Route path="/" element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="exams" element={<ExamMode />} />
                    <Route path="timer" element={<StudyTimer />} />
                    <Route path="syllabus" element={<SyllabusTracker />} />
                    <Route path="planner" element={<AIPlanner />} />
                    <Route path="questions" element={<QuestionAnalyzer />} />
                    <Route path="important" element={<ImportantQuestions />} />
                    <Route path="answer-guide" element={<AnswerGuide />} />
                    <Route path="mock-test" element={<MockTest />} />
                    <Route path="weak-topics" element={<WeakTopics />} />
                    <Route path="flashcards" element={<Flashcards />} />
                    <Route path="readiness" element={<ReadinessScore />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}
