import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getPropertyRequest, changePropertyStatusRequest } from '../api/properties';
import AppointmentForm from '../components/AppointmentForm';
import PropertyStatus from '../components/PropertyStatus';
import ReviewsSection from '../components/ReviewsSection';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { IoLocationSharp, IoBedSharp, IoCarSharp, IoHomeSharp, IoCalendarSharp, IoPawSharp, IoCheckmarkCircleSharp, IoCloseCircleSharp, IoPencilSharp, IoTimeSharp, IoSwapHorizontalSharp, IoCashSharp, IoKeySharp, IoBusinessSharp, IoCardSharp, IoDocumentTextSharp } from 'react-icons/io5';

function PropertyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isCoAdmin, isAdmin } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

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
        <div className="max-w-7xl mx-auto p-6">
            {/* Header con título y estado */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600 mb-2">
                        <IoLocationSharp className="mr-2" />
                        <span>{property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}</span>
                    </div>
                </div>
                
                {/* Dropdown de estado */}
                <div className="flex items-center gap-3">
                    {(isAdmin || isCoAdmin) ? (
                        <select
                            value={property.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all ${
                                property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200' :
                                property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border-2 border-orange-300 hover:bg-orange-200' :
                                property.status === 'VENDIDA' ? 'bg-red-100 text-red-800 border-2 border-red-300 hover:bg-red-200' :
                                'bg-gray-100 text-gray-800'
                            }`}
                        >
                            <option value="DISPONIBLE">Available</option>
                            <option value="EN_CONTRATO">Under Contract</option>
                            <option value="VENDIDA">Sold</option>
                        </select>
                    ) : (
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                            property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' :
                            property.status === 'VENDIDA' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {property.status === 'DISPONIBLE' ? 'Available' :
                             property.status === 'EN_CONTRATO' ? 'Under Contract' :
                             property.status === 'VENDIDA' ? 'Sold' :
                             property.status}
                        </span>
                    )}
                </div>
            </div>

            {/* Galería de imágenes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                    {property.images && property.images.length > 0 ? (
                        <div>
                            <img 
                                src={property.images[selectedImage]?.url} 
                                alt={property.title}
                                className="w-full h-96 object-cover rounded-lg shadow-lg"
                            />
                            <div className="flex gap-2 mt-4 overflow-x-auto">
                                {property.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`${property.title} ${index + 1}`}
                                        className={`w-20 h-20 object-cover rounded cursor-pointer transition-all ${
                                            selectedImage === index ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'
                                        }`}
                                        onClick={() => setSelectedImage(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">No images</span>
                        </div>
                    )}
                </div>

                {/* Información principal */}
                <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
                    {/* Business Mode Badge */}
                    {property.businessMode && (
                        <div className="mb-4 text-center">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                                property.businessMode === 'sale' ? 'bg-blue-100 text-blue-800' :
                                property.businessMode === 'rent' ? 'bg-green-100 text-green-800' :
                                'bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 text-purple-800'
                            }`}>
                                {property.businessMode === 'sale' && (
                                    <>
                                        <IoCardSharp className="mr-2" />
                                        Sale
                                    </>
                                )}
                                {property.businessMode === 'rent' && (
                                    <>
                                        <IoKeySharp className="mr-2" />
                                        Rent
                                    </>
                                )}
                                {property.businessMode === 'both' && (
                                    <>
                                        <IoBusinessSharp className="mr-2" />
                                        Rent/Sale
                                    </>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Información de VENTA (si businessMode es 'sale' o 'both') */}
                    {(!property.businessMode || property.businessMode === 'sale' || property.businessMode === 'both') && property.price?.sale && (
                        <div className={`${property.businessMode === 'both' ? 'border-b-2 border-gray-200 pb-4 mb-4' : ''}`}>
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-center mb-2">
                                    <IoCardSharp className="text-blue-600 text-2xl mr-2" />
                                    <h3 className="text-lg font-bold text-blue-800">Sale Information</h3>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600 mb-1">
                                        ${property.price.sale.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">Sale Price</p>
                                </div>
                            </div>

                            {/* Additional sale information */}
                            {(property.price.taxes || property.price.deedConditions) && (
                                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm">
                                    {property.price.taxes && (
                                        <div className="mb-2">
                                            <span className="font-semibold text-blue-800">Annual taxes:</span>
                                            <span className="text-gray-700 ml-2">${property.price.taxes.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {property.price.deedConditions && (
                                        <div>
                                            <span className="font-semibold text-blue-800 block mb-1">Conditions:</span>
                                            <p className="text-gray-700 text-xs whitespace-pre-line">{property.price.deedConditions}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Información de RENTA (si businessMode es 'rent' o 'both') */}
                    {(property.businessMode === 'rent' || property.businessMode === 'both') && property.price?.monthlyRent && (
                        <div>
                            <div className="bg-green-50 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-center mb-2">
                                    <IoKeySharp className="text-green-600 text-2xl mr-2" />
                                    <h3 className="text-lg font-bold text-green-800">Rent Information</h3>
                                </div>
                                <div className="text-center mb-3">
                                    <p className="text-3xl font-bold text-green-600 mb-1">
                                        ${property.price.monthlyRent.toLocaleString()}/mes
                                    </p>
                                    <p className="text-sm text-gray-600">Monthly Rent</p>
                                </div>
                                
                                {/* Rental Details */}
                                <div className="space-y-2 text-sm">
                                    {property.price.deposit !== undefined && (
                                        <div className="flex justify-between items-center bg-white p-2 rounded">
                                            <span className="text-gray-600">Deposit:</span>
                                            <span className="font-semibold text-green-700">${property.price.deposit.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {property.price.leaseDuration && (
                                        <div className="flex justify-between items-center bg-white p-2 rounded">
                                            <span className="text-gray-600">Minimum contract:</span>
                                            <span className="font-semibold text-green-700">{property.price.leaseDuration} months</span>
                                        </div>
                                    )}
                                    {property.price.maintenance && (
                                        <div className="flex justify-between items-center bg-white p-2 rounded">
                                            <span className="text-gray-600">Maintenance:</span>
                                            <span className="font-semibold text-green-700">${property.price.maintenance.toLocaleString()}/mes</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Condiciones de renta */}
                            {property.price.leaseConditions && (
                                <div className="bg-green-50 p-3 rounded-lg mb-4 text-sm">
                                    <span className="font-semibold text-green-800 block mb-1">Rent Conditions:</span>
                                    <p className="text-gray-700 text-xs whitespace-pre-line">{property.price.leaseConditions}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Informative message for Rent/Sale modality */}
                    {property.businessMode === 'both' && (
                        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-l-4 border-purple-400 p-3 rounded-r-lg mb-4">
                            <div className="flex items-start">
                                <IoBusinessSharp className="text-purple-600 text-xl mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-purple-800">Rent/Sale</p>
                                    <p className="text-xs text-purple-700 mt-1">
                                        This property is available for both sale and rent. You can choose the option that best suits your needs.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información del creador - Solo admin/co-admin */}
                    {(isAdmin || isCoAdmin) && property.createdBy && (
                        <div className="bg-gray-100 p-3 rounded-lg mb-6 text-sm border-l-4 border-blue-500">
                            <p className="text-gray-700">
                                <span className="font-semibold">Uploaded by:</span> {property.createdBy.username}
                            </p>
                            {property.createdBy.email && (
                                <p className="text-gray-500 text-xs mt-1">{property.createdBy.email}</p>
                            )}
                        </div>
                    )}

                    {/* Última modificación - Solo admin/co-admin */}
                    {(isAdmin || isCoAdmin) && property.lastModifiedBy && property.updatedAt && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-6 text-sm border-l-4 border-yellow-500">
                            <div className="text-gray-700 flex items-center">
                                <IoTimeSharp className="mr-2 text-yellow-600" />
                                <span>
                                    <span className="font-semibold">Last modified by:</span> {property.lastModifiedBy.username}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1 ml-6">
                                {new Date(property.updatedAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}

                    {/* Main Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded">
                            <IoBedSharp className="mx-auto text-2xl text-blue-600 mb-1" />
                            <p className="font-semibold">{property.details?.bedrooms || 0}</p>
                            <p className="text-sm text-gray-600">Bedrooms</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                            <IoHomeSharp className="mx-auto text-2xl text-blue-600 mb-1" />
                            <p className="font-semibold">{property.details?.bathrooms || 0}</p>
                            <p className="text-sm text-gray-600">Bathrooms</p>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-semibold">{getPropertyTypeLabel(property.details?.propertyType)}</span>
                        </div>
                        {property.details?.squareFeet && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Area:</span>
                                <span className="font-semibold">{property.details.squareFeet.toLocaleString()} sq ft</span>
                            </div>
                        )}
                        {property.details?.yearBuilt && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Year built:</span>
                                <span className="font-semibold">{property.details.yearBuilt}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-600">Garage:</span>
                            <span className={`font-semibold ${property.details?.parking ? 'text-green-600' : 'text-red-600'}`}>
                                {property.details?.parking ? (
                                    <IoCheckmarkCircleSharp className="inline" />
                                ) : (
                                    <IoCloseCircleSharp className="inline" />
                                )}
                                {property.details?.parking ? ' Yes' : ' No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Pets:</span>
                            <span className={`font-semibold ${property.details?.petFriendly ? 'text-green-600' : 'text-red-600'}`}>
                                {property.details?.petFriendly ? (
                                    <IoPawSharp className="inline" />
                                ) : (
                                    <IoCloseCircleSharp className="inline" />
                                )}
                                {property.details?.petFriendly ? ' Allowed' : ' Not allowed'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Furnished:</span>
                            <span className={`font-semibold ${property.details?.furnished ? 'text-green-600' : 'text-gray-600'}`}>
                                {property.details?.furnished ? (
                                    <IoCheckmarkCircleSharp className="inline" />
                                ) : (
                                    <IoCloseCircleSharp className="inline" />
                                )}
                                {property.details?.furnished ? ' Yes' : ' No'}
                            </span>
                        </div>
                    </div>

                    {/* Disponibilidad */}
                    {property.availability?.availableFrom && (
                        <div className="mt-4 p-3 bg-green-50 rounded">
                            <div className="flex items-center text-green-700">
                                <IoCalendarSharp className="mr-2" />
                                <span className="text-sm">
                                    Available from: {new Date(property.availability.availableFrom).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-center">Interested in this property?</h3>
                    <p className="text-gray-600 text-center mb-6">Schedule an appointment to visit it</p>
                    <AppointmentForm propertyId={property._id} />
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
    );
}

export default PropertyDetailPage;