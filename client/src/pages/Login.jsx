import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, demoLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (email === 'demo@relxprep.com' && password === 'demo123') {
                demoLogin();
                navigate('/dashboard');
                return;
            }
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" 
             style={{ backgroundColor: '#020617', position: 'relative', zIndex: 10 }}>
            <div style={{
                position: 'fixed',
                top: '5rem',
                left: '5rem',
                width: '288px',
                height: '288px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
                filter: 'blur(60px)'
            }} />

            <motion.div
                className="w-full max-w-md relative z-20"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center mb-8">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #db2777)' }}
                    >
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: 'white' }}>
                        Welcome Back
                    </h1>
                    <p className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Sign in to <span style={{ color: '#818cf8' }}>RelxPrep AI</span>
                    </p>
                </div>

                <div className="p-8 rounded-2xl" 
                     style={{ 
                         background: 'rgba(255,255,255,0.05)', 
                         backdropFilter: 'blur(24px)',
                         border: '1px solid rgba(255,255,255,0.1)'
                     }}>
                    {error && (
                        <div className="p-3 rounded-xl mb-4 text-sm" 
                             style={{ 
                                 background: 'rgba(239,68,68,0.1)', 
                                 border: '1px solid rgba(239,68,68,0.2)',
                                 color: '#f87171'
                             }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" 
                                   style={{ color: 'rgba(255,255,255,0.6)' }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" 
                                      style={{ color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 rounded-xl outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white'
                                    }}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" 
                                   style={{ color: 'rgba(255,255,255,0.6)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" 
                                      style={{ color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 pr-11 rounded-xl outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white'
                                    }}
                                    placeholder="Enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    style={{ color: 'rgba(255,255,255,0.3)' }}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                            style={{ 
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                opacity: loading ? 0.5 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Loading...' : 'Sign In'}
                        </button>

                        <div className="relative flex items-center py-1">
                            <div className="flex-grow" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                            <span className="mx-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>OR</span>
                            <div className="flex-grow" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                demoLogin();
                                navigate('/dashboard');
                            }}
                            className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            style={{ 
                                background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.3)',
                                color: '#a5b4fc'
                            }}
                        >
                            <Sparkles className="w-4 h-4" />
                            Quick Admin Login
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{ color: '#818cf8', fontWeight: 500 }}>
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Relax. Prepare. Succeed.
                </p>
            </motion.div>
        </div>
    );
}
