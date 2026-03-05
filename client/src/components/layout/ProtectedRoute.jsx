import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
