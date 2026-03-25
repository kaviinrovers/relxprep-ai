// RelxPrep AI - API Service
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Timeout wrapper for fetch
function fetchWithTimeout(url, options, timeoutMs = 30000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, { ...options, signal: controller.signal })
        .then((res) => {
            clearTimeout(timer);
            return res;
        })
        .catch((err) => {
            clearTimeout(timer);
            if (err.name === 'AbortError') {
                throw new Error('Request timed out. The server may be starting up — please try again in 30 seconds.');
            }
            throw err;
        });
}

// Retry wrapper
async function fetchWithRetry(url, options, { retries = 1, timeoutMs = 30000 } = {}) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fetchWithTimeout(url, options, timeoutMs);
        } catch (err) {
            if (attempt === retries) throw err;
            console.warn(`API attempt ${attempt + 1} failed, retrying...`);
            await new Promise((r) => setTimeout(r, 2000));
        }
    }
}

export async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body, token, timeout = 30000 } = options;

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetchWithRetry(
            `${API_BASE}${endpoint}`,
            config,
            { retries: 1, timeoutMs: timeout }
        );
        const contentType = response.headers.get('content-type');

        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const errorMessage = (data && data.message) || data || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        // Improve error message for common network failures
        if (error.message === 'Failed to fetch') {
            console.error(`API Request Error [${endpoint}]: Server unreachable at ${API_BASE}`);
            throw new Error('Cannot connect to server. Please check your internet connection or try again shortly.');
        }
        console.error(`API Request Error [${endpoint}]:`, error);
        throw error;
    }
}

export async function apiUpload(endpoint, formData, token) {
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetchWithRetry(
            `${API_BASE}${endpoint}`,
            {
                method: 'POST',
                headers,
                body: formData,
            },
            { retries: 1, timeoutMs: 60000 }
        );

        const contentType = response.headers.get('content-type');

        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const errorMessage = (data && data.message) || data || `HTTP ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            console.error(`API Upload Error [${endpoint}]: Server unreachable at ${API_BASE}`);
            throw new Error('Cannot connect to server. Please check your internet connection or try again shortly.');
        }
        console.error(`API Upload Error [${endpoint}]:`, error);
        throw error;
    }
}
