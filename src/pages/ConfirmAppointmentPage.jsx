import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoCheckmarkCircleSharp, IoCloseCircleSharp, IoCalendarSharp, IoTimeSharp, IoLocationSharp } from 'react-icons/io5';

const ConfirmAppointmentPage = () => {
    const { id, code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [appointmentData, setAppointmentData] = useState(null);

    useEffect(() => {
        const confirmAppointment = async () => {
            try {
                const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';
                const response = await fetch(`${baseUrl}/api/appointments/confirm/${id}/${code}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setSuccess(true);
                    setAppointmentData(data.appointment);
                } else {
                    setError(data.message?.[0] || 'Could not confirm the appointment');
                }
            } catch (err) {
                setError('Connection error. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        confirmAppointment();
    }, [id, code]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Confirming your appointment...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <IoCheckmarkCircleSharp className="text-green-600 text-5xl" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Appointment Confirmed!
                        </h1>
                        <p className="text-gray-600">
                            Your appointment has been confirmed successfully
                        </p>
                    </div>

                    {appointmentData && (
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                            <h2 className="font-semibold text-lg mb-4 text-gray-800">Appointment Details:</h2>
                            
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <IoLocationSharp className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-800">{appointmentData.property}</p>
                                        {appointmentData.address && (
                                            <p className="text-sm text-gray-600">
                                                {appointmentData.address.street}, {appointmentData.address.city}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <IoCalendarSharp className="text-blue-600 mr-3" />
                                    <p className="text-gray-700">
                                        {new Date(appointmentData.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <IoTimeSharp className="text-blue-600 mr-3" />
                                    <p className="text-gray-700">{appointmentData.time}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/my-appointments')}
                            className="w-full bg-[var(--gold-accent)] hover:bg-[#145a75] text-white py-3 rounded-lg font-semibold transition-all"
                        >
                            View my appointments
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all"
                        >
                            Back to home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <IoCloseCircleSharp className="text-red-600 text-5xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Confirmation Error
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {error}
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-all"
                >
                    Back to home
                </button>
            </div>
        </div>
    );
};

export default ConfirmAppointmentPage;
