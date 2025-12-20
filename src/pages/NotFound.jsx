import { Navigate } from "react-router";

function NotFound() {
    return (
        <Navigate to='/products' replace />
    )
}

export default NotFound