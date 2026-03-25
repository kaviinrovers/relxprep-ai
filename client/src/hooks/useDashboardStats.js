import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export function useDashboardStats(session) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        // Skip API call in demo mode
        if (!session?.access_token || session.access_token === 'demo-token') {
            setStats({
                todayStudyMinutes: 45,
                weekStudyMinutes: 320,
                upcomingExams: [
                    { id: 1, subject: 'DBMS', exam_date: new Date(Date.now() + 5 * 86400000).toISOString() },
                    { id: 2, subject: 'Operating Systems', exam_date: new Date(Date.now() + 12 * 86400000).toISOString() },
                ],
                syllabusCompletion: 42,
                performanceLevel: 'Good',
                totalUnits: 8,
                completedUnits: 3,
                isDemo: true,
            });
            setLoading(false);
            return;
        }

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
                isDemo: true
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
