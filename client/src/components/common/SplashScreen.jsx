import { motion } from 'framer-motion';

export default function SplashScreen() {
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#020617',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute',
                    top: '33%',
                    left: '33%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1), transparent 70%)',
                }} />
            </div>

            <motion.div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem'
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <motion.div
                    style={{ position: 'relative' }}
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <div style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.3)'
                    }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M24 4L8 14V34L24 44L40 34V14L24 4Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                            <circle cx="24" cy="24" r="6" fill="white" opacity="0.9"/>
                        </svg>
                    </div>
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '24px',
                            border: '2px solid #818cf8'
                        }}
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                </motion.div>

                <motion.div
                    style={{ textAlign: 'center' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <h1 style={{ 
                        fontSize: '2.25rem', 
                        fontWeight: 'bold', 
                        color: 'white',
                        letterSpacing: '-0.025em'
                    }}>
                        Relx<span style={{ 
                            background: 'linear-gradient(to right, #818cf8, #a855f7, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Prep</span> AI
                    </h1>
                    <motion.p
                        style={{ 
                            color: 'rgba(255,255,255,0.4)', 
                            fontSize: '0.875rem',
                            marginTop: '0.5rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        Relax. Prepare. Succeed.
                    </motion.p>
                </motion.div>

                <motion.div
                    style={{ display: 'flex', gap: '6px', marginTop: '1rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#818cf8'
                            }}
                            animate={{ 
                                opacity: [0.3, 1, 0.3], 
                                scale: [0.8, 1.2, 0.8] 
                            }}
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
