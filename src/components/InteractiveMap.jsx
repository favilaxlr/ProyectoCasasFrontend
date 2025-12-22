import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para propiedades
const propertyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedPropertyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  shadowSize: [49, 49]
});

// Componente para ajustar el centro del mapa
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

function InteractiveMap({ 
  properties = [], 
  center = [32.7767, -96.7970], // Dallas por defecto
  zoom = 11,
  selectedProperty = null,
  onPropertyClick = null,
  height = '600px',
  mapStyle = 'osm' // 'osm' o 'satellite'
}) {
  // Filtrar propiedades con coordenadas válidas
  const validProperties = properties.filter(
    p => p.address?.coordinates?.lat && p.address?.coordinates?.lng
  );

  // Configuración de tiles según el estilo
  const tileConfig = mapStyle === 'satellite' ? {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  } : {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={tileConfig.attribution}
          url={tileConfig.url}
        />
        
        <MapController 
          center={selectedProperty ? 
            [selectedProperty.address.coordinates.lat, selectedProperty.address.coordinates.lng] : 
            center
          } 
          zoom={selectedProperty ? 15 : zoom} 
        />
        
        {validProperties.map((property) => {
          const isSelected = selectedProperty?._id === property._id;
          
          return (
            <Marker
              key={property._id}
              position={[property.address.coordinates.lat, property.address.coordinates.lng]}
              icon={isSelected ? selectedPropertyIcon : propertyIcon}
              eventHandlers={{
                click: () => {
                  if (onPropertyClick) {
                    onPropertyClick(property);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  {property.images?.[0]?.url && (
                    <img 
                      src={property.images[0].url} 
                      alt={property.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-bold text-lg mb-1">{property.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {property.address.street}, {property.address.city}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[var(--gold-accent)]">
                      ${property.price.rent?.toLocaleString()}/mes
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 text-xs text-gray-600">
                    <span>🛏️ {property.details.bedrooms}</span>
                    <span>🚿 {property.details.bathrooms}</span>
                    {property.details.squareFeet && (
                      <span>📏 {property.details.squareFeet} sq ft</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default InteractiveMap;
