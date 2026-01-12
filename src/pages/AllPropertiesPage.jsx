import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useProperties } from "../context/PropertyContext";
import PropertyCard from '../components/PropertyCard';
import InteractiveMap from '../components/InteractiveMap';
import { IoArrowBack, IoMapSharp, IoListSharp, IoFunnelSharp, IoBusinessSharp } from 'react-icons/io5';

function AllPropertiesPage() {
  const navigate = useNavigate();
  const { properties, getAllProperties } = useProperties();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: ''
  });
  const [viewMode, setViewMode] = useState('split'); // 'split', 'list', 'map'
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortOption, setSortOption] = useState('price-low');
  const [operationType, setOperationType] = useState('all');

  useEffect(() => {
    getAllProperties();
  }, []);

  const filteredProperties = properties.filter(property => {
    // Filtro por tipo de operación
    if (operationType === 'sale' && !(property.businessMode === 'sale' || property.businessMode === 'both' || !property.businessMode)) return false;
    if (operationType === 'rent' && !(property.businessMode === 'rent' || property.businessMode === 'both')) return false;
    if (operationType === 'both' && property.businessMode !== 'both') return false;
    
    // Otros filtros
    if (filters.minPrice && property.price?.sale < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && property.price?.sale > parseInt(filters.maxPrice)) return false;
    if (filters.bedrooms && property.details?.bedrooms !== parseInt(filters.bedrooms)) return false;
    if (filters.propertyType && property.details?.propertyType !== filters.propertyType) return false;
    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOption === 'price-low') return (a.price?.sale || 0) - (b.price?.sale || 0);
    if (sortOption === 'price-high') return (b.price?.sale || 0) - (a.price?.sale || 0);
    return 0;
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[var(--soft-black)] px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 btn-secondary px-3 py-2 rounded-lg font-medium transition-all text-sm md:text-base"
          >
            <IoArrowBack size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "'Arial', sans-serif" }}>
            Available Properties
          </h1>
        </div>
        
        {/* View Mode Buttons */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          {/* Primera fila en móvil: Tipo de operación y botones de vista */}
          <div className="flex gap-2 items-center">
            {/* Filtro de Tipo de Operación */}
            <div className="flex items-center gap-1 md:gap-2 bg-white px-1.5 md:px-3 py-2 rounded-lg border border-gray-300 hover:border-[var(--gold-accent)] transition-all shadow-sm flex-shrink-0">
              <IoBusinessSharp className="text-[var(--gold-accent)] text-base md:text-lg flex-shrink-0" />
              <select 
                value={operationType} 
                onChange={(e) => setOperationType(e.target.value)}
                className="bg-transparent text-gray-900 text-xs md:text-sm font-medium focus:outline-none cursor-pointer pr-0"
              >
                <option value="all">All</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
                <option value="both">Rent/Sale</option>
              </select>
            </div>
            
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base flex-shrink-0 ${
                viewMode === 'split' 
                  ? 'bg-[var(--gold-accent)] text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <IoMapSharp size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Split View</span>
              <span className="sm:hidden">Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base flex-shrink-0 ${
                viewMode === 'list' 
                  ? 'bg-[var(--gold-accent)] text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <IoListSharp size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">List</span>
              <span className="sm:hidden">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base flex-shrink-0 ${
                viewMode === 'map' 
                  ? 'bg-[var(--gold-accent)] text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <IoMapSharp size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Full Map</span>
              <span className="sm:hidden">Map</span>
            </button>
          </div>
          
          {/* Segunda fila en móvil: Selector de Ordenamiento (solo visible en list y split) */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className="flex justify-center md:justify-start">
              <div className="flex items-center gap-1 md:gap-2 bg-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 hover:border-[var(--gold-accent)] transition-all shadow-sm">
                <IoFunnelSharp className="text-[var(--gold-accent)] text-sm md:text-lg flex-shrink-0" />
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent text-gray-900 text-xs md:text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="price-low">$ Low → High</option>
                  <option value="price-high">$ High → Low</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'map' ? (
        // Full Map View
        <div className="flex-1">
          <InteractiveMap 
            properties={filteredProperties}
            selectedProperty={selectedProperty}
            onPropertyClick={setSelectedProperty}
            center={[32.7767, -96.7970]}
            zoom={11}
            height="100%"
          />
        </div>
      ) : viewMode === 'split' ? (
        // Split View: Map + List
        <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-200px)]">
          <div className="w-full md:w-7/12 h-[35vh] md:h-full">
            <InteractiveMap 
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onPropertyClick={setSelectedProperty}
              center={[32.7767, -96.7970]}
              zoom={11}
              height="100%"
              isSplitView={true}
            />
          </div>
          <div className="w-full md:w-5/12 flex-1 md:h-full overflow-y-auto p-2 md:p-4 bg-gray-50 scrollbar-visible">
            <style>{`
              .scrollbar-visible::-webkit-scrollbar {
                width: 12px;
              }
              .scrollbar-visible::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 10px;
              }
              .scrollbar-visible::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 10px;
              }
              .scrollbar-visible::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}</style>
            <div className="space-y-4">
              {sortedProperties.length > 0 ? (
                sortedProperties.map(property => (
                  <div
                    key={property._id}
                    onClick={() => setSelectedProperty(property)}
                    className={`cursor-pointer transition-all ${
                      selectedProperty?._id === property._id ? 'ring-2 ring-[var(--gold-accent)]' : ''
                    }`}
                  >
                    <PropertyCard property={property} compact />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No properties match the filters
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // List View Only
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maximum Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="$999999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Any</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.length > 0 ? (
              sortedProperties.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No properties match the filters
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AllPropertiesPage;