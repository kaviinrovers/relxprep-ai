import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { motion } from 'framer-motion';
import {
    ClipboardCheck, Mic, MicOff, Send, Loader, Camera, AlertTriangle,
    CheckCircle, XCircle, Eye,
} from 'lucide-react';

export default function MockTest() {
    const { session } = useAuth();
    const [mode, setMode] = useState(null); // 'written' or 'voice'
    const [subject, setSubject] = useState('');
    const [questions, setQuestions] = useState([
        { question: 'Explain Normalization in DBMS with examples', max_marks: 16 },
        { question: 'What is a deadlock? How can it be prevented?', max_marks: 13 },
        { question: 'Compare clustered and non-clustered indexes', max_marks: 5 },
        { question: 'Define ACID properties', max_marks: 2 },
        { question: 'Explain the different types of SQL joins with examples', max_marks: 16 },
    ]);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [activeVoiceQ, setActiveVoiceQ] = useState(null);
    const [warnings, setWarnings] = useState(0);
    const [terminated, setTerminated] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const recognitionRef = useRef(null);

    // Camera setup for proctoring
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        } catch (err) {
            console.error('Camera access denied:', err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        setCameraActive(false);
    };

    // Tab visibility monitoring
    useEffect(() => {
        if (!mode || terminated) return;

        const handleVisibilityChange = () => {
            if (document.hidden && mode) {
                const newWarnings = warnings + 1;
                setWarnings(newWarnings);
                if (newWarnings >= 3) {
                    setTerminated(true);
                    stopCamera();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [mode, warnings, terminated]);

    // Voice recognition
    const startVoiceInput = (questionIndex) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setAnswers((prev) => ({ ...prev, [questionIndex]: transcript }));
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
        setActiveVoiceQ(questionIndex);
    };

    const stopVoiceInput = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        setActiveVoiceQ(null);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formattedAnswers = questions.map((q, i) => ({
                question: q.question,
                answer: answers[i] || '',
                max_marks: q.max_marks,
            }));

            const data = await apiRequest('/api/ai/evaluate', {
                method: 'POST',
                body: { question: formattedAnswers[0].question, answer: formattedAnswers[0].answer, max_marks: formattedAnswers[0].max_marks },
                token: session?.access_token,
            });

            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startTest = () => {
        if (!subject.trim()) return;
        startCamera();
    };

    if (terminated) {
        return (
            <div className="page-container">
                <div className="glass-card p-12 text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Test Terminated</h2>
                    <p className="text-white/40 mb-4">You received 3 violations. Please wait 10 minutes before retaking.</p>
                    <div className="text-red-400 text-sm">Violations: Tab switching detected {warnings} times</div>
                </div>
            </div>
        );
    }

    if (!mode) {
        return (
            <div className="page-container">
                <h1 className="page-title flex items-center gap-3">
                    <ClipboardCheck className="w-8 h-8 text-emerald-400" />
                    Mock Test
                </h1>
                <p className="text-white/40 mt-1">Take practice tests with AI evaluation</p>

                <div className="max-w-md mx-auto space-y-4 mt-8">
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input-field text-center"
                        placeholder="Enter subject (e.g., DBMS)"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <motion.button
                            onClick={() => { setMode('written'); startTest(); }}
                            className="glass-card-hover p-8 text-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!subject.trim()}
                        >
                            <ClipboardCheck className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                            <p className="text-white font-semibold">Written Test</p>
                            <p className="text-xs text-white/30 mt-1">Type your answers</p>
                        </motion.button>
                        <motion.button
                            onClick={() => { setMode('voice'); startTest(); }}
                            className="glass-card-hover p-8 text-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!subject.trim()}
                        >
                            <Mic className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                            <p className="text-white font-semibold">Voice Test</p>
                            <p className="text-xs text-white/30 mt-1">Speak your answers</p>
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Mock Test — {subject}</h1>
                    <p className="text-white/40 mt-1">{mode === 'written' ? 'Written' : 'Voice'} Mode</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Warnings */}
                    <div className={`px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2 ${warnings >= 2 ? 'bg-red-500/20 text-red-400' : warnings >= 1 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                        <AlertTriangle className="w-4 h-4" />
                        Warnings: {warnings}/3
                    </div>
                    {/* Camera indicator */}
                    <div className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 ${cameraActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        <Camera className="w-4 h-4" />
                        {cameraActive ? 'Camera On' : 'Camera Off'}
                    </div>
                </div>
            </div>

            {/* Camera Preview */}
            <div className="flex justify-end">
                <div className="w-40 h-32 rounded-xl overflow-hidden border border-white/10 bg-black">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
                {questions.map((q, i) => (
                    <motion.div
                        key={i}
                        className="glass-card p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-white font-medium">
                                <span className="text-brand-400 mr-2">Q{i + 1}.</span>
                                {q.question}
                            </p>
                            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                                {q.max_marks} marks
                            </span>
                        </div>

                        {mode === 'written' ? (
                            <textarea
                                value={answers[i] || ''}
                                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                                className="input-field min-h-[120px] resize-y"
                                placeholder="Type your answer here..."
                            />
                        ) : (
                            <div className="space-y-2">
                                <div className="input-field min-h-[80px] p-4 text-sm text-white/60">
                                    {answers[i] || 'Your voice input will appear here...'}
                                </div>
                                <button
                                    onClick={() => isRecording && activeVoiceQ === i ? stopVoiceInput() : startVoiceInput(i)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isRecording && activeVoiceQ === i
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                                        }`}
                                >
                                    {isRecording && activeVoiceQ === i ? <><MicOff className="w-4 h-4" /> Stop Recording</> : <><Mic className="w-4 h-4" /> Start Recording</>}
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Submit */}
            <div className="text-center">
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 mx-auto">
                    {loading ? <><Loader className="w-4 h-4 animate-spin" /> Evaluating...</> : <><Send className="w-4 h-4" /> Submit Test</>}
                </button>
            </div>

            {/* Results */}
            {results && (
                <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="section-title mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        AI Evaluation Results
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                            <p className="text-3xl font-bold text-brand-400">{results.score}/{results.maxMarks}</p>
                            <p className="text-xs text-white/40 mt-1">Score</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                            <p className="text-3xl font-bold text-emerald-400">
                                {Math.round((results.score / results.maxMarks) * 100)}%
                            </p>
                            <p className="text-xs text-white/40 mt-1">Percentage</p>
                        </div>
                    </div>
                    <p className="text-sm text-white/60 mb-3">{results.feedback}</p>
                    {results.strengths && (
                        <div className="mb-3">
                            <p className="text-xs text-emerald-400 font-medium mb-1">Strengths</p>
                            {results.strengths.map((s, i) => (
                                <p key={i} className="text-xs text-white/50">✓ {s}</p>
                            ))}
                        </div>
                    )}
                    {results.improvements && (
                        <div>
                            <p className="text-xs text-amber-400 font-medium mb-1">Areas to Improve</p>
                            {results.improvements.map((s, i) => (
                                <p key={i} className="text-xs text-white/50">→ {s}</p>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
