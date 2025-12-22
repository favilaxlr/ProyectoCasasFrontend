import { Navigate, Outlet } from "react-router"
import {useAuth} from './context/AuthContext';

function ProtectedRoute() {
    const {isLoading, isAuthenticated} = useAuth();

    //si esta cargando la app los datos retona cargando en un h1
    if (isLoading){
        return <h1>cargando...</h1>
    }

    //si la aplicacion no esta cargando
    //y ademas no esta autenticado, entonces redirige a /login
    if (!isLoading && !isAuthenticated)
        return <Navigate to='/login' replace />

    return ( <Outlet />)
}

export default ProtectedRoute