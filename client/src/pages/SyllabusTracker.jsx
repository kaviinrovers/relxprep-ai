import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Circle } from 'lucide-react';

const statusConfig = {
    not_started: { label: 'Not Started', icon: Circle, color: 'text-white/30', bg: 'bg-white/5' },
    in_progress: { label: 'In Progress', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    completed: { label: 'Completed', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const statusCycle = ['not_started', 'in_progress', 'completed'];

export default function SyllabusTracker() {
    const { session } = useAuth();
    const [exams, setExams] = useState([]);
    const [progress, setProgress] = useState({});
    const [selectedExam, setSelectedExam] = useState(null);

    useEffect(() => { fetchExams(); }, []);

    const fetchExams = async () => {
        try {
            const data = await apiRequest('/api/exams', { token: session?.access_token });
            setExams(data);
            if (data.length > 0 && !selectedExam) {
                setSelectedExam(data[0].id);
                fetchProgress(data[0].id);
            }
        } catch (err) { console.error(err); }
    };

    const fetchProgress = async (examId) => {
        try {
            const data = await apiRequest(`/api/study-progress/${examId}`, { token: session?.access_token });
            setProgress((prev) => ({ ...prev, [examId]: data }));
        } catch (err) { console.error(err); }
    };

    const initializeUnits = async (examId, unitsCount) => {
        try {
            await apiRequest('/api/study-progress/init', {
                method: 'POST',
                body: { exam_id: examId, units_count: unitsCount },
                token: session?.access_token,
            });
            fetchProgress(examId);
        } catch (err) { console.error(err); }
    };

    const toggleStatus = async (unitId, currentStatus) => {
        const currentIndex = statusCycle.indexOf(currentStatus);
        const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
        try {
            await apiRequest(`/api/study-progress/${unitId}`, {
                method: 'PUT',
                body: { status: nextStatus },
                token: session?.access_token,
            });
            fetchProgress(selectedExam);
        } catch (err) { console.error(err); }
    };

    const currentProgress = progress[selectedExam] || [];
    const completed = currentProgress.filter((p) => p.status === 'completed').length;
    const total = currentProgress.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="page-container">
            <h1 className="page-title">Syllabus Progress</h1>
            <p className="text-white/40 mt-1">Track your unit completion for each subject</p>

            {/* Exam Selector */}
            <div className="flex flex-wrap gap-2">
                {exams.map((exam) => (
                    <button
                        key={exam.id}
                        onClick={() => { setSelectedExam(exam.id); fetchProgress(exam.id); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedExam === exam.id
                                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                            }`}
                    >
                        {exam.subject}
                    </button>
                ))}
            </div>

            {selectedExam && (
                <>
                    {/* Progress Bar */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-white/60">{completed}/{total} units completed</span>
                            <span className="text-sm font-bold text-brand-400">{percentage}%</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full gradient-bg"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Units */}
                    {currentProgress.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/40 mb-4">No units initialized for this exam</p>
                            <button
                                onClick={() => {
                                    const exam = exams.find((e) => e.id === selectedExam);
                                    if (exam) initializeUnits(exam.id, exam.units_count);
                                }}
                                className="btn-primary"
                            >
                                Initialize Units
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {currentProgress.map((unit) => {
                                const config = statusConfig[unit.status];
                                const Icon = config.icon;
                                return (
                                    <motion.button
                                        key={unit.id}
                                        onClick={() => toggleStatus(unit.id, unit.status)}
                                        className={`glass-card p-4 flex items-center gap-4 text-left transition-all hover:bg-white/10 ${config.bg}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon className={`w-6 h-6 ${config.color}`} />
                                        <div>
                                            <p className="text-sm font-medium text-white">Unit {unit.unit_number}</p>
                                            <p className={`text-xs ${config.color}`}>{config.label}</p>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
