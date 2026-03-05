import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
    Clock, CalendarDays, TrendingUp, BookOpen,
    Brain, Target, ChevronRight, Sparkles, Timer,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

export default function Dashboard() {
    const { user, session } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await apiRequest('/api/dashboard/stats', {
                token: session?.access_token,
            });
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            // Use demo data if API fails
            setStats({
                todayStudyMinutes: 145,
                weekStudyMinutes: 840,
                upcomingExams: [
                    { id: 1, subject: 'DBMS', exam_date: '2026-03-15' },
                    { id: 2, subject: 'Operating Systems', exam_date: '2026-03-20' },
                ],
                syllabusCompletion: 65,
                performanceLevel: 'Good',
                totalUnits: 20,
                completedUnits: 13,
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getDaysLeft = (dateStr) => {
        const examDate = new Date(dateStr);
        const today = new Date();
        return Math.max(0, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));
    };

    const getPerformanceBadge = (level) => {
        const badges = {
            Excellent: 'badge-excellent',
            Good: 'badge-good',
            Average: 'badge-average',
            Poor: 'badge-poor',
        };
        return badges[level] || 'badge-average';
    };

    // Demo chart data
    const weeklyData = [
        { day: 'Mon', hours: 2.5 },
        { day: 'Tue', hours: 3.2 },
        { day: 'Wed', hours: 1.8 },
        { day: 'Thu', hours: 4.1 },
        { day: 'Fri', hours: 2.7 },
        { day: 'Sat', hours: 3.5 },
        { day: 'Sun', hours: 2.4 },
    ];

    if (loading) {
        return (
            <div className="page-container flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="page-title">
                            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''} 👋
                        </h1>
                        <p className="text-white/40 mt-1">Here's your study overview for today</p>
                    </div>
                    <div className={getPerformanceBadge(stats?.performanceLevel)}>
                        {stats?.performanceLevel} Performance
                    </div>
                </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: Clock,
                        label: "Today's Study",
                        value: formatTime(stats?.todayStudyMinutes || 0),
                        color: 'from-brand-500 to-purple-500',
                        iconBg: 'bg-brand-500/20',
                    },
                    {
                        icon: Timer,
                        label: 'This Week',
                        value: formatTime(stats?.weekStudyMinutes || 0),
                        color: 'from-purple-500 to-pink-500',
                        iconBg: 'bg-purple-500/20',
                    },
                    {
                        icon: BookOpen,
                        label: 'Syllabus Done',
                        value: `${stats?.syllabusCompletion || 0}%`,
                        color: 'from-emerald-500 to-teal-500',
                        iconBg: 'bg-emerald-500/20',
                    },
                    {
                        icon: Target,
                        label: 'Units Completed',
                        value: `${stats?.completedUnits || 0}/${stats?.totalUnits || 0}`,
                        color: 'from-amber-500 to-orange-500',
                        iconBg: 'bg-amber-500/20',
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        className="glass-card-hover p-5"
                        {...fadeUp}
                        transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white mt-3">{stat.value}</p>
                        <p className="text-sm text-white/40 mt-0.5">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts & Exams Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Chart */}
                <motion.div
                    className="glass-card p-6 lg:col-span-2"
                    {...fadeUp}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <h2 className="section-title mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand-400" />
                        Weekly Study Hours
                    </h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#ffffff20" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                            <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#fff',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="#6366f1"
                                fill="url(#colorHours)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Upcoming Exams */}
                <motion.div
                    className="glass-card p-6"
                    {...fadeUp}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <h2 className="section-title mb-4 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-purple-400" />
                        Upcoming Exams
                    </h2>
                    <div className="space-y-3">
                        {(stats?.upcomingExams || []).length === 0 ? (
                            <p className="text-white/30 text-sm">No upcoming exams</p>
                        ) : (
                            (stats?.upcomingExams || []).map((exam) => {
                                const daysLeft = getDaysLeft(exam.exam_date);
                                return (
                                    <div
                                        key={exam.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-white">{exam.subject}</p>
                                            <p className="text-xs text-white/30 mt-0.5">
                                                {new Date(exam.exam_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <div
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${daysLeft <= 3
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : daysLeft <= 7
                                                        ? 'bg-amber-500/20 text-amber-400'
                                                        : 'bg-emerald-500/20 text-emerald-400'
                                                }`}
                                        >
                                            {daysLeft}d left
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </div>

            {/* AI Recommendations */}
            <motion.div
                className="glass-card p-6"
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.7 }}
            >
                <h2 className="section-title mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-pink-400" />
                    AI Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            title: 'Study More DBMS',
                            desc: 'Your DBMS study time is below average. Focus on Unit 3 today.',
                            color: 'border-l-brand-500',
                        },
                        {
                            title: 'Take a Mock Test',
                            desc: 'You haven\'t taken a mock test this week. Practice improves retention.',
                            color: 'border-l-purple-500',
                        },
                        {
                            title: 'Review Weak Topics',
                            desc: 'Transactions and Concurrency need more attention based on your scores.',
                            color: 'border-l-pink-500',
                        },
                    ].map((rec, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-xl bg-white/5 border-l-4 ${rec.color}`}
                        >
                            <p className="text-sm font-medium text-white">{rec.title}</p>
                            <p className="text-xs text-white/40 mt-1">{rec.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
