import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllPropertiesRequest } from '../api/properties'
import PropertyCard from '../components/PropertyCard'

function HomePage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [selectedMarket, setSelectedMarket] = useState('Dallas')
  const [sortOption, setSortOption] = useState('price-low')
  const [selectedProperty, setSelectedProperty] = useState(null)

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

  const sortedProperties = [...properties].sort((a, b) => {
    if (sortOption === 'price-low') return a.price - b.price
    if (sortOption === 'price-high') return b.price - a.price
    return 0
  })

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="main-header px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-[var(--gold-accent)]">
            FR FAMILY INVESTMENTS
          </h1>
          <nav className="flex space-x-6">
            <button className="text-white hover:text-[var(--gold-accent)] transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
              Explorar
            </button>
            <button className="text-white hover:text-[var(--gold-accent)] transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
              Configuración
            </button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">Tu Mercado:</span>
            <select 
              value={selectedMarket} 
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="bg-gray-800/50 text-white px-4 py-2 rounded-lg border border-gray-600/50 hover:border-[var(--gold-accent)]/50 focus:border-[var(--gold-accent)] focus:outline-none transition-all backdrop-blur-sm"
            >
              <option value="Dallas">Dallas</option>
              <option value="Houston">Houston</option>
              <option value="Austin">Austin</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-300">Ordenar por:</span>
            <select 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-gray-800/50 text-white px-4 py-2 rounded-lg border border-gray-600/50 hover:border-[var(--gold-accent)]/50 focus:border-[var(--gold-accent)] focus:outline-none transition-all backdrop-blur-sm"
            >
              <option value="price-low">Precio (menor a mayor)</option>
              <option value="price-high">Precio (mayor a menor)</option>
            </select>
          </div>
          
          {user && (
            <div className="text-white text-right">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-300">ID: {user._id?.slice(-6)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex">
        {/* Map Panel - Left Side (70%) */}
        <div className="w-[70%] relative map-placeholder">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-[var(--gold-accent)] to-[var(--charcoal)] rounded-full flex items-center justify-center shadow-2xl animate-pulse-custom">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                Mapa Interactivo
              </h3>
              <p className="text-gray-600 mb-8 text-xl font-medium">Explora propiedades por ubicación geográfica</p>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto border border-white/30 hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-8 h-8 bg-[var(--gold-accent)] rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-gray-800">Marcadores de Propiedades</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {sortedProperties.slice(0, 5).map((property) => (
                    <div 
                      key={property._id}
                      className="map-marker shadow-lg"
                      onClick={() => setSelectedProperty(property)}
                    >
                      ${property.price?.toLocaleString() || 'N/A'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
            <div className="flex">
              <button className="px-6 py-3 text-sm font-medium border-r border-gray-200 hover:bg-[var(--gold-accent)] hover:text-white transition-all duration-300 rounded-l-xl">
                Mapa
              </button>
              <button className="px-6 py-3 text-sm font-medium hover:bg-[var(--gold-accent)] hover:text-white transition-all duration-300 rounded-r-xl">
                Satélite
              </button>
            </div>
          </div>
        </div>

        {/* Properties Panel - Right Side (30%) */}
        <div className="w-[30%] property-list">
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