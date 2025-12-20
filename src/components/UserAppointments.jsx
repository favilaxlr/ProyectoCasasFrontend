import { useState, useEffect } from 'react';
import { getUserAppointmentsRequest, cancelAppointmentRequest } from '../api/appointments';

function UserAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const response = await getUserAppointmentsRequest();
            setAppointments(response.data);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (appointmentId) => {
        const reason = prompt('¿Por qué deseas cancelar esta cita? (opcional)');
        if (reason === null) return; // Usuario canceló el prompt
        
        try {
            await cancelAppointmentRequest(appointmentId, reason);
            alert('Cita cancelada exitosamente');
            loadAppointments();
        } catch (error) {
            console.error('Error canceling appointment:', error);
            alert('Error al cancelar la cita');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            'pending': 'Pendiente de confirmación',
            'confirmed': 'Confirmada',
            'completed': 'Completada',
            'cancelled': 'Cancelada'
        };
        return texts[status] || status;
    };

    const formatDateTime = (date, time) => {
        const appointmentDate = new Date(date);
        return `${appointmentDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })} a las ${time}`;
    };

    const canCancel = (appointment) => {
        return ['pending', 'confirmed'].includes(appointment.status) && 
               new Date(appointment.appointmentDate) > new Date();
    };

    const canReview = (appointment) => {
        return appointment.status === 'completed' && 
               new Date(appointment.appointmentDate) < new Date();
    };

    if (loading) return <div className="text-center py-8">Cargando tus citas...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Mis Citas</h2>

            {appointments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">No tienes citas agendadas</div>
                    <button 
                        onClick={() => window.location.href = '/properties'}
                        className="btn-primary"
                    >
                        Explorar Propiedades
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment) => (
                        <div key={appointment._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        {/* Imagen de la propiedad */}
                                        {appointment.property?.images?.[0] && (
                                            <img
                                                src={appointment.property.images[0].url}
                                                alt={appointment.property.title}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        )}
                                        
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {appointment.property?.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {appointment.property?.address?.street}, {appointment.property?.address?.city}
                                            </p>
                                            <p className="text-gray-800 font-medium">
                                                {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                                            </p>
                                            {appointment.notes && (
                                                <p className="text-gray-600 text-sm mt-2">
                                                    <strong>Nota:</strong> {appointment.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end gap-3">
                                    {/* Estado */}
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                        {getStatusText(appointment.status)}
                                    </span>

                                    {/* Acciones */}
                                    <div className="flex gap-2">
                                        {canCancel(appointment) && (
                                            <button
                                                onClick={() => handleCancel(appointment._id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Cancelar Cita
                                            </button>
                                        )}
                                        
                                        {canReview(appointment) && (
                                            <button
                                                onClick={() => window.location.href = `/properties/${appointment.property._id}#reviews`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Escribir Reseña
                                            </button>
                                        )}

                                        <button
                                            onClick={() => window.location.href = `/properties/${appointment.property._id}`}
                                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                        >
                                            Ver Propiedad
                                        </button>
                                    </div>

                                    {/* Código de confirmación si está pendiente */}
                                    {appointment.status === 'pending' && appointment.confirmationCode && (
                                        <div className="text-xs text-gray-500">
                                            Código: {appointment.confirmationCode}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Información adicional */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Información sobre las citas:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Las citas pendientes serán confirmadas por nuestro equipo</li>
                    <li>• Puedes cancelar citas hasta el día de la visita</li>
                    <li>• Después de una cita completada, puedes escribir una reseña</li>
                    <li>• Máximo 2 citas activas por usuario</li>
                </ul>
            </div>
        </div>
    );
}

export default UserAppointments;