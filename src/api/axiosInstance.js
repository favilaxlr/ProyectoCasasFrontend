import axios from 'axios';
import { ensureCsrfToken, clearCsrfToken } from '../utils/csrf';
import { getAuthToken, clearAuthToken } from '../utils/authToken';

const resolveBaseUrl = () => {
    const rawUrl = import.meta.env.VITE_BASE_URL || '';
    let normalizedUrl = rawUrl.replace(/\/$/, '');

    if (typeof window !== 'undefined' && normalizedUrl.includes('localhost')) {
        try {
            const parsed = new URL(normalizedUrl);
            parsed.hostname = window.location.hostname;
            normalizedUrl = parsed.origin;
        } catch (error) {
            console.warn('Could not normalize API base URL:', error);
        }
    }

    return normalizedUrl;
};

const baseUrl = resolveBaseUrl();

const instance = axios.create({
    baseURL: `${baseUrl}/api`,
    withCredentials: true
});

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

instance.interceptors.request.use(
    async (config) => {
        const authToken = getAuthToken();
        if (authToken) {
            config.headers = config.headers || {};
            if (!config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${authToken}`;
            }
        }

        const method = config.method?.toUpperCase();
        if (method && !SAFE_METHODS.includes(method)) {
            const csrfToken = await ensureCsrfToken();
            config.headers = config.headers || {};
            config.headers['x-csrf-token'] = csrfToken;
        }

        return config;
    },
    (error) => {
        if (response?.status === 401 || response?.status === 403) {
            clearAuthToken();
        }

        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (import.meta.env.DEV) {
            console.error('API request failed:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                message: error.message,
            });
        }

        const { config, response } = error || {};
        const serverMessage = response?.data?.message?.[0];
        const isCsrfError = response?.status === 403 && typeof serverMessage === 'string' && serverMessage.toLowerCase().includes('csrf');

        if (isCsrfError && config && !config.__isRetryRequest) {
            config.__isRetryRequest = true;

            try {
                clearCsrfToken();
                const freshToken = await ensureCsrfToken();
                config.headers = config.headers || {};
                config.headers['x-csrf-token'] = freshToken;
                return instance(config);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        if (isCsrfError) {
            clearCsrfToken();
        }

        return Promise.reject(error);
    }
);

export default instance;