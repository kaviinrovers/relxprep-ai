import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest, apiUpload } from '../services/api';
import { motion } from 'framer-motion';
import { Upload, FileQuestion, BarChart, Loader, FileText } from 'lucide-react';

export default function QuestionAnalyzer() {
    const { session } = useAuth();
    const [file, setFile] = useState(null);
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [papers, setPapers] = useState([]);

    useEffect(() => { fetchPapers(); }, []);

    const fetchPapers = async () => {
        try {
            const data = await apiRequest('/api/questions', { token: session?.access_token });
            setPapers(data);
        } catch (err) { console.error(err); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('subject', subject);
            const data = await apiUpload('/api/questions/upload', formData, session?.access_token);
            setAnalysis(data.analysis);
            setFile(null);
            fetchPapers();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const importanceColors = {
        very_important: 'bg-red-500/20 text-red-400 border-red-500/30',
        important: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        moderate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };

    return (
        <div className="page-container">
            <h1 className="page-title flex items-center gap-3">
                <FileQuestion className="w-8 h-8 text-purple-400" />
                Question Paper Analyzer
            </h1>
            <p className="text-white/40 mt-1">Upload previous year papers for AI-powered analysis</p>

            {/* Upload Form */}
            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">Subject</label>
                            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                                className="input-field" placeholder="e.g., DBMS" required />
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">Question Paper (PDF/Image)</label>
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="input-field file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-500/20 file:text-brand-400 file:text-sm" required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        {loading ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Upload className="w-4 h-4" /> Upload & Analyze</>}
                    </button>
                </form>
            </motion.div>

            {/* Analysis Results */}
            {analysis && (
                <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {analysis.summary && (
                        <div className="glass-card p-6">
                            <h2 className="section-title mb-2">📊 Analysis Summary</h2>
                            <p className="text-sm text-white/60">{analysis.summary}</p>
                        </div>
                    )}

                    {analysis.topics && (
                        <div className="glass-card p-6">
                            <h2 className="section-title mb-4">🔥 Important Topics by Frequency</h2>
                            <div className="space-y-2">
                                {analysis.topics.map((topic, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono text-white/30 w-6">#{i + 1}</span>
                                            <span className="text-sm text-white font-medium">{topic.topic}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-white/40">× {topic.frequency}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${importanceColors[topic.importance] || importanceColors.moderate}`}>
                                                {topic.importance?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {analysis.repeated_questions && (
                        <div className="glass-card p-6">
                            <h2 className="section-title mb-4">🔁 Frequently Repeated Questions</h2>
                            <div className="space-y-2">
                                {analysis.repeated_questions.map((q, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-white/5 flex items-start justify-between gap-4">
                                        <p className="text-sm text-white/80">{q.question}</p>
                                        <span className="text-xs text-brand-400 whitespace-nowrap">
                                            {q.times_appeared}× appeared
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Previous Papers */}
            {papers.length > 0 && (
                <div>
                    <h2 className="section-title mb-3">📋 Previous Analyses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {papers.map((paper) => (
                            <button
                                key={paper.id}
                                onClick={() => setAnalysis(paper.analysis)}
                                className="glass-card p-4 text-left hover:bg-white/10 transition-all flex items-center gap-3"
                            >
                                <FileText className="w-8 h-8 text-purple-400 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-white">{paper.subject}</p>
                                    <p className="text-xs text-white/30">{new Date(paper.created_at).toLocaleDateString()}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
