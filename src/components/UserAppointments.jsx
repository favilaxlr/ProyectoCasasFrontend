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
        const reason = prompt('Why do you want to cancel this appointment? (optional)');
        if (reason === null) return; // Usuario canceló el prompt
        
        try {
            await cancelAppointmentRequest(appointmentId, reason);
            alert('Appointment canceled successfully');
            loadAppointments();
        } catch (error) {
            console.error('Error canceling appointment:', error);
            alert('Error canceling appointment');
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
            'pending': 'Pending Confirmation',
            'confirmed': 'Confirmed',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status;
    };

    const formatDateTime = (date, time) => {
        const appointmentDate = new Date(date);
        return `${appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })} at ${time}`;
    };

    const canCancel = (appointment) => {
        return ['pending', 'confirmed'].includes(appointment.status) && 
               new Date(appointment.appointmentDate) > new Date();
    };

    const canReview = (appointment) => {
        return appointment.status === 'completed' && 
               new Date(appointment.appointmentDate) < new Date();
    };

    if (loading) return <div className="text-center py-8">Loading your appointments...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Appointments</h2>

            {appointments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">You have no appointments scheduled</div>
                    <button 
                        onClick={() => window.location.href = '/properties'}
                        className="btn-primary"
                    >
                        Browse Properties
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
                                                    <strong>Note:</strong> {appointment.notes}
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
                                                Cancel Appointment
                                            </button>
                                        )}
                                        
                                        {canReview(appointment) && (
                                            <button
                                                onClick={() => window.location.href = `/properties/${appointment.property._id}#reviews`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Write Review
                                            </button>
                                        )}

                                        <button
                                            onClick={() => window.location.href = `/properties/${appointment.property._id}`}
                                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                        >
                                            View Property
                                        </button>
                                    </div>

                                    {/* Código de confirmación si está pendiente */}
                                    {appointment.status === 'pending' && appointment.confirmationCode && (
                                        <div className="text-xs text-gray-500">
                                            Code: {appointment.confirmationCode}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Additional Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Information about appointments:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Pending appointments will be confirmed by our team</li>
                    <li>• You can cancel appointments until the day of the visit</li>
                    <li>• After a completed appointment, you can write a review</li>
                    <li>• Maximum 2 active appointments per user</li>
                </ul>
            </div>
        </div>
    );
}

export default UserAppointments;