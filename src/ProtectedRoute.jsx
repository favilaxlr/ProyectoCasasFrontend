import { Navigate, Outlet } from "react-router"
import {useAuth} from './context/AuthContext';

function ProtectedRoute() {
    const {isLoading, isAuthenticated} = useAuth();

    // If the app is loading data, return loading in an h1
    if (isLoading){
        return <h1>Loading...</h1>
    }

    // If the application is not loading
    // and also not authenticated, then redirect to /login
    if (!isLoading && !isAuthenticated)
        return <Navigate to='/login' replace />

    return ( <Outlet />)
}

export default ProtectedRoute