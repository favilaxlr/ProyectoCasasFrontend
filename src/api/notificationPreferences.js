import axios from './axiosInstance';

export const getNotificationCitiesRequest = () => axios.get('/notification-cities');

export const updateUserNotificationPreferencesRequest = (userId, data) =>
    axios.put(`/admin/users/${userId}/notification-preferences`, data);

export const updateOwnNotificationPreferencesRequest = (data) =>
    axios.put('/admin/profile/notification-preferences', data);
