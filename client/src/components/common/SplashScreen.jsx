import { motion } from 'framer-motion';

export default function SplashScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-900 overflow-hidden">
            <div className="animated-bg" />

            {/* Glowing orbs background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[120px]" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px]" />
            </div>

            <motion.div
                className="relative flex flex-col items-center gap-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                }}
            >
                {/* Logo Icon */}
                <motion.div
                    className="relative"
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center shadow-2xl shadow-brand-500/30">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 4L8 14V34L24 44L40 34V14L24 4Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
                            <path d="M24 4V44" stroke="white" strokeWidth="1.5" opacity="0.3" />
                            <path d="M8 14L40 34" stroke="white" strokeWidth="1.5" opacity="0.3" />
                            <path d="M40 14L8 34" stroke="white" strokeWidth="1.5" opacity="0.3" />
                            <circle cx="24" cy="24" r="6" fill="white" opacity="0.9" />
                            <circle cx="24" cy="24" r="3" fill="url(#grad)" />
                            <defs>
                                <linearGradient id="grad" x1="21" y1="21" x2="27" y2="27">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Pulsing ring */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl border-2 border-brand-400"
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                </motion.div>

                {/* Brand Text */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Relx<span className="gradient-text">Prep</span> AI
                    </h1>
                    <motion.p
                        className="text-white/40 text-sm mt-2 tracking-widest uppercase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        Relax. Prepare. Succeed.
                    </motion.p>
                </motion.div>

                {/* Loading dots */}
                <motion.div
                    className="flex gap-1.5 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-brand-400"
                            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
