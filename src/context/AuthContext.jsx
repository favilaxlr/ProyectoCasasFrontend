import { createContext, useState, useContext, useEffect } from "react";
import { registerRequest, loginRequest, verifyTokenRequest, logOutRequest } from "../api/auth";
import Cookies from 'js-cookie';

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
            //console.log(res.data);
            setUser(res.data);
            setIsAuthenticated(true);
            setIsLoading(false);
        } catch (error) {
            //console.log(error)
            //si existe un error al registrar el usuario
            //guardamos el error en la variable error
            setErrors(error.response.data.message);
        }
    }; //fin de signup

    const signIn = async (user) => {
        try {
            const res = await loginRequest(user);
            //console.log(res);                         // = <-- Asignacion
            // Verificar roles
            if (res.data.role?.role === 'admin') {
                setIsAdmin(true);
            } else if (res.data.role?.role === 'co-admin') {
                setIsCoAdmin(true);
            } 
            setUser(res.data);
            setIsAuthenticated(true);
            setIsLoading(false)
        } catch (error) {
            //console.log(error);
            setErrors(error.response.data.message);
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
        async function checkLogin() {
            const cookies = Cookies.get();
            
            if (!cookies.token) {
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
                setIsAdmin(false);
                setIsCoAdmin(false);
                return;
            }

            try {
                const res = await verifyTokenRequest(cookies.token);
                if (!res.data) {
                    throw new Error('No data received');
                }

                setIsAuthenticated(true);
                setUser(res.data);
                setIsLoading(false);
                
                if (res.data.role === 'admin') {
                    setIsAdmin(true);
                } else if (res.data.role === 'co-admin') {
                    setIsCoAdmin(true);
                }

            } catch (error) {
                Cookies.remove('token');
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
                setIsAdmin(false);
                setIsCoAdmin(false);
            }
        }

        checkLogin();
    }, []);

    //funcion para cerrar sesion en el backend
    const logOut = () => {
        logOutRequest();
        Cookies.remove('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsCoAdmin(false);
        setUser(null);
        setIsLoading(true);
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
            isCoAdmin
        }}>
            {children}
        </AuthContext.Provider>
    )
}; //fin de AuthProvider