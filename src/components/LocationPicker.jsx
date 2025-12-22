import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeAddress, searchLocations } from '../utils/geocoding';

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setShowResults(true);
      
      // Si hay resultados, usar el primero automáticamente
      if (results.length > 0) {
        const firstResult = results[0];
        handleSelectLocation(firstResult);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location) => {
    const newPos = { lat: location.lat, lng: location.lng };
    setPosition(newPos);
    setShowResults(false);
    
    if (onLocationSelect) {
      onLocationSelect({
        coordinates: newPos,
        address: location.display_name || location.address
      });
    }
  };

  const handleMapClick = (latlng) => {
    const newPos = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPos);
    
    if (onLocationSelect) {
      onLocationSelect({
        coordinates: newPos,
        address: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Buscador de direcciones */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar dirección... (ej: 123 Main St, Dallas, TX)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)]"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-[var(--gold-accent)] text-white rounded-lg hover:bg-[var(--gold-accent)]/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
              >
                <div className="font-medium text-sm">{result.display_name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="h-[400px] rounded-lg overflow-hidden border border-gray-300">
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
          
          {position && (
            <Marker position={[position.lat, position.lng]} />
          )}
        </MapContainer>
      </div>

      {/* Coordenadas actuales */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Ubicación seleccionada:</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1 font-mono">
          Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          💡 Tip: Haz clic en el mapa para ajustar la ubicación manualmente
        </p>
      </div>
    </div>
  );
}

export default LocationPicker;
