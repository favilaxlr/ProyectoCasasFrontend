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

    // Filter completed appointments for this property
    const eligibleAppointments = userAppointments?.filter(apt => 
        apt.property._id === propertyId && 
        apt.status === 'completed' &&
        new Date(apt.appointmentDate) < new Date()
    ) || [];

    const onSubmit = async (data) => {
        if (eligibleAppointments.length === 0) {
            alert('You need to have a completed appointment to review this property');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            
            // Add form data
            formData.append('propertyId', propertyId);
            formData.append('appointmentId', data.appointmentId);
            formData.append('rating', data.rating);
            formData.append('comment', data.comment);
            
            if (data.recommendation !== undefined) {
                formData.append('recommendation', data.recommendation);
            }

            // Optional subcategories
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
            
            alert('Review sent for moderation. It will be visible once approved.');
            setShowForm(false);
            onReviewCreated && onReviewCreated();
        } catch (error) {
            console.error('Error creating review:', error);
            alert('Error sending review');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5); // Maximum 5 images
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
                <p className="text-blue-700">Log in to leave a review</p>
            </div>
        );
    }

    if (eligibleAppointments.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-600">You need to have a completed appointment to review this property</p>
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
                    Write Review
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Write Review</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Appointment Selection */}
                <div>
                    <label className="block text-sm font-medium mb-2">Associated Appointment</label>
                    <select
                        {...register('appointmentId', { required: 'Select an appointment' })}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                        <option value="">Select appointment...</option>
                        {eligibleAppointments.map(apt => (
                            <option key={apt._id} value={apt._id}>
                                {new Date(apt.appointmentDate).toLocaleDateString()} - {apt.appointmentTime}
                            </option>
                        ))}
                    </select>
                    {errors.appointmentId && <p className="text-red-500 text-sm">{errors.appointmentId.message}</p>}
                </div>

                {/* Main Rating */}
                <div>
                    <label className="block text-sm font-medium mb-2">Overall Rating *</label>
                    {renderStarRating('rating', rating)}
                    <input type="hidden" {...register('rating', { required: 'Rating is required' })} />
                    {errors.rating && <p className="text-red-500 text-sm">{errors.rating.message}</p>}
                </div>

                {/* Optional Subcategories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Ubicación</label>
                        {renderStarRating('subcategories.location', watch('subcategories.location'))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Property Condition</label>
                        {renderStarRating('subcategories.condition', watch('subcategories.condition'))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Price-Quality Ratio</label>
                        {renderStarRating('subcategories.value', watch('subcategories.value'))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Service Received</label>
                        {renderStarRating('subcategories.service', watch('subcategories.service'))}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium mb-2">Comment *</label>
                    <textarea
                        {...register('comment', { 
                            required: 'Comment is required',
                            minLength: { value: 50, message: 'Minimum 50 characters' },
                            maxLength: { value: 1000, message: 'Maximum 1000 characters' }
                        })}
                        rows="4"
                        placeholder="Share your experience with this property..."
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}
                </div>

                {/* Recomendación */}
                <div>
                    <label className="block text-sm font-medium mb-2">Would you recommend this property?</label>
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
                    <label className="block text-sm font-medium mb-2">Photos (optional, maximum 5)</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                    {images.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                            {images.length} image{images.length !== 1 ? 's' : ''} selected
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
                        {loading ? 'Sending...' : 'Send Review'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReviewForm;