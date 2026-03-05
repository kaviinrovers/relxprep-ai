import { motion } from 'framer-motion';
import { PenTool, FileText, AlertCircle } from 'lucide-react';

const guidelines = [
    {
        marks: '2 Marks',
        lines: '3–4 lines',
        description: 'Write a concise definition or brief answer. Include the key term and a one-line explanation.',
        structure: ['Definition', 'One-line explanation'],
        color: 'from-emerald-500 to-teal-500',
        time: '3 minutes',
    },
    {
        marks: '5 Marks',
        lines: '8–10 lines',
        description: 'Provide a clear explanation with examples. Cover the main concept and support with one example.',
        structure: ['Definition', 'Explanation (4–5 lines)', 'Example', 'Conclusion (1 line)'],
        color: 'from-blue-500 to-cyan-500',
        time: '8 minutes',
    },
    {
        marks: '13 Marks',
        lines: '~1.5 pages',
        description: 'Write a detailed answer covering all aspects. Include introduction, explanation, diagram, and examples.',
        structure: ['Introduction (2 lines)', 'Detailed Explanation (8–10 lines)', 'Diagram (if applicable)', 'Example', 'Advantages/Features', 'Conclusion'],
        color: 'from-purple-500 to-violet-500',
        time: '18 minutes',
    },
    {
        marks: '16 Marks',
        lines: '~2 pages',
        description: 'Comprehensive answer with all sections. Include proper structure, diagrams, advantages, and a conclusion.',
        structure: ['Introduction (3 lines)', 'Detailed Explanation (10–12 lines)', 'Diagram with labels', 'Working Example', 'Advantages & Disadvantages', 'Applications', 'Conclusion (2–3 lines)'],
        color: 'from-pink-500 to-rose-500',
        time: '25 minutes',
    },
];

const keywords = [
    { word: 'Define', meaning: 'Give the exact meaning/definition' },
    { word: 'Explain', meaning: 'Describe in detail with reasoning' },
    { word: 'Compare', meaning: 'Show similarities and differences' },
    { word: 'Illustrate', meaning: 'Explain with diagram or example' },
    { word: 'List', meaning: 'Write points one by one' },
    { word: 'Describe', meaning: 'Give a detailed account' },
    { word: 'Discuss', meaning: 'Examine pros and cons, analyze' },
    { word: 'Differentiate', meaning: 'Show key differences between two concepts' },
];

export default function AnswerGuide() {
    return (
        <div className="page-container">
            <h1 className="page-title flex items-center gap-3">
                <PenTool className="w-8 h-8 text-pink-400" />
                Answer Writing Guide
            </h1>
            <p className="text-white/40 mt-1">Learn how much to write for each mark allocation</p>

            {/* Guidelines Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guidelines.map((g, i) => (
                    <motion.div
                        key={g.marks}
                        className="glass-card overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={`h-1.5 bg-gradient-to-r ${g.color}`} />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-white">{g.marks}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                                        {g.lines}
                                    </span>
                                    <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                                        ⏱ {g.time}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-white/50 mb-4">{g.description}</p>
                            <div>
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Structure</p>
                                <div className="space-y-1.5">
                                    {g.structure.map((item, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm text-white/70">
                                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${g.color}`} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Important Keywords */}
            <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 className="section-title mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Important Keywords to Highlight
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {keywords.map((kw, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-sm font-bold text-brand-400">{kw.word}</p>
                            <p className="text-xs text-white/40 mt-1">{kw.meaning}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
