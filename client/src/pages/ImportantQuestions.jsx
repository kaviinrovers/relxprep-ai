import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { motion } from 'framer-motion';
import { Star, Download, Loader, Sparkles } from 'lucide-react';

export default function ImportantQuestions() {
    const { session } = useAuth();
    const [subject, setSubject] = useState('');
    const [topics, setTopics] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const topicsList = topics.split(',').map((t) => t.trim()).filter(Boolean);
            const data = await apiRequest('/api/ai/important-questions', {
                method: 'POST',
                body: { subject, topics: topicsList },
                token: session?.access_token,
            });
            setQuestions(data.questions || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const downloadPDF = async () => {
        const pdfMake = (await import('pdfmake/build/pdfmake')).default;
        const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
        pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

        const docDefinition = {
            content: [
                { text: `RelxPrep AI - Important Questions`, style: 'header' },
                { text: `Subject: ${subject}`, style: 'subheader' },
                { text: '\n' },
                ...questions.map((q, i) => ([
                    { text: `${i + 1}. ${q.question}`, style: 'question', margin: [0, 8, 0, 2] },
                    { text: `   Importance: ${q.importance} | Probability: ${q.probability}% | Marks: ${q.marks}`, style: 'meta' },
                ])).flat(),
            ],
            styles: {
                header: { fontSize: 18, bold: true, color: '#4f46e5' },
                subheader: { fontSize: 12, color: '#666' },
                question: { fontSize: 11, bold: true },
                meta: { fontSize: 9, color: '#888' },
            },
        };

        pdfMake.createPdf(docDefinition).download(`${subject}_important_questions.pdf`);
    };

    const importanceBadge = {
        very_important: 'bg-red-500/20 text-red-400',
        important: 'bg-amber-500/20 text-amber-400',
        moderate: 'bg-blue-500/20 text-blue-400',
    };

    return (
        <div className="page-container">
            <h1 className="page-title flex items-center gap-3">
                <Star className="w-8 h-8 text-amber-400" />
                Important Questions
            </h1>
            <p className="text-white/40 mt-1">AI-predicted important questions with appearance probability</p>

            <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-white/60 mb-1 block">Subject</label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                            className="input-field" placeholder="e.g., DBMS" required />
                    </div>
                    <div>
                        <label className="text-sm text-white/60 mb-1 block">Topics (comma separated)</label>
                        <input type="text" value={topics} onChange={(e) => setTopics(e.target.value)}
                            className="input-field" placeholder="e.g., Normalization, SQL, ER Model" required />
                    </div>
                    <div className="md:col-span-2 flex gap-3">
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Questions</>}
                        </button>
                        {questions.length > 0 && (
                            <button type="button" onClick={downloadPDF} className="btn-secondary flex items-center gap-2">
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>

            {questions.length > 0 && (
                <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {questions.map((q, i) => (
                        <div key={i} className="glass-card p-4 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <span className="text-sm font-mono text-white/20 mt-0.5 w-6">{i + 1}.</span>
                                <div>
                                    <p className="text-sm text-white font-medium">{q.question}</p>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${importanceBadge[q.importance] || importanceBadge.moderate}`}>
                                            {q.importance?.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-white/40">{q.marks} marks</span>
                                        {q.category && <span className="text-xs text-white/30">{q.category}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <span className="text-lg font-bold text-brand-400">{q.probability}%</span>
                                <p className="text-xs text-white/30">chance</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
