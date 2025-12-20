import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createReviewRequest } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

function ReviewForm({ propertyId, userAppointments, onReviewCreated }) {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const { user } = useAuth();

    const rating = watch('rating');

    // Filtrar citas completadas para esta propiedad
    const eligibleAppointments = userAppointments?.filter(apt => 
        apt.property._id === propertyId && 
        apt.status === 'completed' &&
        new Date(apt.appointmentDate) < new Date()
    ) || [];

    const onSubmit = async (data) => {
        if (eligibleAppointments.length === 0) {
            alert('Necesitas tener una cita completada para reseñar esta propiedad');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            
            // Agregar datos del formulario
            formData.append('propertyId', propertyId);
            formData.append('appointmentId', data.appointmentId);
            formData.append('rating', data.rating);
            formData.append('comment', data.comment);
            
            if (data.recommendation !== undefined) {
                formData.append('recommendation', data.recommendation);
            }

            // Subcategorías opcionales
            if (data.subcategories) {
                Object.keys(data.subcategories).forEach(key => {
                    if (data.subcategories[key]) {
                        formData.append(`subcategories.${key}`, data.subcategories[key]);
                    }
                });
            }

            // Agregar imágenes
            images.forEach(image => {
                formData.append('images', image);
            });

            await createReviewRequest(formData);
            
            alert('Reseña enviada para moderación. Será visible una vez aprobada.');
            setShowForm(false);
            onReviewCreated && onReviewCreated();
        } catch (error) {
            console.error('Error creating review:', error);
            alert('Error al enviar reseña');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5); // Máximo 5 imágenes
        setImages(files);
    };

    const renderStarRating = (fieldName, currentValue) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setValue(fieldName, star)}
                        className={`text-2xl ${star <= currentValue ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    if (!user) {
        return (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-blue-700">Inicia sesión para dejar una reseña</p>
            </div>
        );
    }

    if (eligibleAppointments.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">Necesitas tener una cita completada para reseñar esta propiedad</p>
            </div>
        );
    }

    if (!showForm) {
        return (
            <div className="text-center">
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                >
                    Escribir Reseña
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Escribir Reseña</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Selección de cita */}
                <div>
                    <label className="block text-sm font-medium mb-2">Cita Asociada</label>
                    <select
                        {...register('appointmentId', { required: 'Selecciona una cita' })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                        <option value="">Selecciona la cita...</option>
                        {eligibleAppointments.map(apt => (
                            <option key={apt._id} value={apt._id}>
                                {new Date(apt.appointmentDate).toLocaleDateString()} - {apt.appointmentTime}
                            </option>
                        ))}
                    </select>
                    {errors.appointmentId && <p className="text-red-500 text-sm">{errors.appointmentId.message}</p>}
                </div>

                {/* Calificación principal */}
                <div>
                    <label className="block text-sm font-medium mb-2">Calificación General *</label>
                    {renderStarRating('rating', rating)}
                    <input type="hidden" {...register('rating', { required: 'La calificación es requerida' })} />
                    {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
                </div>

                {/* Subcategorías opcionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Ubicación</label>
                        {renderStarRating('subcategories.location', watch('subcategories.location'))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Estado de la Propiedad</label>
                        {renderStarRating('subcategories.condition', watch('subcategories.condition'))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Relación Precio-Calidad</label>
                        {renderStarRating('subcategories.value', watch('subcategories.value'))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Atención Recibida</label>
                        {renderStarRating('subcategories.service', watch('subcategories.service'))}
                    </div>
                </div>

                {/* Comentario */}
                <div>
                    <label className="block text-sm font-medium mb-2">Comentario *</label>
                    <textarea
                        {...register('comment', { 
                            required: 'El comentario es requerido',
                            minLength: { value: 50, message: 'Mínimo 50 caracteres' },
                            maxLength: { value: 1000, message: 'Máximo 1000 caracteres' }
                        })}
                        rows="4"
                        placeholder="Comparte tu experiencia con esta propiedad..."
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}
                </div>

                {/* Recomendación */}
                <div>
                    <label className="block text-sm font-medium mb-2">¿Recomendarías esta propiedad?</label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                {...register('recommendation')}
                                value="true"
                                className="mr-2"
                            />
                            Sí, la recomiendo
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                {...register('recommendation')}
                                value="false"
                                className="mr-2"
                            />
                            No la recomiendo
                        </label>
                    </div>
                </div>

                {/* Imágenes */}
                <div>
                    <label className="block text-sm font-medium mb-2">Fotos (opcional, máximo 5)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {images.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            {images.length} imagen{images.length !== 1 ? 'es' : ''} seleccionada{images.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Enviar Reseña'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReviewForm;