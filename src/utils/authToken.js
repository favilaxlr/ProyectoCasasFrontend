const STORAGE_KEY = 'frinvest_auth_token';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const setAuthToken = (token) => {
    if (!isBrowser()) return;
    if (!token) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
    }
    window.localStorage.setItem(STORAGE_KEY, token);
};

export const getAuthToken = () => {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(STORAGE_KEY);
};

export const clearAuthToken = () => {
    if (!isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEY);
};
