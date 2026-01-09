import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getPropertyRequest, changePropertyStatusRequest } from '../api/properties';
import { checkExistingOfferRequest } from '../api/offers';
import AppointmentForm from '../components/AppointmentForm';
import PropertyStatus from '../components/PropertyStatus';
import ReviewsSection from '../components/ReviewsSection';
import DocumentUploader from '../components/DocumentUploader';
import OfferChat from '../components/OfferChat';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { IoLocationSharp, IoBedSharp, IoCarSharp, IoHomeSharp, IoCalendarSharp, IoPawSharp, IoCheckmarkCircleSharp, IoCloseCircleSharp, IoPencilSharp, IoTimeSharp, IoSwapHorizontalSharp, IoCashSharp, IoKeySharp, IoBusinessSharp, IoCardSharp, IoDocumentTextSharp, IoExpand, IoArrowBack, IoArrowForward, IoClose, IoResizeSharp } from 'react-icons/io5';

function PropertyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isCoAdmin, isAdmin, isAuthenticated } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);

    const handleMakeOfferClick = async () => {
        if (!isAuthenticated) {
            toast.info('Please log in or register to make an offer');
            navigate('/login', { state: { from: `/properties/${id}` } });
            return;
        }

        // Verificar si ya existe una oferta activa
        try {
            const res = await checkExistingOfferRequest(id);
            if (res.data.hasOffer) {
                toast.info('You already have an active offer for this property. Redirecting to your offer...');
                navigate(`/my-offers/${res.data.offer._id}`);
                return;
            }
        } catch (error) {
            console.error('Error checking existing offer:', error);
        }

        setShowOfferModal(true);
    };

    useEffect(() => {
        const loadProperty = async () => {
            try {
                const res = await getPropertyRequest(id);
                setProperty(res.data);
            } catch (error) {
                console.error('Error loading property:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProperty();
    }, [id]);

    // Cerrar modal con tecla ESC
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                setShowGalleryModal(false);
                setShowOfferModal(false);
            }
        };

        if (showGalleryModal || showOfferModal) {
            window.addEventListener('keydown', handleEscKey);
        }

        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [showGalleryModal, showOfferModal]);

    if (loading) return <div className="flex justify-center p-8">Loading...</div>;
    if (!property) return <div className="flex justify-center p-8">Property not found</div>;

    const getPropertyTypeLabel = (type) => {
        const types = {
            house: 'House',
            apartment: 'Apartment',
            condo: 'Condo',
            townhouse: 'Townhouse'
        };
        return types[type] || type;
    };

    const handleStatusChange = async (newStatus) => {
        if (!newStatus) return;

        try {
            await changePropertyStatusRequest(id, newStatus, '');
            toast.success('Estado actualizado correctamente');
            // Recargar propiedad
            const res = await getPropertyRequest(id);
            setProperty(res.data);
        } catch (error) {
            console.error('Error changing status:', error);
            toast.error('Error changing the status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Image Full-Width - Respeta Aspect Ratio Original */}
            <div className="w-full bg-gray-50 relative cursor-pointer group" onClick={() => setShowGalleryModal(true)}>
                {property.images && property.images.length > 0 ? (
                    <>
                        {/* Overlay de hover para indicar que se puede hacer clic */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-10 flex items-center justify-center">
                            <div className="bg-white/90 px-6 py-3 rounded-full text-gray-900 font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <IoExpand className="text-xl" />
                                <span>Click to expand</span>
                            </div>
                        </div>
                        
                        <img 
                            src={property.images[selectedImage]?.url} 
                            alt={property.title}
                            className="w-full h-auto object-contain max-h-[85vh]"
                        />
                        
                        {/* Gallery Thumbnails - Posicionadas sobre la imagen */}
                        {property.images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 max-w-full overflow-x-auto px-4 scrollbar-hide">
                                {property.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(index);
                                        }}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-3 transition-all ${
                                            selectedImage === index 
                                                ? 'border-white shadow-lg scale-110' 
                                                : 'border-white/50 hover:border-white/80'
                                        }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-100">
                        <IoHomeSharp className="text-6xl text-gray-400 mb-4" />
                        <span className="text-gray-500 text-xl">No images available</span>
                    </div>
                )}
            </div>

            {/* Property Information Section - Debajo de la imagen */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header con título, ubicación y estado */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-slide-up">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
                            <div className="flex items-center text-gray-600 text-lg mb-4">
                                <IoLocationSharp className="mr-2 text-2xl text-[var(--gold-accent)]" />
                                <span>{property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}</span>
                            </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex-shrink-0">
                            {(isAdmin || isCoAdmin) ? (
                                <select
                                    value={property.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold cursor-pointer transition-all ${
                                        property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border-2 border-green-400 hover:bg-green-200' :
                                        property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border-2 border-orange-400 hover:bg-orange-200' :
                                        'bg-red-100 text-red-800 border-2 border-red-400 hover:bg-red-200'
                                    }`}
                                >
                                    <option value="DISPONIBLE">Available</option>
                                    <option value="EN_CONTRATO">Under Contract</option>
                                    <option value="VENDIDA">Sold</option>
                                </select>
                            ) : (
                                <span className={`inline-block px-6 py-3 rounded-full text-sm font-bold ${
                                    property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border-2 border-green-400' :
                                    property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border-2 border-orange-400' :
                                    'bg-red-100 text-red-800 border-2 border-red-400'
                                }`}>
                                    {property.status === 'DISPONIBLE' ? 'Available' :
                                     property.status === 'EN_CONTRATO' ? 'Under Contract' :
                                     'Sold'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Price Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        {/* Business Mode Badge */}
                        {property.businessMode && (
                            <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
                                property.businessMode === 'sale' ? 'bg-blue-50 border-blue-300' :
                                property.businessMode === 'rent' ? 'bg-green-50 border-green-300' :
                                'bg-gradient-to-r from-blue-50 to-green-50 border-purple-300'
                            }`}>
                                {property.businessMode === 'sale' && <IoCardSharp className="text-3xl text-blue-600" />}
                                {property.businessMode === 'rent' && <IoKeySharp className="text-3xl text-green-600" />}
                                {property.businessMode === 'both' && <IoBusinessSharp className="text-3xl text-purple-600" />}
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase">Type</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {property.businessMode === 'sale' && 'For Sale'}
                                        {property.businessMode === 'rent' && 'For Rent'}
                                        {property.businessMode === 'both' && 'Sale or Rent'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Sale Price */}
                        {(!property.businessMode || property.businessMode === 'sale' || property.businessMode === 'both') && property.price?.sale && (
                            <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-300">
                                <div className="flex items-center gap-3">
                                    <IoCardSharp className="text-3xl text-blue-600" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 uppercase">Sale Price</p>
                                        <p className="text-2xl font-bold text-blue-600">${property.price.sale.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rent Price */}
                        {(property.businessMode === 'rent' || property.businessMode === 'both') && property.price?.monthlyRent && (
                            <div className="p-4 rounded-xl bg-green-50 border-2 border-green-300">
                                <div className="flex items-center gap-3">
                                    <IoKeySharp className="text-3xl text-green-600" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 uppercase">Monthly Rent</p>
                                        <p className="text-2xl font-bold text-green-600">${property.price.monthlyRent.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            {/* Lightbox Modal - Pantalla Completa con Aspect Ratio Original */}
            {showGalleryModal && property.images && property.images.length > 0 && (
                <div 
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in"
                    onClick={() => setShowGalleryModal(false)}
                >
                    {/* Header con contador y botón cerrar */}
                    <div className="absolute top-0 left-0 right-0 pt-20 md:pt-6 px-6 pb-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
                        <div className="text-white text-lg font-semibold">
                            {selectedImage + 1} / {property.images.length}
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowGalleryModal(false);
                            }}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:rotate-90"
                        >
                            <IoClose className="text-2xl" />
                        </button>
                    </div>

                    {/* Imagen principal - Respeta aspect ratio original */}
                    <div 
                        className="relative w-full h-full flex items-center justify-center p-4 md:p-20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={property.images[selectedImage]?.url} 
                            alt={`${property.title} - Image ${selectedImage + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Botones de navegación */}
                    {property.images.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(prev => prev === 0 ? property.images.length - 1 : prev - 1);
                                }}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-10"
                            >
                                <IoArrowBack className="text-2xl" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(prev => prev === property.images.length - 1 ? 0 : prev + 1);
                                }}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-10"
                            >
                                <IoArrowForward className="text-2xl" />
                            </button>
                        </>
                    )}

                    {/* Footer con instrucciones */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white/80 text-sm">
                            Press <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd> to close or click outside the image
                        </p>
                    </div>
                </div>
            )}

                {/* Key Features - Clean Design with Icons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                        <IoBedSharp className="text-4xl text-blue-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-gray-900 mb-1">{property.details?.bedrooms || 0}</p>
                        <p className="text-sm text-gray-600 uppercase font-semibold">Bedrooms</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                        <IoHomeSharp className="text-4xl text-blue-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-gray-900 mb-1">{property.details?.bathrooms || 0}</p>
                        <p className="text-sm text-gray-600 uppercase font-semibold">Bathrooms</p>
                    </div>
                    {property.details?.squareFeet && (
                        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                            <IoResizeSharp className="text-4xl text-blue-600 mx-auto mb-3" />
                            <p className="text-2xl font-bold text-gray-900 mb-1">{property.details.squareFeet.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 uppercase font-semibold">sq ft</p>
                        </div>
                    )}
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center">
                        <IoCarSharp className="text-4xl text-blue-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-gray-900 mb-1">{property.details?.parking ? 'Yes' : 'No'}</p>
                        <p className="text-sm text-gray-600 uppercase font-semibold">Garage</p>
                    </div>
                </div>

                {/* Documentos de la propiedad - ARRIBA de la descripción */}
                <DocumentUploader
                    propertyId={id}
                    documents={property.documents || []}
                    onDocumentsChange={(updatedDocuments) => {
                        setProperty({ ...property, documents: updatedDocuments });
                    }}
                    isAdminOrCoAdmin={isAdmin || isCoAdmin}
                    />

                {/* Descripción */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                    </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {property.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                                    <IoCheckmarkCircleSharp className="text-blue-600 mr-2" />
                                    <span className="text-sm font-medium">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    )}

                {/* Contact Information */}
                {(property.contact?.phone || property.contact?.email) && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {property.contact.phone && (
                                <div className="flex items-center p-3 bg-gray-50 rounded">
                                    <span className="font-semibold mr-2">Phone:</span>
                                    <a href={`tel:${property.contact.phone}`} className="text-blue-600 hover:underline">
                                        {property.contact.phone}
                                    </a>
                                </div>
                            )}
                            {property.contact.email && (
                                <div className="flex items-center p-3 bg-gray-50 rounded">
                                    <span className="font-semibold mr-2">Email:</span>
                                    <a href={`mailto:${property.contact.email}`} className="text-blue-600 hover:underline">
                                        {property.contact.email}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                {/* Appointment scheduling form - Only if available and NOT admin/co-admin */}
                {property.status === 'DISPONIBLE' && !isCoAdmin && !isAdmin && (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg shadow-lg mb-6">
                        <h3 className="text-2xl font-semibold mb-4 text-center">Interested in this property?</h3>
                        <p className="text-gray-600 text-center mb-6">Schedule an appointment to visit it</p>
                        <AppointmentForm propertyId={property._id} />
                    </div>
                    )}

                {/* Offer button for users */}
                {property.status === 'DISPONIBLE' && !isCoAdmin && !isAdmin && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg shadow-lg mb-6">
                        <h3 className="text-2xl font-semibold mb-4 text-center">Want to make an offer?</h3>
                        <p className="text-gray-600 text-center mb-6">Submit your offer and start a conversation with the property manager</p>
                        <div className="flex justify-center">
                            <button
                                onClick={handleMakeOfferClick}
                                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center text-lg font-semibold"
                            >
                                <IoCashSharp className="mr-2 text-xl" />
                                Make an Offer
                            </button>
                        </div>
                    </div>
                    )}

                {/* Offer Modal */}
                {showOfferModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="max-w-2xl w-full">
                            <OfferChat
                                propertyId={property._id}
                                propertyTitle={property.title}
                                propertyPrice={property.price?.sale}
                                onClose={() => setShowOfferModal(false)}
                            />
                        </div>
                    </div>
                    )}

                {/* Opciones de administración para admin/co-admin */}
                {(isAdmin || isCoAdmin) && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Administration Options</h3>
                        <p className="text-gray-600 text-center mb-6">Manage this property</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to={`/admin/properties/edit/${property._id}`}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center"
                            >
                                <IoPencilSharp className="mr-2" size={20} />
                                Edit Property
                            </Link>
                            <button
                                onClick={() => navigate('/admin/properties')}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                            >
                                View All Properties
                            </button>
                        </div>
                    </div>
                    )}

                {/* Reviews Section */}
                <ReviewsSection propertyId={property._id} />
            </div>
        </div>
    );
}

export default PropertyDetailPage;