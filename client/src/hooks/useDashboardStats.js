import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export function useDashboardStats(session) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await apiRequest('/api/dashboard/stats', {
                token: session?.access_token,
            });
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setError(err);
            // Fallback UI data
            setStats({
                todayStudyMinutes: 0,
                weekStudyMinutes: 0,
                upcomingExams: [],
                syllabusCompletion: 0,
                performanceLevel: 'Average',
                totalUnits: 0,
                completedUnits: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchStats();
        }
    }, [session]);

    return { stats, loading, error, refetch: fetchStats };
}
