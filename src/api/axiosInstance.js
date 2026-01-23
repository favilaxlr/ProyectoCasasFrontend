import axios from 'axios';
import { ensureCsrfToken, clearCsrfToken } from '../utils/csrf';

const baseUrl = import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL.replace(/\/$/, '') : '';

const instance = axios.create({
    baseURL: `${baseUrl}/api`,
    withCredentials: true
});

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

instance.interceptors.request.use(
    async (config) => {
        const method = config.method?.toUpperCase();
        if (method && !SAFE_METHODS.includes(method)) {
            const csrfToken = await ensureCsrfToken();
            config.headers = config.headers || {};
            config.headers['x-csrf-token'] = csrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            const serverMessage = error.response?.data?.message?.[0];
            if (typeof serverMessage === 'string' && serverMessage.toLowerCase().includes('csrf')) {
                clearCsrfToken();
            }
        }

        return Promise.reject(error);
    }
);

export default instance;