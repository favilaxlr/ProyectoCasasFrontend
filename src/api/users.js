import axios from './axiosInstance';

export const getUsersRequest = () => axios.get('/admin/users');

export const getUserRequest = (id) => axios.get(`/admin/users/${id}`);

export const changeUserRoleRequest = (id, data) => axios.put(`/admin/users/${id}/role`, data);

export const deleteUserRequest = (id) => axios.delete(`/admin/users/${id}`);

export const getRolesRequest = () => axios.get('/admin/roles');

export const updateProfileRequest = (data) => axios.put('/admin/profile', data);

export const changePasswordRequest = (data) => axios.put('/admin/profile/password', data);

export const updateProfileImageRequest = (formData) => axios.put('/admin/profile/image', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});