import axios from './axiosInstance';

//request para registrar usuarios
export const registerRequest = user => axios.post('/register', user);

//request para iniciar sesion
export const loginRequest = user => axios.post('/login', user);

//request para validar el token de inicio de sesion
export const verifyTokenRequest = () => axios.get('/verify');


//request para cerrar sesion en el backend
export const logOutRequest = () => axios.post('/logout');