import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { motion } from 'framer-motion';
import { Brain, Calendar, BookOpen, Lightbulb, Loader } from 'lucide-react';

export default function AIPlanner() {
    const { session } = useAuth();
    const [subject, setSubject] = useState('');
    const [examDate, setExamDate] = useState('');
    const [units, setUnits] = useState('');
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const unitsList = units.split(',').map((u) => u.trim()).filter(Boolean);
            const data = await apiRequest('/api/ai/study-plan', {
                method: 'POST',
                body: { subject, exam_date: examDate, units: unitsList },
                token: session?.access_token,
            });
            setPlan(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title flex items-center gap-3">
                <Brain className="w-8 h-8 text-brand-400" />
                AI Study Planner
            </h1>
            <p className="text-white/40 mt-1">Let AI create a personalized study schedule for you</p>

            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-white/60 mb-1 block">Subject</label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                            className="input-field" placeholder="e.g., Database Management" required />
                    </div>
                    <div>
                        <label className="text-sm text-white/60 mb-1 block">Exam Date</label>
                        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                            className="input-field" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm text-white/60 mb-1 block">Topics/Units (comma separated)</label>
                        <input type="text" value={units} onChange={(e) => setUnits(e.target.value)}
                            className="input-field" placeholder="e.g., Normalization, SQL, Transactions, ER Model, Indexing" required />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : <><Brain className="w-4 h-4" /> Generate Study Plan</>}
                        </button>
                    </div>
                </form>
            </motion.div>

            {plan && (
                <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Plan Days */}
                    <div className="glass-card p-6">
                        <h2 className="section-title mb-4">📅 Your Study Plan</h2>
                        <div className="space-y-2">
                            {(plan.plan || []).map((day, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                        D{day.day}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-white">{day.date}</span>
                                            <span className="text-xs text-brand-400">• {day.hours}h</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {(day.topics || []).map((t, j) => (
                                                <span key={j} className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-xs">{t}</span>
                                            ))}
                                        </div>
                                        <ul className="mt-2 space-y-1">
                                            {(day.tasks || []).map((task, j) => (
                                                <li key={j} className="text-xs text-white/50 flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-white/30" />
                                                    {task}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    {plan.tips && (
                        <div className="glass-card p-6">
                            <h2 className="section-title mb-3 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-400" /> Study Tips
                            </h2>
                            <ul className="space-y-2">
                                {plan.tips.map((tip, i) => (
                                    <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                                        <span className="text-amber-400 mt-0.5">•</span> {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
