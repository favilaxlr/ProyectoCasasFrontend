import { Navigate, Outlet } from "react-router";
import { useAuth } from './context/AuthContext';

function AdminOnlyRoute() {
    const { isLoading, isAuthenticated, user } = useAuth();

    // Si está cargando, mostrar loading
    if (isLoading) {
        return <h1>Cargando...</h1>;
    }

    // Si no está autenticado, redirigir a login
    if (!isLoading && !isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    // Si está autenticado pero no es admin, redirigir a home
    if (isAuthenticated && user?.role?.role !== 'admin') {
        return <Navigate to='/' replace />;
    }

    return <Outlet />;
}

export default AdminOnlyRoute;