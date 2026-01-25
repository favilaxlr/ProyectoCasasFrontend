import { useState, useEffect } from 'react';
import { getPendingOffersRequest } from '../api/offers';
import { getAppointmentsRequest } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para obtener el conteo de notificaciones pendientes
 * Se actualiza automáticamente cada 30 segundos
 */
export const useNotificationCount = () => {
    const [pendingOffersCount, setPendingOffersCount] = useState(0);
    const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState(0);
    const { isAuthenticated, isAdmin, isCoAdmin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const fetchCounts = async () => {
        if (!isAuthenticated) return;
        
        try {
            setIsLoading(true);
            
            // Para admin y co-admin: obtener ofertas pendientes
            if (isAdmin || isCoAdmin) {
                const [offersRes, pendingAppointmentsRes, pendingSmsRes] = await Promise.all([
                    getPendingOffersRequest(),
                    getAppointmentsRequest({ status: 'pending' }),
                    getAppointmentsRequest({ status: 'pending_sms_confirmation' })
                ]);

                setPendingOffersCount(offersRes.data?.length || 0);

                const totalPendingAppointments = (pendingAppointmentsRes.data?.length || 0) +
                    (pendingSmsRes.data?.length || 0);
                setPendingAppointmentsCount(totalPendingAppointments);
            } else {
                setPendingOffersCount(0);
                setPendingAppointmentsCount(0);
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
        pendingAppointmentsCount,
        isLoading,
        refresh: fetchCounts
    };
};
