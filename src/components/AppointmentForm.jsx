import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createAppointmentRequest } from '../api/appointments';

function AppointmentForm({ propertyId, onSuccess }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await createAppointmentRequest({
                propertyId,
                visitor: {
                    name: data.name,
                    phone: data.phone,
                    email: data.email
                },
                appointmentDate: data.appointmentDate,
                appointmentTime: data.appointmentTime,
                notes: data.notes
            });
            
            reset();
            setShowForm(false);
            if (onSuccess) onSuccess();
            alert('Cita agendada exitosamente. Recibirás un SMS de confirmación.');
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('Error al agendar la cita. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Agendar Cita de Visita
            </button>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Agendar Cita de Visita</h3>
                <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                        <input
                            {...register('name', { required: 'Nombre es requerido' })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Teléfono</label>
                        <input
                            {...register('phone', { required: 'Teléfono es requerido' })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email es requerido' })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha Preferida</label>
                        <input
                            type="date"
                            {...register('appointmentDate', { required: 'Fecha es requerida' })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        {errors.appointmentDate && <p className="text-red-500 text-sm">{errors.appointmentDate.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Hora Preferida</label>
                        <select
                            {...register('appointmentTime', { required: 'Hora es requerida' })}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="">Seleccionar hora...</option>
                            <option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">1:00 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                            <option value="17:00">5:00 PM</option>
                        </select>
                        {errors.appointmentTime && <p className="text-red-500 text-sm">{errors.appointmentTime.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Notas Adicionales (Opcional)</label>
                    <textarea
                        {...register('notes')}
                        rows="3"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Cualquier información adicional..."
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Agendando...' : 'Agendar Cita'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                </div>
            </form>

            <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                    📱 Recibirás un SMS de confirmación con los detalles de tu cita.
                    Responde "YES" para confirmar o "NO" para cancelar.
                </p>
            </div>
        </div>
    );
}

export default AppointmentForm;