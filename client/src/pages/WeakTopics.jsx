import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { motion } from 'framer-motion';
import { TrendingDown, Loader, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

export default function WeakTopics() {
    const { session } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyze = async () => {
        setLoading(true);
        try {
            const result = await apiRequest('/api/ai/weak-topics', {
                method: 'POST',
                token: session?.access_token,
            });
            setData(result);
        } catch (err) {
            console.error(err);
            // Demo data
            setData({
                weak_topics: [
                    { topic: 'Transactions', reason: 'Low test scores and limited study time', suggestion: 'Focus 2 hours daily on transaction concepts' },
                    { topic: 'Concurrency Control', reason: 'Not covered in study sessions', suggestion: 'Start with basic concurrency concepts' },
                    { topic: 'Database Architecture', reason: 'Average test performance', suggestion: 'Review architecture diagrams and practice' },
                ],
                strong_topics: ['Normalization', 'SQL Queries', 'ER Diagrams'],
                overall_recommendation: 'Focus more on Unit 3 (Transactions) and Unit 5 (Concurrency). Your SQL skills are strong — use them as anchors.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-amber-400" />
                Weak Topic Detection
            </h1>
            <p className="text-white/40 mt-1">AI analyzes your study patterns and test scores to find weak areas</p>

            {!data && (
                <div className="glass-card p-12 text-center">
                    <TrendingDown className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 mb-4">Click below to analyze your study data and find weak topics</p>
                    <button onClick={analyze} disabled={loading} className="btn-primary flex items-center gap-2 mx-auto">
                        {loading ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</> : <><TrendingDown className="w-4 h-4" /> Analyze My Weaknesses</>}
                    </button>
                </div>
            )}

            {data && (
                <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Recommendation */}
                    <div className="glass-card p-6 border-l-4 border-l-brand-500">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white mb-1">AI Recommendation</p>
                                <p className="text-sm text-white/60">{data.overall_recommendation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Weak Topics */}
                    <div>
                        <h2 className="section-title mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" /> Weak Topics
                        </h2>
                        <div className="space-y-3">
                            {(data.weak_topics || []).map((topic, i) => (
                                <motion.div
                                    key={i}
                                    className="glass-card p-5 border-l-4 border-l-red-500/50"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <h3 className="text-white font-semibold">{topic.topic}</h3>
                                    <p className="text-sm text-white/40 mt-1">{topic.reason}</p>
                                    <p className="text-sm text-brand-400 mt-2">💡 {topic.suggestion}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Strong Topics */}
                    <div>
                        <h2 className="section-title mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" /> Strong Topics
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {(data.strong_topics || []).map((topic, i) => (
                                <span key={i} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                                    ✓ {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
