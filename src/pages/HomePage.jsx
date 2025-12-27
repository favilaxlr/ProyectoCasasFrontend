import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllPropertiesRequest } from '../api/properties'
import PropertyCard from '../components/PropertyCard'
import InteractiveMap from '../components/InteractiveMap'
import { IoLocationSharp, IoFunnelSharp, IoPersonCircleOutline, IoBusinessSharp, IoCardSharp, IoKeySharp } from 'react-icons/io5'

function HomePage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [selectedMarket, setSelectedMarket] = useState('Dallas')
  const [sortOption, setSortOption] = useState('price-low')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [mapStyle, setMapStyle] = useState('osm') // 'osm' o 'satellite'
  const [operationType, setOperationType] = useState('all') // 'all', 'sale', 'rent', 'both'

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const response = await getAllPropertiesRequest()
      setProperties(response.data)
    } catch (error) {
      console.error('Error loading properties:', error)
    }
  }

  // Filtrar por tipo de operación
  const filteredProperties = properties.filter(property => {
    if (operationType === 'all') return true
    
    // Si filtramos por 'Venta', mostrar propiedades 'sale' y 'both'
    if (operationType === 'sale') {
      return !property.businessMode || property.businessMode === 'sale' || property.businessMode === 'both'
    }
    
    // Si filtramos por 'Renta', mostrar propiedades 'rent' y 'both'
    if (operationType === 'rent') {
      return property.businessMode === 'rent' || property.businessMode === 'both'
    }
    
    // Si filtramos específicamente por 'Renta/Venta'
    if (operationType === 'both') {
      return property.businessMode === 'both'
    }
    
    return true
  })

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOption === 'price-low') return (a.price?.sale || 0) - (b.price?.sale || 0)
    if (sortOption === 'price-high') return (b.price?.sale || 0) - (a.price?.sale || 0)
    return 0
  })

  return (
    <div className="h-screen flex flex-col">
      {/* Header Rediseñado - Más limpio y compacto */}
      <div className="main-header px-6 py-3 flex justify-between items-center flex-shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-[var(--gold-accent)] tracking-wide">
            FR FAMILY INVESTMENTS
          </h1>
        </div>
        
        {/* Controles centrales - Más compactos */}
        <div className="flex items-center gap-4">
          {/* Selector de Mercado con icono */}
          <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg border border-gray-300 hover:border-[var(--gold-accent)] transition-all shadow-sm">
            <IoLocationSharp className="text-[var(--gold-accent)] text-lg" />
            <select 
              value={selectedMarket} 
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="bg-transparent text-gray-900 text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="Dallas" className="bg-white text-gray-900">Dallas</option>
              <option value="Houston" className="bg-white text-gray-900">Houston</option>
              <option value="Austin" className="bg-white text-gray-900">Austin</option>
            </select>
          </div>
          
          {/* Filtro de Tipo de Operación */}
          <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg border border-gray-300 hover:border-[var(--gold-accent)] transition-all shadow-sm">
            <IoBusinessSharp className="text-[var(--gold-accent)] text-lg" />
            <select 
              value={operationType} 
              onChange={(e) => setOperationType(e.target.value)}
              className="bg-transparent text-gray-900 text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-gray-900">Todos</option>
              <option value="sale" className="bg-white text-gray-900">Venta</option>
              <option value="rent" className="bg-white text-gray-900">Renta</option>
              <option value="both" className="bg-white text-gray-900">Renta/Venta</option>
            </select>
          </div>

          {/* Selector de Ordenamiento con icono */}
          <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg border border-gray-300 hover:border-[var(--gold-accent)] transition-all shadow-sm">
            <IoFunnelSharp className="text-[var(--gold-accent)] text-lg" />
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent text-gray-900 text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="price-low" className="bg-white text-gray-900">$ Menor a Mayor</option>
              <option value="price-high" className="bg-white text-gray-900">$ Mayor a Menor</option>
            </select>
          </div>

          {/* Info del usuario - Más compacto */}
          {user && (
            <div className="flex items-center gap-2 bg-white/90 px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
              <IoPersonCircleOutline className="text-[var(--gold-accent)] text-xl" />
              <div className="text-gray-900">
                <div className="text-sm font-medium">{user.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Panel - Left Side (70%) */}
        <div className="w-[70%] relative h-full">
          <InteractiveMap 
            properties={sortedProperties}
            selectedProperty={selectedProperty}
            onPropertyClick={setSelectedProperty}
            center={[32.7767, -96.7970]} // Dallas
            zoom={11}
            height="100%"
            mapStyle={mapStyle}
          />
          
          {/* Map Controls */}
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 z-[1000]">
            <div className="flex">
              <button 
                onClick={() => setMapStyle('osm')}
                className={`px-6 py-3 text-sm font-medium border-r border-gray-200 transition-all duration-300 rounded-l-xl ${
                  mapStyle === 'osm' 
                    ? 'bg-[var(--gold-accent)] text-white' 
                    : 'hover:bg-[var(--gold-accent)] hover:text-white'
                }`}
              >
                Mapa
              </button>
              <button 
                onClick={() => setMapStyle('satellite')}
                className={`px-6 py-3 text-sm font-medium transition-all duration-300 rounded-r-xl ${
                  mapStyle === 'satellite' 
                    ? 'bg-[var(--gold-accent)] text-white' 
                    : 'hover:bg-[var(--gold-accent)] hover:text-white'
                }`}
              >
                Satélite
              </button>
            </div>
          </div>
        </div>

        {/* Properties Panel - Right Side (30%) */}
        <div className="w-[30%] property-list overflow-y-auto h-full">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[var(--charcoal)]">
                {sortedProperties.length} Propiedades
              </h2>
              <div className="text-sm text-gray-500 font-medium">
                {selectedMarket}
              </div>
            </div>
            
            <div className="space-y-3">
              {sortedProperties.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay propiedades disponibles</h3>
                  <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda</p>
                  <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Cambia el mercado o criterios de ordenación
                  </div>
                </div>
              ) : (
                sortedProperties.map((property) => (
                  <div 
                    key={property._id}
                    className={`compact-card cursor-pointer ${
                      selectedProperty?._id === property._id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedProperty(property)}
                  >
                    <PropertyCard property={property} compact={true} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage