import { useState, useEffect } from 'react';
import { getPendingOffersRequest } from '../api/offers';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para obtener el conteo de notificaciones pendientes
 * Se actualiza automáticamente cada 30 segundos
 */
export const useNotificationCount = () => {
    const [pendingOffersCount, setPendingOffersCount] = useState(0);
    const { isAuthenticated, isAdmin, isCoAdmin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const fetchCounts = async () => {
        if (!isAuthenticated) return;
        
        try {
            setIsLoading(true);
            
            // Para admin y co-admin: obtener ofertas pendientes
            if (isAdmin || isCoAdmin) {
                const offersRes = await getPendingOffersRequest();
                setPendingOffersCount(offersRes.data?.length || 0);
            }
        } catch (error) {
            console.error('Error fetching notification counts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCounts();

        // Actualizar cada 30 segundos
        const interval = setInterval(fetchCounts, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated, isAdmin, isCoAdmin]);

    return {
        pendingOffersCount,
        isLoading,
        refresh: fetchCounts
    };
};
