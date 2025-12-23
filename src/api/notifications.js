import axiosInstance from './axiosInstance';

export const getNotificationStatsRequest = () => 
    axiosInstance.get('/admin/notifications/stats');

export const getNotificationHistoryRequest = (page = 1, limit = 20) => 
    axiosInstance.get(`/admin/notifications/history?page=${page}&limit=${limit}`);

export const getNotificationDetailsRequest = (id) => 
    axiosInstance.get(`/admin/notifications/${id}`);

export const resendFailedNotificationsRequest = (id) => 
    axiosInstance.post(`/admin/notifications/${id}/resend`);

export const previewMessageRequest = (propertyId) => 
    axiosInstance.get(`/admin/notifications/preview/${propertyId}`);