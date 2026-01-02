import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { createAppointmentRequest } from '../api/appointments';
import { toast } from 'react-toastify';
import { IoCalendarSharp, IoPhonePortraitSharp, IoCheckmarkCircleSharp } from 'react-icons/io5';

function AppointmentForm({ propertyId, onSuccess }) {
    const { user, isAuthenticated, isCoAdmin, isAdmin } = useAuth();
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: user?.username || '',
            phone: user?.phone || '',
            email: user?.email || ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Si no está autenticado, mostrar mensaje para registrarse
    if (!isAuthenticated) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        Interested in this property?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        To schedule a viewing appointment, you need a registered account.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/register"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Create Account
                        </Link>
                        <Link
                            to="/login"
                            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Admin y co-admin no pueden agendar citas
    if (isCoAdmin || isAdmin) {
        return null;
    }

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await createAppointmentRequest({
                propertyId,
                appointmentDate: data.appointmentDate,
                appointmentTime: data.appointmentTime,
                notes: data.notes
            });
            
            reset();
            setShowForm(false);
            if (onSuccess) onSuccess();
            
            toast.success('Appointment created successfully. A confirmation SMS has been sent to your phone.', {
                position: 'top-right',
                autoClose: 5000
            });
        } catch (error) {
            console.error('Error creating appointment:', error);
            const errorMessage = error.response?.data?.message?.[0] || 'Error scheduling the appointment. Please try again.';
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    if (!showForm) {
        return (
            <div className="text-center">
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center justify-center"
                >
                    <IoCalendarSharp className="mr-2" />
                    Schedule Viewing Appointment
                </button>
                <p className="text-sm text-gray-600 mt-2">
                    Connected as: <span className="font-semibold">{user?.username}</span>
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Schedule Viewing Appointment</h3>
                <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    ×
                </button>
            </div>

            {/* Información del usuario */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-blue-600 font-medium">Name:</span>
                        <p className="text-gray-700">{user?.username}</p>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Phone:</span>
                        <p className="text-gray-700">{user?.phone}</p>
                    </div>
                    <div>
                        <span className="text-blue-600 font-medium">Email:</span>
                        <p className="text-gray-700">{user?.email}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Preferred Date</label>
                        <input
                            type="date"
                            {...register('appointmentDate', { required: 'Date is required' })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errors.appointmentDate && <p className="text-red-500 text-sm mt-1">{errors.appointmentDate.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Preferred Time</label>
                        <select
                            {...register('appointmentTime', { required: 'Time is required' })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select time...</option>
                            <option value="09:00">9:00 AM</option>
                            <option value="09:30">9:30 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="10:30">10:30 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="11:30">11:30 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="12:30">12:30 PM</option>
                            <option value="13:00">1:00 PM</option>
                            <option value="13:30">1:30 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="14:30">2:30 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="15:30">3:30 PM</option>
                            <option value="16:00">4:00 PM</option>
                            <option value="16:30">4:30 PM</option>
                            <option value="17:00">5:00 PM</option>
                        </select>
                        {errors.appointmentTime && <p className="text-red-500 text-sm mt-1">{errors.appointmentTime.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Additional Notes (Optional)</label>
                    <textarea
                        {...register('notes')}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any additional information you want to share..."
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Scheduling...
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <IoCalendarSharp className="mr-2" />
                                Schedule Appointment
                            </div>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start">
                    <div className="text-green-600 mr-3">
                        <IoPhonePortraitSharp className="text-xl" />
                    </div>
                    <div>
                        <h5 className="font-semibold text-green-800 mb-1">SMS Confirmation</h5>
                        <p className="text-sm text-green-700">
                            You will receive an SMS with a confirmation link on your phone <strong>{user?.phone}</strong>.
                            Click the link to confirm your appointment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AppointmentForm;