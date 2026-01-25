import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest, logOutRequest } from "../api/auth";
import { clearCsrfToken } from "../utils/csrf";
import { setAuthToken, clearAuthToken, getAuthToken } from "../utils/authToken";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth debe estar definido en un contexto');

    return context;
}; //fin de useAuth

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCoAdmin, setIsCoAdmin] = useState(false);

    const signUp = async (user) => {
        try {
            // Excluir el campo 'confirm' antes de enviar al backend
            const { confirm, ...userData } = user;
            const res = await registerRequest(userData);
            
            // No autenticar automáticamente, el usuario debe verificar primero
            // Retornar el email para redirigir a la página de verificación
            return { success: true, email: res.data.email };
        } catch (error) {
            //si existe un error al registrar el usuario
            //guardamos el error en la variable error
            setErrors(error.response.data.message);
            
            // Si el backend indica que necesita verificación, redirigir
            if (error.response?.data?.needsVerification) {
                return { 
                    success: false, 
                    needsVerification: true, 
                    email: error.response.data.email 
                };
            }
            
            return { success: false };
        }
    }; //fin de signup

    const signIn = async (user) => {
        try {
            const res = await loginRequest(user);
            
            // Verificar que la respuesta exista
            if (!res || !res.data) {
                throw new Error('No se recibió respuesta del servidor');
            }
            
            // Verificar roles
            if (res.data.role?.role === 'admin') {
                setIsAdmin(true);
                setIsCoAdmin(false);
            } else if (res.data.role?.role === 'co-admin') {
                setIsAdmin(false);
                setIsCoAdmin(true);
            } else {
                setIsAdmin(false);
                setIsCoAdmin(false);
            }
            setUser(res.data);
            setIsAuthenticated(true);
            setIsLoading(false);
            if (res.data.token) {
                setAuthToken(res.data.token);
            }
            return { success: true };
        } catch (error) {
            console.error('Error en signIn:', error);
            
            // Verificar si el usuario necesita verificación
            if (error.response?.data?.needsVerification) {
                return { 
                    success: false, 
                    needsVerification: true,
                    email: user.email 
                };
            }
            
            // Manejar diferentes tipos de errores
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                setErrors(['No se puede conectar al servidor. Verifica que el backend esté corriendo.']);
            } else if (error.response?.data?.message) {
                setErrors(error.response.data.message);
            } else if (error.message) {
                setErrors([error.message]);
            } else {
                setErrors(['Error desconocido al iniciar sesión']);
            }
            
            setIsLoading(false);
            return { success: false };
        }
    }; //fin de signIn

    //use effect que vacia el arreglo de errores pasados 5 segundos
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 5000)
            return () => clearTimeout(timer);
        }//fin de if
    }, [errors]); //fin de useeffect

    //useEffect para verificar la sesion del usuario
    useEffect(() => {
        let isMounted = true;

        async function checkLogin() {
            try {
                const storedToken = getAuthToken();
                const hasCookieToken = typeof document !== 'undefined' && document.cookie?.includes('token=');
                if (!storedToken && !hasCookieToken) {
                    setIsAuthenticated(false);
                    setUser(null);
                    setIsAdmin(false);
                    setIsCoAdmin(false);
                    return;
                }
                const res = await verifyTokenRequest();
                if (!isMounted) return;

                if (!res?.data) {
                    throw new Error('No data received');
                }

                setIsAuthenticated(true);
                setUser(res.data);
                
                if (res.data.role?.role === 'admin') {
                    setIsAdmin(true);
                    setIsCoAdmin(false);
                } else if (res.data.role?.role === 'co-admin') {
                    setIsAdmin(false);
                    setIsCoAdmin(true);
                } else {
                    setIsAdmin(false);
                    setIsCoAdmin(false);
                }

            } catch (error) {
                if (!isMounted) return;
                setIsAuthenticated(false);
                setUser(null);
                setIsAdmin(false);
                setIsCoAdmin(false);
                clearAuthToken();
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        checkLogin();

        return () => {
            isMounted = false;
        };
    }, []);

    //funcion para cerrar sesion en el backend
    const logOut = async () => {
        try {
            await logOutRequest();
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        } finally {
            clearCsrfToken();
            clearAuthToken();
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsCoAdmin(false);
            setUser(null);
            setIsLoading(false);
        }
    }

    // Función para actualizar datos del usuario
    const updateUserData = (newData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...newData
        }));
    }

    // Función para autenticar usuario después de verificación
    const authenticateUser = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Verificar roles correctamente (userData.role puede ser un objeto o string)
        const userRole = typeof userData.role === 'object' ? userData.role.role : userData.role;
        setIsAdmin(userRole === 'admin');
        setIsCoAdmin(userRole === 'co-admin');
        setErrors([]);
        if (userData.token) {
            setAuthToken(userData.token);
        }
    }

    return (
        <AuthContext.Provider value={{
            logOut,
            signUp,
            signIn,
            user,
            isAuthenticated,
            errors,
            isLoading,
            isAdmin,
            isCoAdmin,
            updateUserData,
            authenticateUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}; //fin de AuthProvider