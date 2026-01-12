import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getPropertiesRequest, deletePropertyRequest, changePropertyStatusRequest } from '../api/properties';
import { toast } from 'react-toastify';
import { IoSwapHorizontalSharp, IoFunnelSharp, IoBusinessSharp, IoGlobeOutline, IoEarthSharp } from 'react-icons/io5';
import InteractiveMap from '../components/InteractiveMap';

function PropertiesPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'map'
    const [sortOption, setSortOption] = useState('price-low');
    const [operationType, setOperationType] = useState('all'); // 'all', 'sale', 'rent', 'both'
    const [mapStyle, setMapStyle] = useState('osm'); // 'osm' o 'satellite'
    const [selectedProperty, setSelectedProperty] = useState(null);

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
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await deletePropertyRequest(id);
                loadProperties();
            } catch (error) {
                console.error('Error deleting property:', error);
            }
        }
    };

    const handleStatusChange = async (propertyId, newStatus) => {
        if (!newStatus) return;

        try {
            await changePropertyStatusRequest(propertyId, newStatus, '');
            toast.success('Status updated successfully');
            loadProperties(); // Recargar lista
        } catch (error) {
            console.error('Error changing status:', error);
            toast.error('Error changing status');
        }
    };

    if (loading) return <div className="flex justify-center p-8">Loading...</div>;

    // Filtrar por tipo de operación
    const filteredProperties = properties.filter(property => {
        if (operationType === 'all') return true
        if (operationType === 'sale') {
            return !property.businessMode || property.businessMode === 'sale' || property.businessMode === 'both'
        }
        if (operationType === 'rent') {
            return property.businessMode === 'rent' || property.businessMode === 'both'
        }
        if (operationType === 'both') {
            return property.businessMode === 'both'
        }
        return true
    })

    // Ordenar propiedades
    const sortedProperties = [...filteredProperties].sort((a, b) => {
        if (sortOption === 'price-low') return (a.price?.sale || 0) - (b.price?.sale || 0)
        if (sortOption === 'price-high') return (b.price?.sale || 0) - (a.price?.sale || 0)
        return 0
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-[var(--soft-black)] px-6 py-4 mb-6 flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-white">Properties</h1>
                
                {/* Controles */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                    {/* Primera fila en móvil: Filtros */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Filtro de Tipo de Operación */}
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm min-w-[140px] flex-shrink-0">
                            <IoBusinessSharp className="text-[var(--gold-accent)] text-lg flex-shrink-0" />
                            <select 
                                value={operationType} 
                                onChange={(e) => setOperationType(e.target.value)}
                                className="bg-transparent text-gray-900 text-sm font-medium focus:outline-none cursor-pointer w-full"
                            >
                                <option value="all">All Types</option>
                                <option value="sale">Sale</option>
                                <option value="rent">Rent</option>
                                <option value="both">Rent/Sale</option>
                            </select>
                        </div>

                        {/* Selector de Ordenamiento */}
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm min-w-[160px] flex-shrink-0">
                            <IoFunnelSharp className="text-[var(--gold-accent)] text-lg flex-shrink-0" />
                            <select 
                                value={sortOption} 
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-transparent text-gray-900 text-sm font-medium focus:outline-none cursor-pointer w-full"
                            >
                                <option value="price-low">$ Low to High</option>
                                <option value="price-high">$ High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Segunda fila en móvil: Toggle Vista */}
                    <div className="flex bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex-shrink-0 w-full md:w-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 text-sm font-medium transition-all ${
                                viewMode === 'grid' 
                                    ? 'bg-[var(--gold-accent)] text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 text-sm font-medium transition-all ${
                                viewMode === 'map' 
                                    ? 'bg-[var(--gold-accent)] text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Map
                        </button>
                    </div>
                    
                    <Link
                        to="/admin/add-property"
                        className="btn-secondary-animated"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Property
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {sortedProperties.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center animate-float">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-4">You have no registered properties</h3>
                    <p className="text-gray-500 mb-6">Start by adding your first property</p>
                    <Link
                        to="/admin/add-property"
                        className="btn-primary-animated inline-flex"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create First Property
                    </Link>
                </div>
            ) : viewMode === 'map' ? (
                /* Vista de Mapa */
                <div className="h-[calc(100vh-200px)] relative rounded-xl overflow-hidden">
                    <InteractiveMap 
                        properties={sortedProperties}
                        selectedProperty={selectedProperty}
                        onPropertyClick={setSelectedProperty}
                        center={[32.7767, -96.7970]}
                        zoom={11}
                        height="100%"
                        mapStyle={mapStyle}
                    />
                    
                    {/* Map Style Controls - Flotante */}
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 z-[1000]">
                        <div className="flex">
                            <button 
                                onClick={() => setMapStyle('osm')}
                                className={`px-6 py-3 text-sm font-medium border-r border-gray-200 transition-all duration-300 rounded-l-xl flex items-center gap-2 ${
                                    mapStyle === 'osm' 
                                        ? 'bg-[var(--gold-accent)] text-white' 
                                        : 'hover:bg-[var(--gold-accent)] hover:text-white'
                                }`}
                            >
                                <IoGlobeOutline className="text-lg" />
                                Map
                            </button>
                            <button 
                                onClick={() => setMapStyle('satellite')}
                                className={`px-6 py-3 text-sm font-medium transition-all duration-300 rounded-r-xl flex items-center gap-2 ${
                                    mapStyle === 'satellite' 
                                        ? 'bg-[var(--gold-accent)] text-white' 
                                        : 'hover:bg-[var(--gold-accent)] hover:text-white'
                                }`}
                            >
                                <IoEarthSharp className="text-lg" />
                                Satellite
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Vista de Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProperties.map((property, index) => (
                        <div key={property._id} className={`card-animated hover-lift stagger-item bg-white rounded-xl shadow-lg overflow-hidden`} style={{animationDelay: `${index * 0.1}s`}}>
                            {property.images && property.images.length > 0 ? (
                                <img
                                    src={property.images.find(img => img.isMain)?.url || property.images[0]?.url}
                                    alt={property.title}
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">No image</span>
                                </div>
                            )}
                            
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold flex-1">{property.title}</h3>
                                    <select
                                        value={property.status}
                                        onChange={(e) => handleStatusChange(property._id, e.target.value)}
                                        className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                                            property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200' :
                                            property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200' :
                                            property.status === 'VENDIDA' ? 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200' :
                                            'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <option value="DISPONIBLE">Available</option>
                                        <option value="EN_CONTRATO">Under Contract</option>
                                        <option value="VENDIDA">Sold</option>
                                    </select>
                                </div>

                                {/* Business Mode Badge - Inferir si no está definido */}
                                {(() => {
                                    let mode = property.businessMode;
                                    // Si no tiene businessMode, inferirlo de los precios disponibles
                                    if (!mode) {
                                        if (property.price?.sale && property.price?.monthlyRent) {
                                            mode = 'both';
                                        } else if (property.price?.monthlyRent) {
                                            mode = 'rent';
                                        } else if (property.price?.sale) {
                                            mode = 'sale';
                                        }
                                    }
                                    
                                    if (mode) {
                                        return (
                                            <div className="mb-2">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                    mode === 'sale' ? 'bg-blue-100 text-blue-800' :
                                                    mode === 'rent' ? 'bg-green-100 text-green-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {mode === 'sale' && '🏷️ For Sale'}
                                                    {mode === 'rent' && '🔑 For Rent'}
                                                    {mode === 'both' && '💼 Rent/Sale'}
                                                </span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                
                                {/* Precios - Mostrar siempre el precio disponible */}
                                <div className="mb-3 min-h-[60px] flex items-center">
                                    {(() => {
                                        const mode = property.businessMode || 
                                            (property.price?.sale && property.price?.monthlyRent ? 'both' :
                                             property.price?.monthlyRent ? 'rent' : 'sale');
                                        
                                        if (mode === 'both') {
                                            return (
                                                <div className="space-y-1 w-full">
                                                    {property.price?.sale && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-blue-600 font-semibold">Sale:</span>
                                                            <span className="text-xl font-bold text-blue-600">
                                                                ${property.price.sale.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {property.price?.monthlyRent && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-green-600 font-semibold">Rent:</span>
                                                            <span className="text-xl font-bold text-green-600">
                                                                ${property.price.monthlyRent.toLocaleString()}/mo
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        } else if (mode === 'rent' && property.price?.monthlyRent) {
                                            return (
                                                <span className="text-2xl font-bold text-green-600">
                                                    ${property.price.monthlyRent.toLocaleString()}/mo
                                                </span>
                                            );
                                        } else if (property.price?.sale) {
                                            return (
                                                <span className="text-2xl font-bold text-blue-600">
                                                    ${property.price.sale.toLocaleString()}
                                                </span>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{property.description}</p>

                                {property.createdBy?.username && (
                                    <p className="text-xs text-gray-500 mb-1">Uploaded by: {property.createdBy.username}</p>
                                )}

                                {property.lastModifiedBy?.username && (
                                    <p className="text-xs text-yellow-700 mb-2">Modified by: {property.lastModifiedBy.username}</p>
                                )}
                                
                                <div className="text-sm text-gray-600 mb-3 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Bedrooms:</span>
                                        <span className="font-semibold">{property.details?.bedrooms || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Bathrooms:</span>
                                        <span className="font-semibold">{property.details?.bathrooms || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-semibold">
                                            {property.details?.propertyType === 'house' ? 'House' :
                                             property.details?.propertyType === 'apartment' ? 'Apartment' :
                                             property.details?.propertyType === 'condo' ? 'Condo' :
                                             property.details?.propertyType === 'townhouse' ? 'Townhouse' :
                                             property.details?.propertyType || 'N/A'}
                                        </span>
                                    </div>
                                    {property.details?.squareFeet && (
                                        <div className="flex justify-between">
                                            <span>Area:</span>
                                            <span className="font-semibold">{property.details.squareFeet.toLocaleString()} sq ft</span>
                                        </div>
                                    )}
                                    {property.price?.deposit && (
                                        <div className="flex justify-between">
                                            <span>Deposit:</span>
                                            <span className="font-semibold">${property.price.deposit.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-2">
                                        {property.address?.street}, {property.address?.city}, {property.address?.state}
                                    </div>
                                </div>

                                {/* Additional Features */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {property.details?.parking && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                            Garage
                                        </span>
                                    )}
                                    {property.details?.petFriendly && (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                            Pet-friendly
                                        </span>
                                    )}
                                    {property.details?.furnished && (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                            Furnished
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/properties/${property._id}`}
                                        className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 text-sm"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={`/admin/properties/edit/${property._id}`}
                                        className="flex-1 bg-yellow-600 text-white text-center py-2 rounded hover:bg-yellow-700 text-sm"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(property._id)}
                                        className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

export default PropertiesPage;