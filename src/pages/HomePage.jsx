import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllPropertiesRequest } from '../api/properties'
import PropertyCard from '../components/PropertyCard'
import InteractiveMap from '../components/InteractiveMap'
import Logo from '../components/Logo'
import { IoLocationSharp, IoFunnelSharp, IoBusinessSharp, IoGlobeOutline, IoEarthSharp, IoCloseSharp, IoMenuSharp } from 'react-icons/io5'
import WelcomeModal from '../components/WelcomeModal'

function HomePage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [selectedMarket, setSelectedMarket] = useState('Dallas')
  const [sortOption, setSortOption] = useState('price-low')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [mapStyle, setMapStyle] = useState('osm') // 'osm' o 'satellite'
  const [operationType, setOperationType] = useState('all') // 'all', 'sale', 'rent', 'both'
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = window.sessionStorage.getItem('welcomeModalDismissed')

    if (!dismissed) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 400)
      return () => clearTimeout(timer)
    }

    setShowWelcomeModal(false)
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
  const filteredProperties = Array.isArray(properties) ? properties.filter(property => {
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
  }) : []

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortOption === 'price-low') return (a.price?.sale || 0) - (b.price?.sale || 0)
    if (sortOption === 'price-high') return (b.price?.sale || 0) - (a.price?.sale || 0)
    return 0
  })

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('welcomeModalDismissed', 'true')
    }
  }

  const handlePropertySelect = (property) => {
    setSelectedProperty(property)

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsPanelOpen(false)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 70px)' }}>
      <WelcomeModal open={showWelcomeModal} onClose={handleCloseWelcomeModal} />
      {/* Header con Filtros - Responsive */}
      <div className="main-header px-4 md:px-6 py-3 md:py-4 flex-shrink-0 border-b border-gray-700/50 shadow-sm relative z-[100]">
        <div className="flex justify-end items-center gap-2 md:gap-4">
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

          {/* Usuario - Al lado del filtro */}
          {user && (
            <div className="flex items-center gap-2 bg-white px-2 md:px-3 py-2 rounded-lg border border-gray-300 shadow-sm flex-shrink-0">
              <img 
                src={user.profileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=128`}
                alt={user.username}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-[var(--gold-accent)]"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=128`;
                }}
              />
              <div className="text-gray-900 hidden md:block">
                <div className="text-sm font-medium">{user.username}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container con Mapa Full Screen y Panel Flotante */}
      <div className="flex-1 relative overflow-hidden">
        {/* Mapa Full Screen */}
        <div className="absolute inset-0">
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

        {/* Botón Toggle Panel (Solo visible cuando el panel está cerrado) */}
        {!isPanelOpen && (
          <button 
            onClick={() => setIsPanelOpen(true)}
            className="absolute left-6 top-6 z-[1001] bg-white hover:bg-[var(--gold-accent)] text-gray-700 hover:text-white p-3 rounded-xl shadow-lg transition-all duration-300 border border-gray-200 max-md:left-4 max-md:top-4"
          >
            <IoMenuSharp className="text-2xl" />
          </button>
        )}

          {/* Panel Flotante de Propiedades - Izquierda */}
          {isPanelOpen && (
            <div className="absolute left-6 top-6 bottom-6 w-[32rem] bg-white shadow-2xl z-[1000] overflow-hidden border border-gray-200 animate-slide-in-left md:left-6 md:top-6 md:bottom-6 md:w-[32rem] max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:right-0 max-md:w-full">
            {/* Header del Panel */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[var(--charcoal)]">
                  {sortedProperties.length} Properties
                </h2>
                <p className="text-sm text-gray-500">{selectedMarket}</p>
              </div>
              <button 
                onClick={() => setIsPanelOpen(false)}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
              >
                <IoCloseSharp className="text-xl" />
              </button>
            </div>

            {/* Lista de Propiedades */}
            <div className="h-[calc(100%-4rem)] overflow-y-auto p-4 space-y-3 property-list">
              {sortedProperties.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties available</h3>
                  <p className="text-gray-500 mb-4">Try adjusting the search filters</p>
                </div>
              ) : (
                sortedProperties.map((property) => (
                  <div 
                    key={property._id}
                    className={`compact-card cursor-pointer ${
                      selectedProperty?._id === property._id ? 'selected' : ''
                    }`}
                    onClick={() => handlePropertySelect(property)}
                  >
                    <PropertyCard property={property} compact={true} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage