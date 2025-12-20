import axios from './axiosInstance';

// APIs públicas
export const getPropertyReviewsRequest = (propertyId, params = {}) => 
    axios.get(`/properties/${propertyId}/reviews`, { params });

// APIs para usuarios registrados
export const createReviewRequest = (formData) => 
    axios.post('/reviews', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

export const voteHelpfulRequest = (reviewId) => 
    axios.post(`/reviews/${reviewId}/helpful`);

// APIs para admin/co-admin
export const getPendingReviewsRequest = () => 
    axios.get('/reviews/pending');

export const moderateReviewRequest = (reviewId, data) => 
    axios.put(`/reviews/${reviewId}/moderate`, data);

// APIs solo para admin
export const toggleFeaturedReviewRequest = (reviewId) => 
    axios.put(`/reviews/${reviewId}/featured`);