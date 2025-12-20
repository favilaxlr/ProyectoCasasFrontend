import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getPropertiesRequest, deletePropertyRequest } from '../api/properties';

function PropertiesPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            const res = await getPropertiesRequest();
            setProperties(res.data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta propiedad?')) {
            try {
                await deletePropertyRequest(id);
                loadProperties();
            } catch (error) {
                console.error('Error deleting property:', error);
            }
        }
    };

    if (loading) return <div className="flex justify-center p-8">Cargando...</div>;

    return (
        <div className="page-container max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6 animate-slide-in-left">
                <h1 className="text-3xl font-bold text-[var(--charcoal)]">Mis Propiedades</h1>
                <Link
                    to="/admin/add-property"
                    className="btn-secondary-animated"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Propiedad
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center animate-float">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">No tienes propiedades registradas</h3>
                    <p className="text-gray-500 mb-6">Comienza agregando tu primera propiedad</p>
                    <Link
                        to="/admin/add-property"
                        className="btn-primary-animated inline-flex"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Crear Primera Propiedad
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property, index) => (
                        <div key={property._id} className={`card-animated hover-lift stagger-item bg-white rounded-xl shadow-lg overflow-hidden`} style={{animationDelay: `${index * 0.1}s`}}>
                            {property.images && property.images.length > 0 ? (
                                <img
                                    src={property.images.find(img => img.isMain)?.url || property.images[0]?.url}
                                    alt={property.title}
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">Sin imagen</span>
                                </div>
                            )}
                            
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{property.description}</p>
                                
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xl font-bold text-green-600">
                                        ${property.price?.rent?.toLocaleString()}/mes
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        property.availability?.isAvailable 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {property.availability?.isAvailable ? 'Disponible' : 'No disponible'}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 mb-3">
                                    <p>{property.details?.bedrooms} hab • {property.details?.bathrooms} baños</p>
                                    <p>{property.address?.city}, {property.address?.state}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/properties/${property._id}`}
                                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700"
                                    >
                                        Ver
                                    </Link>
                                    <Link
                                        to={`/admin/properties/edit/${property._id}`}
                                        className="flex-1 bg-yellow-600 text-white text-center py-2 rounded hover:bg-yellow-700"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(property._id)}
                                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PropertiesPage;