import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Estilos de mapa disponibles
const MAP_STYLES = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  cartodb_light: {
    name: 'CartoDB Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  cartodb_dark: {
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  cartodb_voyager: {
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  esri_world: {
    name: 'ESRI World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  hot: {
    name: 'OpenStreetMap HOT',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">HOT</a>'
  }
};

/**
 * Componente de mapa con selector de estilo
 * Permite cambiar entre diferentes estilos de mapa
 */
function MapWithStyleSelector({ 
  properties = [], 
  center = [32.7767, -96.7970],
  zoom = 11,
  height = '600px'
}) {
  const [mapStyle, setMapStyle] = useState('osm');
  const currentStyle = MAP_STYLES[mapStyle];

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      {/* Selector de estilo */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
        <select 
          value={mapStyle} 
          onChange={(e) => setMapStyle(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[var(--gold-accent)]"
        >
          {Object.entries(MAP_STYLES).map(([key, style]) => (
            <option key={key} value={key}>{style.name}</option>
          ))}
        </select>
      </div>

      {/* Mapa */}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution={currentStyle.attribution}
          url={currentStyle.url}
        />
        
        {properties.map((property) => (
          property.address?.coordinates && (
            <Marker
              key={property._id}
              position={[property.address.coordinates.lat, property.address.coordinates.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{property.title}</h3>
                  <p className="text-sm">{property.address.city}</p>
                  <p className="text-lg font-bold text-[var(--gold-accent)]">
                    ${property.price.rent?.toLocaleString()}/mes
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

export default MapWithStyleSelector;
