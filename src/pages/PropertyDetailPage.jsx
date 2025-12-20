import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPropertyRequest } from '../api/properties';
import AppointmentForm from '../components/AppointmentForm';

function PropertyDetailPage() {
    const { id } = useParams();
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

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Galería de imágenes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div>
                    {property.images && property.images.length > 0 ? (
                        <div>
                            <img 
                                src={property.images[selectedImage]?.url} 
                                alt={property.title}
                                className="w-full h-96 object-cover rounded-lg"
                            />
                            <div className="flex gap-2 mt-4 overflow-x-auto">
                                {property.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image.url}
                                        alt={`${property.title} ${index + 1}`}
                                        className={`w-20 h-20 object-cover rounded cursor-pointer ${
                                            selectedImage === index ? 'ring-2 ring-blue-500' : ''
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

                {/* Información de la propiedad */}
                <div>
                    <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
                    <p className="text-2xl font-semibold text-green-600 mb-4">
                        ${property.price?.rent?.toLocaleString()}/mes
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded">
                            <span className="font-semibold">Habitaciones:</span> {property.details?.bedrooms}
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <span className="font-semibold">Baños:</span> {property.details?.bathrooms}
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <span className="font-semibold">Tipo:</span> {property.details?.propertyType}
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <span className="font-semibold">Pies²:</span> {property.details?.squareFeet || 'N/A'}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Dirección:</h3>
                        <p className="text-gray-700">
                            {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
                        </p>
                    </div>

                    {property.amenities && property.amenities.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Comodidades:</h3>
                            <div className="flex flex-wrap gap-2">
                                {property.amenities.map((amenity, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Descripción */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Formulario para agendar cita */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">¿Interesado en esta propiedad?</h3>
                <AppointmentForm propertyId={property._id} />
            </div>
        </div>
    );
}

export default PropertyDetailPage;