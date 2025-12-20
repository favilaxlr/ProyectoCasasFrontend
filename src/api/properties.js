import axios from './axiosInstance';

// Llamadas para propiedades públicas (sin autenticación)
export const getAllPropertiesRequest = () => axios.get('/properties/public');
export const getPropertyRequest = (id) => axios.get('/properties/public/' + id);

// Llamadas para administración de propiedades (requieren autenticación)
export const getPropertiesRequest = () => axios.get('/properties');

export const createPropertyRequest = (property) => axios.post('/properties', property, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

export const updatePropertyRequest = (id, property) => axios.put('/properties/' + id, property);

export const deletePropertyRequest = (id) => axios.delete('/properties/' + id);

// Gestión de imágenes
export const addImagesRequest = (id, formData) => axios.post(`/properties/${id}/images`, formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

export const deleteImageRequest = (propertyId, imageId) => 
    axios.delete(`/properties/${propertyId}/images/${imageId}`);

export const setMainImageRequest = (propertyId, imageId) => 
    axios.put(`/properties/${propertyId}/images/${imageId}/main`);

// Gestión de estados
export const changePropertyStatusRequest = (id, status, reason) => 
    axios.put(`/properties/${id}/status`, { status, reason });

export const getPropertyHistoryRequest = (id) => 
    axios.get(`/properties/${id}/history`);