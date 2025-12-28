import axios from 'axios';

const instance = axios.create({
    //baseURL: 'http://localhost:4000/api',
    baseURL: import.meta.env.VITE_BASE_URL + '/api',
    withCredentials: true
});

// Interceptor para agregar el token de localStorage al header de cada petición
instance.interceptors.request.use(
    (config) => {
        // Intentar obtener el token de localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
            // Si existe, agregarlo al header Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;