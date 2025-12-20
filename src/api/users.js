import axios from './axiosInstance';

export const getUsersRequest = () => axios.get('/admin/users');

export const getUserRequest = (id) => axios.get(`/admin/users/${id}`);

export const changeUserRoleRequest = (id, data) => axios.put(`/admin/users/${id}/role`, data);

export const deleteUserRequest = (id) => axios.delete(`/admin/users/${id}`);

export const getRolesRequest = () => axios.get('/admin/roles');