import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardCheck, Mic, MicOff, Send, Loader, Camera, AlertTriangle,
    CheckCircle, XCircle, Eye, ShieldAlert, UserX,
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
    const [warningPopup, setWarningPopup] = useState(null); // { type, message }
    const [faceDetected, setFaceDetected] = useState(true);
    const [noFaceTimer, setNoFaceTimer] = useState(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const recognitionRef = useRef(null);
    const warningsRef = useRef(0);
    const faceCheckIntervalRef = useRef(null);

    // Keep warningsRef in sync
    useEffect(() => {
        warningsRef.current = warnings;
    }, [warnings]);

    // Show warning popup with auto-dismiss
    const showWarning = useCallback((type, message) => {
        setWarningPopup({ type, message });
        setTimeout(() => setWarningPopup(null), 4000);
    }, []);

    // Add a violation warning
    const addViolation = useCallback((reason) => {
        const newCount = warningsRef.current + 1;
        setWarnings(newCount);
        if (newCount >= 3) {
            setTerminated(true);
            stopCamera();
            stopFaceDetection();
        } else {
            showWarning('violation', `⚠️ Warning ${newCount}/3: ${reason}`);
        }
    }, [showWarning]);

    // Camera setup for proctoring
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
            return true;
        } catch (err) {
            console.error('Camera access denied:', err);
            showWarning('camera', '📷 Camera access denied. Proctoring requires camera permission.');
            return false;
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    // ===== FACE DETECTION using canvas pixel analysis =====
    const detectFace = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !video.srcObject || video.readyState < 2) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 160;
        canvas.height = 120;
        ctx.drawImage(video, 0, 0, 160, 120);

        const imageData = ctx.getImageData(0, 0, 160, 120);
        const data = imageData.data;

        // Count skin-tone pixels in the center region (where face should be)
        let skinPixels = 0;
        let totalPixels = 0;
        const centerX1 = 40, centerX2 = 120;
        const centerY1 = 10, centerY2 = 100;

        for (let y = centerY1; y < centerY2; y++) {
            for (let x = centerX1; x < centerX2; x++) {
                const i = (y * 160 + x) * 4;
                const r = data[i], g = data[i + 1], b = data[i + 2];

                // Skin color detection (works for various skin tones)
                const isSkin = (
                    r > 60 && g > 40 && b > 20 &&
                    r > g && r > b &&
                    Math.abs(r - g) > 15 &&
                    r - b > 15 &&
                    // Exclude very bright (white wall) and very dark pixels
                    r < 240 && g < 230 &&
                    !(r > 200 && g > 200 && b > 200) // not white
                );

                if (isSkin) skinPixels++;
                totalPixels++;
            }
        }

        const skinRatio = skinPixels / totalPixels;
        const hasFace = skinRatio > 0.08; // At least 8% skin pixels = face present

        setFaceDetected(hasFace);

        if (!hasFace) {
            setNoFaceTimer((prev) => {
                const newVal = prev + 1;
                // If no face for 5 seconds (5 checks at 1s interval), warn
                if (newVal === 5) {
                    addViolation('Face not detected — look at the camera');
                    return 0;
                }
                return newVal;
            });
        } else {
            setNoFaceTimer(0);
        }
    }, [addViolation]);

    const startFaceDetection = useCallback(() => {
        if (faceCheckIntervalRef.current) clearInterval(faceCheckIntervalRef.current);
        faceCheckIntervalRef.current = setInterval(detectFace, 1000);
    }, [detectFace]);

    const stopFaceDetection = () => {
        if (faceCheckIntervalRef.current) {
            clearInterval(faceCheckIntervalRef.current);
            faceCheckIntervalRef.current = null;
        }
    };

    // Cleanup camera & mic on page exit
    useEffect(() => {
        return () => {
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            }
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
            }
            stopFaceDetection();
        };
    }, []);

    // ===== TAB & WINDOW SWITCH DETECTION =====
    useEffect(() => {
        if (!mode || terminated) return;

        // Detect tab switch
        const handleVisibilityChange = () => {
            if (document.hidden) {
                addViolation('Tab switch detected — stay on the test page');
            }
        };

        // Detect alt-tab / window switch
        const handleWindowBlur = () => {
            addViolation('Window switch detected — do not leave the test window');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [mode, terminated, addViolation]);

    // Start face detection when camera becomes active
    useEffect(() => {
        if (cameraActive && mode) {
            // Wait a moment for camera to initialize
            const timer = setTimeout(() => startFaceDetection(), 2000);
            return () => clearTimeout(timer);
        } else {
            stopFaceDetection();
        }
    }, [cameraActive, mode, startFaceDetection]);

    // Voice recognition
    const startVoiceInput = (questionIndex) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser. Use Chrome or Edge.');
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

    const startTest = async () => {
        if (!subject.trim()) return;
        await startCamera();
    };

    // ===== WARNING POPUP OVERLAY =====
    const WarningPopup = () => (
        <AnimatePresence>
            {warningPopup && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-red-950/90 border-2 border-red-500/50 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl shadow-red-500/20"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-xl font-bold text-red-400 mb-2">Proctoring Alert!</h3>
                        <p className="text-white/80 text-sm mb-4">{warningPopup.message}</p>
                        <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            {3 - warnings} warning(s) remaining before termination
                        </div>
                        <button
                            onClick={() => setWarningPopup(null)}
                            className="mt-4 px-6 py-2 bg-red-500/20 text-red-300 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-colors border border-red-500/30"
                        >
                            I Understand
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (terminated) {
        return (
            <div className="page-container">
                <WarningPopup />
                <div className="glass-card p-12 text-center">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Test Terminated</h2>
                    <p className="text-white/40 mb-4">You received 3 violations. Please wait 10 minutes before retaking.</p>
                    <div className="text-red-400 text-sm">Violations: {warnings} detected</div>
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
            <WarningPopup />

            {/* Hidden canvas for face detection */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Mock Test — {subject}</h1>
                    <p className="text-white/40 mt-1">{mode === 'written' ? 'Written' : 'Voice'} Mode</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Face detection status */}
                    <div className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 ${faceDetected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400 animate-pulse'
                        }`}>
                        {faceDetected ? <Eye className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        {faceDetected ? 'Face OK' : 'No Face!'}
                    </div>
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
                <div className={`w-40 h-32 rounded-xl overflow-hidden border-2 bg-black transition-colors ${faceDetected ? 'border-emerald-500/30' : 'border-red-500/50 shadow-lg shadow-red-500/20'
                    }`}>
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
