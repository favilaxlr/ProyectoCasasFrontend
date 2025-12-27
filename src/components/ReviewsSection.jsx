import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPropertyReviewsRequest, createReviewRequest, deleteReviewRequest } from '../api/reviews';
import { toast } from 'react-toastify';
import { IoStar, IoStarOutline, IoTrashBinSharp, IoPersonSharp } from 'react-icons/io5';

function ReviewsSection({ propertyId }) {
    const { isAuthenticated, isAdmin, isCoAdmin, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [propertyId]);

    const loadReviews = async () => {
        try {
            const res = await getPropertyReviewsRequest(propertyId);
            setReviews(res.data.reviews || []);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            toast.error('Por favor selecciona una calificación');
            return;
        }

        if (!comment.trim()) {
            toast.error('Por favor escribe un comentario');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('propertyId', propertyId);
            formData.append('rating', rating);
            formData.append('comment', comment);

            await createReviewRequest(formData);
            toast.success('Reseña enviada correctamente');
            setRating(0);
            setComment('');
            setShowForm(false);
            loadReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message?.[0] || 'Error al enviar la reseña');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return;

        try {
            await deleteReviewRequest(reviewId);
            toast.success('Reseña eliminada');
            loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Error al eliminar la reseña');
        }
    };

    const renderStars = (currentRating, interactive = false) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                        {star <= (interactive ? (hoverRating || rating) : currentRating) ? (
                            <IoStar className="text-yellow-400" size={interactive ? 32 : 20} />
                        ) : (
                            <IoStarOutline className="text-gray-300" size={interactive ? 32 : 20} />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Reseñas de los Visitantes</h3>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                {renderStars(Math.round(averageRating))}
                            </div>
                            <span className="text-xl font-semibold">{averageRating}</span>
                            <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})</span>
                        </div>
                    )}
                </div>
                
                {isAuthenticated && !isAdmin && !isCoAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                    >
                        {showForm ? 'Cancelar' : 'Escribir Reseña'}
                    </button>
                )}
            </div>

            {/* Formulario para crear reseña */}
            {showForm && isAuthenticated && !isAdmin && !isCoAdmin && (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
                    <h4 className="text-lg font-semibold mb-4">Tu Calificación</h4>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Calificación:</label>
                        {renderStars(rating, true)}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Comentario:</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="4"
                            placeholder="Comparte tu experiencia con esta propiedad..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Enviando...' : 'Publicar Reseña'}
                    </button>
                </form>
            )}

            {/* Mensaje para no registrados */}
            {!isAuthenticated && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-center">
                    <p className="text-gray-700">
                        <span className="font-semibold">¿Quieres dejar una reseña?</span> Por favor{' '}
                        <a href="/login" className="text-blue-600 hover:underline font-semibold">inicia sesión</a> o{' '}
                        <a href="/register" className="text-blue-600 hover:underline font-semibold">regístrate</a>
                    </p>
                </div>
            )}

            {/* Lista de reseñas */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Cargando reseñas...</p>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No hay reseñas aún</p>
                        <p className="text-sm">¡Sé el primero en compartir tu experiencia!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    {review.user?.profileImage?.url ? (
                                        <img 
                                            src={review.user.profileImage.url}
                                            alt={review.user.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="bg-blue-100 rounded-full p-2">
                                            <IoPersonSharp className="text-blue-600" size={24} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold">{review.user?.username || 'Usuario'}</p>
                                        <div className="flex items-center gap-2">
                                            {renderStars(review.rating)}
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('es-MX', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de eliminar para admin/co-admin */}
                                {(isAdmin || isCoAdmin) && (
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                                        title="Eliminar reseña"
                                    >
                                        <IoTrashBinSharp size={20} />
                                    </button>
                                )}
                            </div>

                            <p className="text-gray-700 mt-3">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ReviewsSection;