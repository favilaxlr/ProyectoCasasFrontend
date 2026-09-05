import axios from './axiosInstance';

export const createListingRequestRequest = (formData) =>
    axios.post('/listing-requests', formData);

export const getListingRequestsRequest = (params = {}) =>
    axios.get('/listing-requests', { params });

export const getListingRequestRequest = (id) =>
    axios.get(`/listing-requests/${id}`);

export const updateListingRequestStatusRequest = (id, status) =>
    axios.put(`/listing-requests/${id}/status`, { status });
