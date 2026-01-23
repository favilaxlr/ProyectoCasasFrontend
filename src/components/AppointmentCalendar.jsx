import { useState, useEffect } from 'react';
import { getAvailableSlotsRequest, createAppointmentRequest } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

function AppointmentCalendar({ propertyId, onAppointmentCreated }) {
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (selectedDate) {
            loadAvailableSlots();
        }
    }, [selectedDate, propertyId]);

    const loadAvailableSlots = async () => {
        try {
            const response = await getAvailableSlotsRequest(propertyId, selectedDate);
            setAvailableSlots(response.data.availableSlots);
        } catch (error) {
            console.error('Error loading slots:', error);
            setAvailableSlots([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            alert('You must log in to schedule an appointment');
            return;
        }

        if (!selectedDate || !selectedTime) {
            alert('Select date and time');
            return;
        }

        setLoading(true);
        try {
            await createAppointmentRequest({
                propertyId,
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                notes
            });

            alert('Cita agendada exitosamente. Recibirás confirmación pronto.');
            setShowForm(false);
            setSelectedDate('');
            setSelectedTime('');
            setNotes('');
            onAppointmentCreated && onAppointmentCreated();
        } catch (error) {
            console.error('Error creating appointment:', error);
            const message = error.response?.data?.message?.[0] || 'Error scheduling appointment';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30); // 30 días adelante
        return maxDate.toISOString().split('T')[0];
    };

    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString);
        const dayOfWeek = date.toLocaleDateString('es-ES', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        return `${dayOfWeek}, ${formattedDate}`;
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">Interested in this property?</h3>
                <p className="text-gray-600 mb-4">Log in to schedule a visit</p>
                <button className="btn-primary">
                    Log In
                </button>
            </div>
        );
    }

    if (!showForm) {
        return (
            <div className="text-center">
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary text-lg px-8 py-3"
                >
                    Schedule Visit
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Schedule Visit</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selección de fecha */}
                <div>
                    <label className="block text-sm font-medium mb-2">Visit date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                    {selectedDate && (
                        <p className="text-sm text-gray-600 mt-1">
                            {formatDateForDisplay(selectedDate)}
                        </p>
                    )}
                </div>

                {/* Horarios disponibles */}
                {selectedDate && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Available time</label>
                        {availableSlots.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                No available times for this date. 
                                <br />
                                <span className="text-xs">
                                    Hours: Mon-Fri 9:00-18:00, Sat 10:00-14:00
                                </span>
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        type="button"
                                        onClick={() => setSelectedTime(slot.time)}
                                        className={`p-2 text-sm border rounded ${
                                            selectedTime === slot.time
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Notas opcionales */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Message for the administrator (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any specific question or comment..."
                        rows="3"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        maxLength="500"
                    />
                </div>

                {/* User Information */}
                <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium mb-2">Contact information:</h4>
                    <p className="text-sm text-gray-600">
                        <strong>Name:</strong> {user?.username}<br />
                        <strong>Email:</strong> {user?.email}
                    </p>
                </div>

                {/* Terms */}
                <div className="text-xs text-gray-500">
                    By scheduling this appointment, you agree that FR Family Investments will contact you to confirm the visit details.
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading || !selectedDate || !selectedTime}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Scheduling...' : 'Confirm Appointment'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setSelectedDate('');
                            setSelectedTime('');
                            setNotes('');
                        }}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AppointmentCalendar;