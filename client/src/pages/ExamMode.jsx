import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
    CalendarPlus, Calendar, Trash2, ChevronDown, ChevronUp,
    BookOpen, Clock, CheckCircle,
} from 'lucide-react';

export default function ExamMode() {
    const { session } = useAuth();
    const [exams, setExams] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState('');
    const [examDate, setExamDate] = useState('');
    const [unitsCount, setUnitsCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [expandedExam, setExpandedExam] = useState(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await apiRequest('/api/exams', { token: session?.access_token });
            setExams(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiRequest('/api/exams', {
                method: 'POST',
                body: { subject, exam_date: examDate, units_count: unitsCount },
                token: session?.access_token,
            });
            setSubject('');
            setExamDate('');
            setUnitsCount(5);
            setShowForm(false);
            fetchExams();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiRequest(`/api/exams/${id}`, { method: 'DELETE', token: session?.access_token });
            fetchExams();
        } catch (err) {
            console.error(err);
        }
    };

    const getDaysLeft = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        return Math.max(0, Math.ceil((d - today) / (1000 * 60 * 60 * 24)));
    };

    return (
        <div className="page-container">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Exam Mode</h1>
                    <p className="text-white/40 mt-1">Plan your exams and get auto-generated schedules</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center gap-2"
                >
                    <CalendarPlus className="w-4 h-4" />
                    Add Exam
                </button>
            </div>

            {/* Add Exam Form */}
            {showForm && (
                <motion.div
                    className="glass-card p-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="input-field"
                                placeholder="e.g., DBMS"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">Exam Date</label>
                            <input
                                type="date"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">Number of Units</label>
                            <input
                                type="number"
                                value={unitsCount}
                                onChange={(e) => setUnitsCount(Number(e.target.value))}
                                className="input-field"
                                min="1"
                                max="20"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" disabled={loading} className="btn-primary w-full">
                                {loading ? 'Creating...' : 'Generate Schedule'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Exam Cards */}
            <div className="space-y-4">
                {exams.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40">No exams added yet. Click "Add Exam" to get started.</p>
                    </div>
                ) : (
                    exams.map((exam) => {
                        const daysLeft = getDaysLeft(exam.exam_date);
                        const isExpanded = expandedExam === exam.id;

                        return (
                            <motion.div
                                key={exam.id}
                                className="glass-card overflow-hidden"
                                layout
                            >
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-brand-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{exam.subject}</h3>
                                            <p className="text-sm text-white/40">
                                                {new Date(exam.exam_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${daysLeft <= 3 ? 'bg-red-500/20 text-red-400' :
                                                daysLeft <= 7 ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            {daysLeft} days left
                                        </div>
                                        <button
                                            onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                                            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exam.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Schedule */}
                                {isExpanded && exam.schedule && (
                                    <motion.div
                                        className="px-5 pb-5 border-t border-white/5 pt-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <h4 className="text-sm font-medium text-white/60 mb-3">Study Schedule</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {exam.schedule.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                                                        D{item.day}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-white font-medium">{item.task}</p>
                                                        <p className="text-xs text-white/30">{item.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
