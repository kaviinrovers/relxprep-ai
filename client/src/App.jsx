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

function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [initTimeout, setInitTimeout] = useState(false);
    const { user, loading } = useAuth();

    useEffect(function() {
        const fallbackTimer = setTimeout(function() {
            console.log('Auth init timeout - proceeding with app');
            setInitTimeout(true);
            setShowSplash(false);
        }, 8000);
        
        return function() { clearTimeout(fallbackTimer); };
    }, []);

    useEffect(function() {
        if (!loading || initTimeout) {
            const splashTimer = setTimeout(function() {
                setShowSplash(false);
            }, 500);
            return function() { clearTimeout(splashTimer); };
        }
    }, [loading, initTimeout]);

    if (showSplash) {
        return <SplashScreen />;
    }

    if (!user && !loading) {
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

    return (
        <div style={{ backgroundColor: '#020617', minHeight: '100vh' }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<AppLayout />}>
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

export default App;
