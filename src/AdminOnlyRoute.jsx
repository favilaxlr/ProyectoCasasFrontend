import { Navigate, Outlet } from "react-router";
import { useAuth } from './context/AuthContext';

function AdminOnlyRoute() {
    const { isLoading, isAuthenticated, user, isAdmin, isCoAdmin } = useAuth();

    const hasPanelAccess = () => {
        if (isAdmin || isCoAdmin) return true;
        const roleName = user?.role?.role;
        return roleName === 'admin' || roleName === 'co-admin';
    };

    // Si está cargando, mostrar loading
    if (isLoading) {
        return <h1>Cargando...</h1>;
    }

    // Si no está autenticado, redirigir a login
    if (!isLoading && !isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    // Si está autenticado pero no es admin ni co-admin, redirigir a home
    if (isAuthenticated && !hasPanelAccess()) {
        return <Navigate to='/' replace />;
    }

    return <Outlet />;
}

export default AdminOnlyRoute;