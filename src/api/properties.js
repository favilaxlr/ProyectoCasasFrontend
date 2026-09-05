import axios from './axiosInstance';

// Llamadas para propiedades públicas (sin autenticación)
export const getAllPropertiesRequest = () => axios.get('/properties/public');
export const getPropertyRequest = (id) => axios.get('/properties/public/' + id);

// Llamadas para administración de propiedades (requieren autenticación)
export const getPropertiesRequest = () => axios.get('/properties');

export const createPropertyRequest = (property) => axios.post('/properties', property, {
    timeout: 90000
});

export const updatePropertyRequest = (id, property) => axios.put('/properties/' + id, property);

export const deletePropertyRequest = (id) => axios.delete('/properties/' + id);

// Gestión de imágenes
export const addImagesRequest = (id, formData) => axios.post(`/properties/${id}/images`, formData, {
    timeout: 90000
});

export const deleteImageRequest = (propertyId, imageId) => 
    axios.delete(`/properties/${propertyId}/images/${imageId}`);

export const setMainImageRequest = (propertyId, imageId) => 
    axios.put(`/properties/${propertyId}/images/${imageId}/main`);

// Gestión de documentos
export const uploadDocumentsRequest = (propertyId, formData) => 
    axios.post(`/properties/${propertyId}/documents`, formData, {
        timeout: 90000
    });

// Gestión de videos
export const uploadVideosRequest = (propertyId, formData) => 
    axios.post(`/properties/${propertyId}/videos`, formData, {
        timeout: 120000
    });

export const deleteVideoRequest = (propertyId, videoId) => 
    axios.delete(`/properties/${propertyId}/videos/${videoId}`);

// Gestión de estados
export const changePropertyStatusRequest = (id, status, reason) => 
    axios.put(`/properties/${id}/status`, { status, reason });

export const getPropertyHistoryRequest = (id) => 
    axios.get(`/properties/${id}/history`);