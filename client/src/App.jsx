import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import SplashScreen from './components/common/SplashScreen';
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
    const [initTimeout, setInitTimeout] = useState(false);
    const { user, loading } = useAuth();

    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            console.log('Auth init timeout - proceeding with app');
            setInitTimeout(true);
            setShowSplash(false);
        }, 8000);
        
        return () => clearTimeout(fallbackTimer);
    }, []);

    useEffect(() => {
        if (!loading || initTimeout) {
            const splashTimer = setTimeout(() => {
                setShowSplash(false);
            }, 500);
            return () => clearTimeout(splashTimer);
        }
    }, [loading, initTimeout]);

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
            <div className="animated-bg" />
            <Routes>
                <Route
                    path="/login"
                    element={user ? <Navigate to="/dashboard" replace /> : <Login />}
                />
                <Route
                    path="/signup"
                    element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
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
