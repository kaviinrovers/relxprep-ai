import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, RotateCcw, ChevronLeft, ChevronRight, Loader, Sparkles } from 'lucide-react';

export default function Flashcards() {
    const { session } = useAuth();
    const [subject, setSubject] = useState('');
    const [topics, setTopics] = useState('');
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const topicsList = topics.split(',').map((t) => t.trim()).filter(Boolean);
            const data = await apiRequest('/api/ai/flashcards', {
                method: 'POST',
                body: { subject, topics: topicsList },
                token: session?.access_token,
            });
            setCards(data.flashcards || []);
            setCurrentIndex(0);
            setFlipped(false);
        } catch (err) {
            console.error(err);
            // Demo data
            setCards([
                { front: 'What is Normalization?', back: 'Normalization is the process of organizing data to reduce redundancy and improve data integrity by dividing a database into two or more tables.', topic: 'Unit 1' },
                { front: 'What are ACID properties?', back: 'Atomicity, Consistency, Isolation, Durability — the four properties that guarantee reliable database transactions.', topic: 'Unit 2' },
                { front: 'What is a Deadlock?', back: 'A situation where two or more transactions are waiting for each other to release locks, creating a cycle that prevents any of them from proceeding.', topic: 'Unit 3' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const next = () => {
        setFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 200);
    };

    const prev = () => {
        setFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 200);
    };

    const card = cards[currentIndex];

    return (
        <div className="page-container">
            <h1 className="page-title flex items-center gap-3">
                <Layers className="w-8 h-8 text-teal-400" />
                Flashcards
            </h1>
            <p className="text-white/40 mt-1">Quick revision flashcards for important concepts</p>

            {/* Generate Form */}
            {cards.length === 0 && (
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
                        <div className="md:col-span-2">
                            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Flashcards</>}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Flashcard Display */}
            {cards.length > 0 && card && (
                <div className="flex flex-col items-center gap-6">
                    {/* Counter */}
                    <p className="text-sm text-white/40">
                        {currentIndex + 1} / {cards.length}
                        {card.topic && <span className="ml-2 text-brand-400">• {card.topic}</span>}
                    </p>

                    {/* Card */}
                    <motion.div
                        onClick={() => setFlipped(!flipped)}
                        className="w-full max-w-lg aspect-[3/2] cursor-pointer perspective-1000"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <motion.div
                            className="w-full h-full relative"
                            animate={{ rotateY: flipped ? 180 : 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front */}
                            <div
                                className="absolute inset-0 glass-card p-8 flex flex-col items-center justify-center text-center backface-hidden"
                                style={{ backfaceVisibility: 'hidden' }}
                            >
                                <p className="text-xs text-white/30 uppercase tracking-wider mb-4">Question</p>
                                <p className="text-xl font-semibold text-white">{card.front}</p>
                                <p className="text-xs text-white/20 mt-6">Click to reveal answer</p>
                            </div>

                            {/* Back */}
                            <div
                                className="absolute inset-0 glass-card p-8 flex flex-col items-center justify-center text-center"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                                <p className="text-xs text-brand-400 uppercase tracking-wider mb-4">Answer</p>
                                <p className="text-sm text-white/80 leading-relaxed">{card.back}</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button onClick={prev} className="btn-secondary p-3">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setFlipped(!flipped)} className="btn-secondary p-3">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button onClick={next} className="btn-secondary p-3">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={() => { setCards([]); setCurrentIndex(0); setFlipped(false); }}
                        className="text-sm text-white/30 hover:text-white/60 transition-colors"
                    >
                        Generate new flashcards
                    </button>
                </div>
            )}
        </div>
    );
}
