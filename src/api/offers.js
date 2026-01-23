import axios from './axiosInstance';

// ========== USER ENDPOINTS ==========

// Verificar si existe una oferta activa para una propiedad
export const checkExistingOfferRequest = (propertyId) => axios.get(`/offers/check/${propertyId}`);

// Crear una oferta para una propiedad
export const createOfferRequest = (data) => axios.post('/offers', data);

// Obtener todas las ofertas del usuario
export const getUserOffersRequest = () => axios.get('/offers/my-offers');

// Obtener una oferta específica del usuario
export const getUserOfferRequest = (id) => axios.get(`/offers/my-offers/${id}`);

// Enviar mensaje en una oferta del usuario
export const sendOfferMessageRequest = (id, content) => 
    axios.post(`/offers/my-offers/${id}/messages`, { content });

// ========== ADMIN/CO-ADMIN ENDPOINTS ==========

// Obtener ofertas pendientes (no asignadas)
export const getPendingOffersRequest = () => axios.get('/offers/pending');

// Obtener ofertas asignadas al admin/co-admin
export const getMyAssignedOffersRequest = () => axios.get('/offers/assigned');

// Tomar una oferta pendiente
export const takeOfferRequest = (id) => axios.post(`/offers/${id}/take`);

// Obtener detalles de una oferta asignada
export const getAssignedOfferRequest = (id) => axios.get(`/offers/assigned/${id}`);

// Enviar mensaje en una oferta asignada (admin)
export const sendAdminMessageRequest = (id, content) => 
    axios.post(`/offers/assigned/${id}/messages`, { content });

// Actualizar estado de una oferta
export const updateOfferStatusRequest = (id, status) => 
    axios.put(`/offers/${id}/status`, { status });

// Obtener todas las ofertas (admin principal)
export const getAllOffersRequest = () => axios.get('/offers/all');
