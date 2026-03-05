import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { Play, Pause, Square, Clock, BarChart3 } from 'lucide-react';

export default function StudyTimer() {
    const { session } = useAuth();
    const [isRunning, setIsRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [subject, setSubject] = useState('');
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchSessions();
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const fetchSessions = async () => {
        try {
            const data = await apiRequest('/api/study-sessions?period=weekly', {
                token: session?.access_token,
            });
            setSessions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const startTimer = async () => {
        if (!subject.trim()) return;
        try {
            const data = await apiRequest('/api/study-sessions/start', {
                method: 'POST',
                body: { subject },
                token: session?.access_token,
            });
            setCurrentSessionId(data.id);
            setIsRunning(true);
            setElapsed(0);
        } catch (err) {
            console.error(err);
        }
    };

    const stopTimer = async () => {
        if (!currentSessionId) return;
        try {
            await apiRequest(`/api/study-sessions/${currentSessionId}/stop`, {
                method: 'PUT',
                token: session?.access_token,
            });
            setIsRunning(false);
            setCurrentSessionId(null);
            fetchSessions();
        } catch (err) {
            console.error(err);
        }
    };

    const formatElapsed = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getPerformance = (minutes) => {
        const hours = minutes / 60;
        if (hours >= 4) return { label: 'Excellent', class: 'badge-excellent' };
        if (hours >= 2) return { label: 'Good', class: 'badge-good' };
        if (hours >= 1) return { label: 'Average', class: 'badge-average' };
        return { label: 'Poor', class: 'badge-poor' };
    };

    const todayMinutes = sessions
        .filter((s) => {
            const d = new Date(s.start_time);
            const today = new Date();
            return d.toDateString() === today.toDateString();
        })
        .reduce((sum, s) => sum + (s.duration_min || 0), 0);

    const perf = getPerformance(todayMinutes);

    return (
        <div className="page-container">
            <h1 className="page-title">Study Timer</h1>
            <p className="text-white/40 mt-1">Track your study sessions and build consistency</p>

            {/* Timer Display */}
            <motion.div
                className="glass-card p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Subject Input */}
                <div className="max-w-xs mx-auto mb-6">
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input-field text-center"
                        placeholder="What are you studying?"
                        disabled={isRunning}
                    />
                </div>

                {/* Timer */}
                <div className="text-6xl md:text-8xl font-bold text-white font-mono tracking-wider mb-8">
                    {formatElapsed(elapsed)}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    {!isRunning ? (
                        <button
                            onClick={startTimer}
                            disabled={!subject.trim()}
                            className="btn-primary flex items-center gap-2 text-lg px-8 py-4"
                        >
                            <Play className="w-6 h-6" />
                            Start
                        </button>
                    ) : (
                        <button
                            onClick={stopTimer}
                            className="px-8 py-4 rounded-xl font-semibold text-white bg-red-500/80 hover:bg-red-500 transition-all flex items-center gap-2 text-lg shadow-lg shadow-red-500/20"
                        >
                            <Square className="w-6 h-6" />
                            Stop
                        </button>
                    )}
                </div>

                {/* Today's Performance */}
                <div className="mt-6 flex items-center justify-center gap-3">
                    <Clock className="w-4 h-4 text-white/40" />
                    <span className="text-white/40 text-sm">Today: {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m</span>
                    <span className={perf.class}>{perf.label}</span>
                </div>
            </motion.div>

            {/* Recent Sessions */}
            <div>
                <h2 className="section-title mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-400" />
                    Recent Sessions
                </h2>
                <div className="space-y-2">
                    {sessions.length === 0 ? (
                        <div className="glass-card p-8 text-center text-white/30">
                            No study sessions yet. Start your first session above!
                        </div>
                    ) : (
                        sessions.slice(0, 10).map((s) => (
                            <div
                                key={s.id}
                                className="glass-card p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-brand-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{s.subject}</p>
                                        <p className="text-xs text-white/30">
                                            {new Date(s.start_time).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-white/60">
                                    {s.duration_min ? `${Math.floor(s.duration_min / 60)}h ${s.duration_min % 60}m` : 'In progress'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
