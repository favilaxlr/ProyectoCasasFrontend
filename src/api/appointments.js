import axios from './axiosInstance';

export const createAppointmentRequest = (data) => axios.post('/appointments', data);

export const getAppointmentsRequest = (params = {}) => axios.get('/appointments', { params });

export const getAppointmentRequest = (id) => axios.get(`/appointments/${id}`);

export const confirmAppointmentRequest = (data) => axios.post('/appointments/confirm', data);

export const cancelAppointmentRequest = (id, reason) => 
    axios.put(`/appointments/${id}/cancel`, { reason });

export const confirmAppointmentAdminRequest = (id) => 
    axios.put(`/appointments/${id}/confirm`);

export const assignAppointmentRequest = (id) => 
    axios.put(`/appointments/${id}/assign`);

export const completeAppointmentRequest = (id) => 
    axios.put(`/appointments/${id}/complete`);

export const getAvailableSlotsRequest = (propertyId, date) => 
    axios.get('/appointments/available-slots', { params: { propertyId, date } });

export const getUserAppointmentsRequest = () => 
    axios.get('/my-appointments');

export const deleteAllAppointmentsRequest = () => 
    axios.delete('/appointments/clear-all');