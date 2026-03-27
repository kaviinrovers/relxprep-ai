import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth initialization timeout - proceeding anyway');
                setLoading(false);
            }
        }, 6000);

        const initAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (!mounted) return;
                
                if (sessionError) {
                    console.error('Session error:', sessionError.message);
                    setError(sessionError.message);
                    setLoading(false);
                    clearTimeout(timeoutId);
                    return;
                }
                
                if (session) {
                    setSession(session);
                    setUser(session.user);
                }
                
                setLoading(false);
                clearTimeout(timeoutId);
            } catch (err) {
                if (!mounted) return;
                console.error('Auth initialization failed:', err.message);
                setError(err.message);
                setLoading(false);
                clearTimeout(timeoutId);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;
            
            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
            } else if (session) {
                setSession(session);
                setUser(session.user);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setUser(null);
            setSession(null);
        }
    };

    const value = {
        user,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
