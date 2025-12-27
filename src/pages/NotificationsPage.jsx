import { useState, useEffect } from 'react';
import { getNotificationStatsRequest, getNotificationHistoryRequest, resendFailedNotificationsRequest } from '../api/notifications';
import { toast } from 'react-toastify';
import { IoStatsChartSharp, IoRefreshSharp, IoTimeSharp, IoCheckmarkCircleSharp, IoCloseCircleSharp, IoWarningSharp, IoPhonePortraitSharp, IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5';

function NotificationsPage() {
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resending, setResending] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        loadData();
        
        // Auto-refresh cada 30 segundos
        const interval = setInterval(() => {
            loadData();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const loadData = async (showToast = false) => {
        try {
            setLoading(true);
            const [statsRes, historyRes] = await Promise.all([
                getNotificationStatsRequest(),
                getNotificationHistoryRequest(1, 20) // Aumentado a 20 para ver más historial
            ]);
            
            setStats(statsRes.data);
            setHistory(historyRes.data.notifications);
            
            if (showToast) {
                toast.success('Datos actualizados');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error al cargar datos de notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async (notificationId) => {
        try {
            setResending(notificationId);
            const response = await resendFailedNotificationsRequest(notificationId);
            
            toast.success(`Reenvío completado: ${response.data.result.resent} mensajes enviados`);
            await loadData(true); // Recargar datos con toast
        } catch (error) {
            console.error('Error resending:', error);
            toast.error('Error al reenviar notificaciones');
        } finally {
            setResending(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <IoCheckmarkCircleSharp className="text-green-500" />;
            case 'failed':
                return <IoCloseCircleSharp className="text-red-500" />;
            case 'in_progress':
                return <IoTimeSharp className="text-yellow-500" />;
            default:
                return <IoWarningSharp className="text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'failed': return 'Fallido';
            case 'in_progress': return 'En Progreso';
            case 'pending': return 'Pendiente';
            default: return status;
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#C8A452' }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Panel de Notificaciones</h1>
                    <p className="text-gray-600 mt-2">Sistema de notificaciones masivas por SMS</p>
                </div>
                <button
                    onClick={() => loadData(true)}
                    className="text-white px-6 py-3 rounded-lg hover:opacity-90 flex items-center font-semibold transition-all"
                    style={{ backgroundColor: '#C8A452' }}
                >
                    <IoRefreshSharp className="mr-2" />
                    Actualizar
                </button>
            </div>

            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4" style={{ borderColor: '#C8A452' }}>
                        <div className="flex items-center">
                            <IoStatsChartSharp className="text-3xl mr-4" style={{ color: '#C8A452' }} />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Total Usuarios</h3>
                                <p className="text-3xl font-bold" style={{ color: '#C8A452' }}>{stats.totalUsers}</p>
                                <p className="text-sm text-gray-500">Usuarios registrados con teléfono</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                        <div className="flex items-center">
                            <IoCheckmarkCircleSharp className="text-3xl text-green-500 mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Notificaciones Enviadas</h3>
                                <p className="text-3xl font-bold text-green-600">
                                    {stats.recentNotifications.reduce((acc, n) => acc + n.stats.sentCount, 0)}
                                </p>
                                <p className="text-sm text-gray-500">Total histórico</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
                        <div className="flex items-center">
                            <IoWarningSharp className="text-3xl text-red-500 mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Envíos Fallidos</h3>
                                <p className="text-3xl font-bold text-red-600">
                                    {stats.recentNotifications.reduce((acc, n) => acc + n.stats.failedCount, 0)}
                                </p>
                                <p className="text-sm text-gray-500">Requieren atención</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial de Notificaciones */}
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Historial Reciente</h2>
                    <p className="text-gray-600 text-sm mt-1">Últimas notificaciones masivas enviadas</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Propiedad
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estadísticas
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Duración
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Detalles
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {history.map((notification) => (
                                <>
                                    <tr key={notification._id} className="hover:bg-gray-50 border-b border-gray-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(notification.status)}
                                                <span className="ml-2 text-sm font-medium">
                                                    {getStatusText(notification.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {notification.property?.title || 'Propiedad eliminada'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {notification.property?.address?.city || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex space-x-4">
                                                    <span className="text-green-600 flex items-center">
                                                        <IoCheckmarkCircleSharp className="mr-1" /> {notification.stats.sentCount}
                                                    </span>
                                                    {notification.stats.failedCount > 0 && (
                                                        <span className="text-red-600 flex items-center">
                                                            <IoCloseCircleSharp className="mr-1" /> {notification.stats.failedCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                de {notification.stats.totalUsers} usuarios
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDuration(notification.processingTime?.duration)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {notification.stats.failedCount > 0 && notification.status === 'completed' && (
                                                <button
                                                    onClick={() => handleResend(notification._id)}
                                                    disabled={resending === notification._id}
                                                    className="text-white px-3 py-1 rounded hover:opacity-90 disabled:opacity-50 font-medium transition-all"
                                                    style={{ backgroundColor: '#C8A452' }}
                                                >
                                                    {resending === notification._id ? (
                                                        <div className="flex items-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Reenviando...
                                                        </div>
                                                    ) : (
                                                        'Reenviar fallidos'
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => setExpandedRow(expandedRow === notification._id ? null : notification._id)}
                                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                {expandedRow === notification._id ? (
                                                    <IoChevronUpSharp className="h-5 w-5" />
                                                ) : (
                                                    <IoChevronDownSharp className="h-5 w-5" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRow === notification._id && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Enviados exitosamente */}
                                                    <div className="bg-white rounded-lg p-4 border border-green-200">
                                                        <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                                                            <IoCheckmarkCircleSharp className="mr-2" />
                                                            Enviados Exitosamente ({notification.results?.filter(r => r.success).length || 0})
                                                        </h4>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {notification.results?.filter(r => r.success).map((result, idx) => (
                                                                <div key={idx} className="text-sm p-2 bg-green-50 rounded flex items-start">
                                                                    <IoCheckmarkCircleSharp className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-900">{result.user?.username || 'Usuario'}</div>
                                                                        <div className="text-gray-600 text-xs">{result.user?.phone}</div>
                                                                        <div className="text-green-600 text-xs mt-1">✓ Mensaje enviado</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {notification.results?.filter(r => r.success).length === 0 && (
                                                                <p className="text-gray-500 text-sm">No hay envíos exitosos</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Fallidos */}
                                                    <div className="bg-white rounded-lg p-4 border border-red-200">
                                                        <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
                                                            <IoCloseCircleSharp className="mr-2" />
                                                            Fallos en Envío ({notification.results?.filter(r => !r.success).length || 0})
                                                        </h4>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {notification.results?.filter(r => !r.success).map((result, idx) => (
                                                                <div key={idx} className="text-sm p-2 bg-red-50 rounded flex items-start">
                                                                    <IoCloseCircleSharp className="text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                                                                    <div className="flex-1">
                                                                        <div className="font-medium text-gray-900">{result.user?.username || 'Usuario'}</div>
                                                                        <div className="text-gray-600 text-xs">{result.user?.phone}</div>
                                                                        <div className="text-red-600 text-xs mt-1">✗ {result.error || 'Error desconocido'}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {notification.results?.filter(r => !r.success).length === 0 && (
                                                                <p className="text-gray-500 text-sm">No hay fallos</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>

                {history.length === 0 && (
                    <div className="text-center py-12">
                        <IoStatsChartSharp className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Las notificaciones aparecerán aquí cuando se publiquen nuevas propiedades.
                        </p>
                    </div>
                )}
            </div>

            {/* Información del Sistema */}
            <div className="mt-8 rounded-lg p-6 border-l-4" style={{ backgroundColor: '#F5F5F5', borderColor: '#C8A452' }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={{ color: '#3C3C3C' }}>
                    <IoPhonePortraitSharp className="mr-2" style={{ color: '#C8A452' }} />
                    Sistema de Notificaciones Automáticas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: '#3C3C3C' }}>
                    <div>
                        <h4 className="font-semibold mb-2">Funcionamiento:</h4>
                        <ul className="space-y-1">
                            <li>• Envío automático al publicar propiedades</li>
                            <li>• Notificación a TODOS los usuarios registrados y verificados</li>
                            <li>• Procesamiento en lotes de 50 mensajes</li>
                            <li>• Reintentos automáticos para fallos</li>
                            <li>• Auto-actualización cada 30 segundos</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Configuración:</h4>
                        <ul className="space-y-1">
                            <li>• Intervalo entre lotes: 1 segundo</li>
                            <li>• Máximo 3 reintentos por número</li>
                            <li>• Tiempo límite: 10 minutos</li>
                            <li>• Los administradores no reciben SMS</li>
                            <li>• Historial muestra últimas 20 notificaciones</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotificationsPage;