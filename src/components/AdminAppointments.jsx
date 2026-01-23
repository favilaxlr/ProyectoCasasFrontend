import { useState, useEffect } from 'react';
import { 
    getAppointmentsRequest, 
    confirmAppointmentAdminRequest,
    assignAppointmentRequest,
    completeAppointmentRequest,
    cancelAppointmentRequest,
    deleteAllAppointmentsRequest
} from '../api/appointments';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function AdminAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingAll, setDeletingAll] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadAppointments();
    }, [filters]);

    const loadAppointments = async () => {
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await getAppointmentsRequest(params);
            setAppointments(response.data);
        } catch (error) {
            console.error('Error loading appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, action) => {
        try {
            let message = '';
            
            switch (action) {
                case 'confirm':
                    await confirmAppointmentAdminRequest(appointmentId);
                    message = 'Appointment confirmed';
                    break;
                case 'assign':
                    await assignAppointmentRequest(appointmentId);
                    message = 'Appointment assigned successfully. The client has been notified.';
                    break;
                case 'complete':
                    await completeAppointmentRequest(appointmentId);
                    message = 'Appointment marked as completed';
                    break;
                case 'cancel':
                    const reason = prompt('Cancellation reason (optional):');
                    await cancelAppointmentRequest(appointmentId, reason);
                    message = 'Appointment cancelled';
                    break;
            }
            
            alert(message);
            loadAppointments();
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Error updating appointment');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'pending_sms_confirmation': 'bg-orange-100 text-orange-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            'pending': 'Pending',
            'pending_sms_confirmation': 'Pending SMS Confirmation',
            'confirmed': 'Confirmed',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status;
    };

    const handleDeleteAll = async () => {
        if (!user || user.role?.role !== 'admin') {
            toast.error('Only main admin can delete all appointments');
            return;
        }

        const confirmDelete = window.confirm(
            `⚠️ WARNING: This will permanently delete ALL ${appointments.length} appointments from the database.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`
        );
{/* Header con botón de borrar (solo para admin principal) */}
            {user?.role?.role === 'admin' && appointments.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={handleDeleteAll}
                        disabled={deletingAll}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {deletingAll ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete All Appointments
                            </>
                        )}
                    </button>
                </div>
            )}

            
        if (!confirmDelete) return;

        const doubleConfirm = window.confirm(
            'Please confirm one more time.\n\nDelete ALL appointments permanently?'
        );

        if (!doubleConfirm) return;

        setDeletingAll(true);
        try {
            const response = await deleteAllAppointmentsRequest();
            toast.success(`Successfully deleted ${response.data.deletedCount} appointments`);
            loadAppointments();
        } catch (error) {
            console.error('Error deleting appointments:', error);
            toast.error('Error deleting appointments');
        } finally {
            setDeletingAll(false);
        }
    };

    const formatDateTime = (date, time) => {
        const appointmentDate = new Date(date);
        return `${appointmentDate.toLocaleDateString('en-US')} at ${time}`;
    };

    if (loading) return <div className="text-center py-8">Loading appointments...</div>;

    return (
        <div className="space-y-6">
            {/* Header con botón de borrar (solo para admin principal) */}
            {user?.role?.role === 'admin' && (
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[var(--charcoal)]">Manage all property appointments</h2>
                    {appointments.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            disabled={deletingAll}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            {deletingAll ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Clear All Appointments
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            <div className="form-container stagger-item">
                <h3 className="font-semibold mb-4 text-[var(--charcoal)] flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[var(--gold-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                    </svg>
                    Search Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="input-field"
                        >
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date from</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date until</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            <div className="form-container stagger-item overflow-hidden">
                {appointments.length === 0 ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No appointments</h3>
                        <p className="text-gray-500">No appointments match the selected filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Property
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date and Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((appointment, index) => (
                                    <tr key={appointment._id} className="table-row stagger-item" style={{animationDelay: `${index * 0.05}s`}}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.property?.title}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.property?.address?.street}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {appointment.user?.username || appointment.visitor?.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {appointment.user?.email || appointment.visitor?.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {appointment.user?.phone || appointment.visitor?.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                                                {getStatusText(appointment.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {appointment.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusChange(appointment._id, 'confirm')}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(appointment._id, 'cancel')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {appointment.status === 'confirmed' && (
                                                <>
                                                    {!appointment.assignedTo && (
                                                        <button
                                                            onClick={() => handleStatusChange(appointment._id, 'assign')}
                                                            className="px-3 py-1 rounded text-white font-medium transition-all hover:opacity-90"
                                                            style={{ backgroundColor: '#C8A452' }}
                                                        >
                                                            Assign this appointment to me
                                                        </button>
                                                    )}
                                                    {appointment.assignedTo && (
                                                        <span className="text-green-600 font-medium">
                                                            ✓ Assigned to: {appointment.assignedTo.username}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleStatusChange(appointment._id, 'complete')}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(appointment._id, 'cancel')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['pending', 'confirmed', 'completed', 'cancelled'].map((status, index) => {
                    const count = appointments.filter(apt => apt.status === status).length;
                    return (
                        <div key={status} className="card-animated hover-lift stagger-item text-center p-6" style={{animationDelay: `${index * 0.1}s`}}>
                            <div className="text-3xl font-bold text-[var(--charcoal)] mb-2">{count}</div>
                            <div className="text-sm font-medium text-gray-600">{getStatusText(status)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AdminAppointments;