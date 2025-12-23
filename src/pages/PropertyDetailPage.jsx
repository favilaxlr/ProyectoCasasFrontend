import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getPropertyRequest, changePropertyStatusRequest } from '../api/properties';
import AppointmentForm from '../components/AppointmentForm';
import PropertyStatus from '../components/PropertyStatus';
import ReviewsSection from '../components/ReviewsSection';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { IoLocationSharp, IoBedSharp, IoCarSharp, IoHomeSharp, IoCalendarSharp, IoPawSharp, IoCheckmarkCircleSharp, IoCloseCircleSharp, IoPencilSharp, IoTimeSharp, IoSwapHorizontalSharp } from 'react-icons/io5';

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

    if (loading) return <div className="flex justify-center p-8">Cargando...</div>;
    if (!property) return <div className="flex justify-center p-8">Propiedad no encontrada</div>;

    const getPropertyTypeLabel = (type) => {
        const types = {
            house: 'Casa',
            apartment: 'Apartamento',
            condo: 'Condominio',
            townhouse: 'Casa Adosada'
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
            console.error('Error al cambiar estado:', error);
            toast.error('Error al cambiar el estado');
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
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="EN_CONTRATO">En Contrato</option>
                            <option value="VENDIDA">Vendida</option>
                        </select>
                    ) : (
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                            property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' :
                            property.status === 'VENDIDA' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {property.status === 'DISPONIBLE' ? 'Disponible' :
                             property.status === 'EN_CONTRATO' ? 'En Contrato' :
                             property.status === 'VENDIDA' ? 'Vendida' :
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
                            <span className="text-gray-500">Sin imágenes</span>
                        </div>
                    )}
                </div>

                {/* Información principal */}
                <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
                    <div className="text-center mb-6">
                        <p className="text-3xl font-bold text-green-600 mb-2">
                            ${property.price?.sale?.toLocaleString()}
                        </p>
                        <p className="text-gray-600">Precio de Venta</p>
                    </div>

                    {/* Información del creador - Solo admin/co-admin */}
                    {(isAdmin || isCoAdmin) && property.createdBy && (
                        <div className="bg-gray-100 p-3 rounded-lg mb-6 text-sm border-l-4 border-blue-500">
                            <p className="text-gray-700">
                                <span className="font-semibold">Subida por:</span> {property.createdBy.username}
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
                                    <span className="font-semibold">Última modificación por:</span> {property.lastModifiedBy.username}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1 ml-6">
                                {new Date(property.updatedAt).toLocaleString('es-MX', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}

                    {/* Detalles principales */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded">
                            <IoBedSharp className="mx-auto text-2xl text-blue-600 mb-1" />
                            <p className="font-semibold">{property.details?.bedrooms || 0}</p>
                            <p className="text-sm text-gray-600">Habitaciones</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded">
                            <IoHomeSharp className="mx-auto text-2xl text-blue-600 mb-1" />
                            <p className="font-semibold">{property.details?.bathrooms || 0}</p>
                            <p className="text-sm text-gray-600">Baños</p>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tipo:</span>
                            <span className="font-semibold">{getPropertyTypeLabel(property.details?.propertyType)}</span>
                        </div>
                        {property.details?.squareFeet && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Área:</span>
                                <span className="font-semibold">{property.details.squareFeet.toLocaleString()} pies²</span>
                            </div>
                        )}
                        {property.details?.yearBuilt && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Año construido:</span>
                                <span className="font-semibold">{property.details.yearBuilt}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-600">Estacionamiento:</span>
                            <span className={`font-semibold ${property.details?.parking ? 'text-green-600' : 'text-red-600'}`}>
                                {property.details?.parking ? (
                                    <IoCheckmarkCircleSharp className="inline" />
                                ) : (
                                    <IoCloseCircleSharp className="inline" />
                                )}
                                {property.details?.parking ? ' Sí' : ' No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mascotas:</span>
                            <span className={`font-semibold ${property.details?.petFriendly ? 'text-green-600' : 'text-red-600'}`}>
                                {property.details?.petFriendly ? (
                                    <IoPawSharp className="inline" />
                                ) : (
                                    <IoCloseCircleSharp className="inline" />
                                )}
                                {property.details?.petFriendly ? ' Permitidas' : ' No permitidas'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Amueblado:</span>
                            <span className={`font-semibold ${property.details?.furnished ? 'text-green-600' : 'text-gray-600'}`}>
                                {property.details?.furnished ? (
                                    <IoCheckmarkCircleSharp className="inline" />
                                ) : (
                                    <IoCloseCircleSharp className="inline" />
                                )}
                                {property.details?.furnished ? ' Sí' : ' No'}
                            </span>
                        </div>
                    </div>

                    {/* Disponibilidad */}
                    {property.availability?.availableFrom && (
                        <div className="mt-4 p-3 bg-green-50 rounded">
                            <div className="flex items-center text-green-700">
                                <IoCalendarSharp className="mr-2" />
                                <span className="text-sm">
                                    Disponible desde: {new Date(property.availability.availableFrom).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Descripción */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Comodidades */}
            {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Comodidades</h2>
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

            {/* Información de contacto */}
            {(property.contact?.phone || property.contact?.email) && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.contact.phone && (
                            <div className="flex items-center p-3 bg-gray-50 rounded">
                                <span className="font-semibold mr-2">Teléfono:</span>
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

            {/* Formulario para agendar cita - Solo si está disponible y NO es admin/co-admin */}
            {property.status === 'DISPONIBLE' && !isCoAdmin && !isAdmin && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-center">¿Interesado en esta propiedad?</h3>
                    <p className="text-gray-600 text-center mb-6">Agenda una cita para visitarla</p>
                    <AppointmentForm propertyId={property._id} />
                </div>
            )}

            {/* Opciones de administración para admin/co-admin */}
            {(isAdmin || isCoAdmin) && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Opciones de Administración</h3>
                    <p className="text-gray-600 text-center mb-6">Gestiona esta propiedad</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to={`/admin/properties/edit/${property._id}`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center"
                        >
                            <IoPencilSharp className="mr-2" size={20} />
                            Editar Propiedad
                        </Link>
                        <button
                            onClick={() => navigate('/admin/properties')}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                            Ver Todas las Propiedades
                        </button>
                    </div>
                </div>
            )}

            {/* Sección de Reseñas */}
            <ReviewsSection propertyId={property._id} />
        </div>
    );
}

export default PropertyDetailPage;