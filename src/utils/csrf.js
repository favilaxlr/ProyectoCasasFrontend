const normalizeBaseUrl = (url = '') => {
    if (!url) return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_BASE_URL;
    if (envUrl) {
        return normalizeBaseUrl(envUrl);
    }

    if (typeof window !== 'undefined' && window.location?.origin) {
        return normalizeBaseUrl(window.location.origin);
    }

    return '';
};

const joinUrl = (base, path) => {
    if (!base) return path;
    return `${base}${path}`;
};

const CSRF_ENDPOINT = joinUrl(getBaseUrl(), '/api/csrf-token');

let csrfToken = null;
let inflightRequest = null;

const fetchCsrfToken = async () => {
    const response = await fetch(CSRF_ENDPOINT, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('No se pudo obtener el token CSRF');
    }

    const data = await response.json();
    if (!data?.csrfToken) {
        throw new Error('Token CSRF inválido');
    }

    csrfToken = data.csrfToken;
    return csrfToken;
};

export const ensureCsrfToken = async () => {
    if (csrfToken) {
        return csrfToken;
    }

    if (!inflightRequest) {
        inflightRequest = fetchCsrfToken()
            .finally(() => {
                inflightRequest = null;
            });
    }

    return inflightRequest;
};

export const clearCsrfToken = () => {
    csrfToken = null;
};
