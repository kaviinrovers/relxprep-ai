import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    CalendarClock,
    Timer,
    BookOpen,
    Brain,
    FileQuestion,
    Star,
    PenTool,
    ClipboardCheck,
    TrendingDown,
    Layers,
    Gauge,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/exams', icon: CalendarClock, label: 'Exam Mode' },
    { to: '/timer', icon: Timer, label: 'Study Timer' },
    { to: '/syllabus', icon: BookOpen, label: 'Syllabus Tracker' },
    { to: '/planner', icon: Brain, label: 'AI Planner' },
    { to: '/questions', icon: FileQuestion, label: 'Question Analyzer' },
    { to: '/important', icon: Star, label: 'Important Questions' },
    { to: '/answer-guide', icon: PenTool, label: 'Answer Guide' },
    { to: '/mock-test', icon: ClipboardCheck, label: 'Mock Tests' },
    { to: '/weak-topics', icon: TrendingDown, label: 'Weak Topics' },
    { to: '/flashcards', icon: Layers, label: 'Flashcards' },
    { to: '/readiness', icon: Gauge, label: 'Readiness Score' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <motion.aside
            className="h-screen sticky top-0 flex flex-col bg-surface-800/50 backdrop-blur-xl border-r border-white/5 overflow-hidden"
            animate={{ width: collapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-white leading-none">
                                    Relx<span className="text-brand-400">Prep</span>
                                </h2>
                                <p className="text-[10px] text-white/30 mt-0.5">AI Platform</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link-active' : 'sidebar-link'
                        }
                        title={item.label}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    className="text-sm font-medium whitespace-nowrap"
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </NavLink>
                ))}
            </nav>

            {/* User & Logout */}
            <div className="p-3 border-t border-white/5">
                <AnimatePresence>
                    {!collapsed && user && (
                        <motion.div
                            className="px-3 py-2 mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="text-xs text-white/30 truncate">
                                {user.email}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={handleLogout}
                    className="sidebar-link w-full text-red-400/60 hover:text-red-400 hover:bg-red-500/5"
                    title="Sign Out"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                className="text-sm font-medium"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.aside>
    );
}
