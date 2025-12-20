import { useState, useEffect } from 'react';
import { getPropertyReviewsRequest, voteHelpfulRequest } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

function ReviewsSection({ propertyId }) {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        loadReviews();
    }, [propertyId, page, sortBy]);

    const loadReviews = async () => {
        try {
            const response = await getPropertyReviewsRequest(propertyId, { page, sortBy });
            setReviews(response.data.reviews);
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteHelpful = async (reviewId) => {
        if (!isAuthenticated) return;
        
        try {
            await voteHelpfulRequest(reviewId);
            loadReviews(); // Recargar para actualizar conteos
        } catch (error) {
            console.error('Error voting helpful:', error);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
            </span>
        ));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <div className="text-center py-8">Cargando reseñas...</div>;

    return (
        <div className="space-y-6">
            {/* Estadísticas generales */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Reseñas y Calificaciones</h3>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl font-bold text-gray-800">
                        {stats.averageRating.toFixed(1)}
                    </div>
                    <div>
                        <div className="flex items-center">
                            {renderStars(Math.round(stats.averageRating))}
                        </div>
                        <div className="text-sm text-gray-600">
                            {stats.totalReviews} reseña{stats.totalReviews !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Controles de ordenamiento */}
                <div className="flex gap-2 mb-4">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                        <option value="createdAt">Más recientes</option>
                        <option value="rating">Mayor calificación</option>
                        <option value="helpfulCount">Más útiles</option>
                    </select>
                </div>
            </div>

            {/* Lista de reseñas */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hay reseñas para esta propiedad aún.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className={`bg-white p-6 rounded-lg shadow ${review.featured ? 'border-l-4 border-yellow-400' : ''}`}>
                            {review.featured && (
                                <div className="mb-2">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                                        Reseña Destacada
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold">{review.user?.username}</span>
                                        <div className="flex items-center">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4">{review.comment}</p>

                            {/* Subcategorías si existen */}
                            {review.subcategories && Object.keys(review.subcategories).length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    {review.subcategories.location && (
                                        <div>
                                            <span className="text-gray-600">Ubicación:</span>
                                            <div className="flex">{renderStars(review.subcategories.location)}</div>
                                        </div>
                                    )}
                                    {review.subcategories.condition && (
                                        <div>
                                            <span className="text-gray-600">Estado:</span>
                                            <div className="flex">{renderStars(review.subcategories.condition)}</div>
                                        </div>
                                    )}
                                    {review.subcategories.value && (
                                        <div>
                                            <span className="text-gray-600">Precio/Calidad:</span>
                                            <div className="flex">{renderStars(review.subcategories.value)}</div>
                                        </div>
                                    )}
                                    {review.subcategories.service && (
                                        <div>
                                            <span className="text-gray-600">Atención:</span>
                                            <div className="flex">{renderStars(review.subcategories.service)}</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Imágenes de la reseña */}
                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                    {review.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image.url}
                                            alt={`Reseña ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Botón de voto útil */}
                            <div className="flex items-center justify-between">
                                <div>
                                    {review.recommendation !== undefined && (
                                        <span className={`text-sm ${review.recommendation ? 'text-green-600' : 'text-red-600'}`}>
                                            {review.recommendation ? '✓ Recomendada' : '✗ No recomendada'}
                                        </span>
                                    )}
                                </div>
                                
                                {isAuthenticated && (
                                    <button
                                        onClick={() => handleVoteHelpful(review._id)}
                                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                                    >
                                        👍 Útil ({review.helpfulCount})
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ReviewsSection;