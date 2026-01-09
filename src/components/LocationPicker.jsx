import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

import { geocodeAddress, searchLocations, reverseGeocode } from '../utils/geocoding';
import { IoCloseSharp, IoSearchSharp } from 'react-icons/io5';

// Fix para iconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

// Componente para centrar el mapa cuando cambien las coordenadas
function MapCenterUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  
  return null;
}

/**
 * Componente para seleccionar ubicación en el mapa
 * Útil para formularios de creación/edición de propiedades
 */
function LocationPicker({ 
  onLocationSelect, 
  initialPosition = null,
  address = ''
}) {
  const [position, setPosition] = useState(initialPosition || { lat: 32.7767, lng: -96.7970 });
  const [searchQuery, setSearchQuery] = useState(address);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);

  // Actualizar posición cuando cambien las coordenadas externas
  useEffect(() => {
    if (initialPosition && initialPosition.lat && initialPosition.lng) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  // Actualizar searchQuery cuando cambie la dirección externa
  useEffect(() => {
    if (address && address.trim() !== '') {
      setSearchQuery(address);
    }
  }, [address]);

  // Autocompletado en tiempo real
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setLoading(true);

    // Esperar 300ms antes de hacer la búsqueda
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching location:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectLocation = (location) => {
    const newPos = { lat: location.lat, lng: location.lng };
    setPosition(newPos);
    setShowResults(false);
    setSearchQuery(location.display_name || location.address);
    
    if (onLocationSelect) {
      onLocationSelect({
        coordinates: newPos,
        address: location.display_name || location.address,
        addressDetails: location.address // Detalles estructurados de la dirección
      });
    }
  };

  const handleMapClick = async (latlng) => {
    const newPos = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPos);
    
    // Hacer geocodificación inversa para obtener la dirección
    try {
      const addressData = await reverseGeocode(latlng.lat, latlng.lng);
      if (addressData && addressData.address) {
        setSearchQuery(addressData.display_name);
        
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: newPos,
            address: addressData.display_name,
            addressDetails: addressData.address
          });
        }
      } else {
        if (onLocationSelect) {
          onLocationSelect({
            coordinates: newPos,
            address: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      if (onLocationSelect) {
        onLocationSelect({
          coordinates: newPos,
          address: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
        });
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      {/* Buscador de direcciones mejorado */}
      <div className="relative" style={{ zIndex: 1000 }}>
        <div className="relative">
          <IoSearchSharp className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Ej: 123 Main St, Dallas, TX"
            className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--gold-accent)] transition-colors bg-white relative z-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 z-20"
            >
              <IoCloseSharp size={20} />
            </button>
          )}
        </div>

        {/* Resultados de búsqueda con mejor estilo y z-index más alto */}
        {showResults && searchResults.length > 0 && (
          <div 
            ref={resultsRef}
            className="absolute w-full mt-2 bg-white border-2 border-[var(--gold-accent)] rounded-lg shadow-2xl max-h-80 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[var(--gold-accent)]/10 to-transparent p-3 border-b border-gray-100 z-10">
              <p className="text-xs text-gray-600 font-semibold px-2">
                ✨ {searchResults.length} ubicación{searchResults.length !== 1 ? 'es' : ''} encontrada{searchResults.length !== 1 ? 's' : ''}
              </p>
            </div>
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left px-5 py-4 hover:bg-gradient-to-r hover:from-[var(--gold-accent)]/10 hover:to-transparent border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-200">📍</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 group-hover:text-[var(--gold-accent)] transition-colors line-clamp-2 mb-1">
                      {result.display_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                        📐 {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                  <div className="text-[var(--gold-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Indicador de carga mejorado */}
        {loading && (
          <div 
            className="absolute w-full mt-2 bg-white border-2 border-[var(--gold-accent)]/30 rounded-lg shadow-xl p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-5 h-5 border-3 border-[var(--gold-accent)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">🔍 Buscando ubicaciones...</span>
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="h-[400px] rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapCenterUpdater center={position} />
          
          {position && (
            <Marker position={[position.lat, position.lng]} />
          )}
        </MapContainer>
      </div>

      {/* Información de ubicación actual */}
      <div className="bg-gradient-to-r from-[var(--gold-accent)]/10 to-transparent p-4 rounded-lg border-l-4 border-[var(--gold-accent)]">
        <p className="text-sm font-semibold text-gray-800 mb-2">
          📍 Ubicación seleccionada:
        </p>
        <p className="text-sm text-gray-700 font-mono bg-white/50 p-2 rounded">
          Lat: {position.lat.toFixed(6)} | Lng: {position.lng.toFixed(6)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Haz clic en el mapa para ajustar la ubicación manualmente, o busca una dirección arriba
        </p>
      </div>
    </div>
  );
}

export default LocationPicker;
