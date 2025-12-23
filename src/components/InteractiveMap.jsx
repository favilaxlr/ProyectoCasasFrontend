import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { Link } from 'react-router';
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'DISPONIBLE': return 'text-green-600';
      case 'EN_CONTRATO': return 'text-yellow-600';
      case 'VENDIDA': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'DISPONIBLE': return 'Disponible';
      case 'EN_CONTRATO': return 'En Contrato';
      case 'VENDIDA': return 'Vendida';
      default: return status;
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
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
              <Popup maxWidth={300} minWidth={250}>
                <div className="p-2">
                  {property.images?.[0]?.url && (
                    <img 
                      src={property.images[0].url} 
                      alt={property.title}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight">{property.title}</h3>
                    <span className={`text-xs font-semibold ${getStatusColor(property.status)}`}>
                      {getStatusLabel(property.status)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {property.address.street}, {property.address.city}, {property.address.state}
                  </p>
                  
                  <div className="mb-3">
                    <span className="text-xl font-bold text-green-600">
                      ${property.price.rent?.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">/mes</span>
                    {property.price?.deposit && (
                      <p className="text-xs text-gray-500">
                        Depósito: ${property.price.deposit.toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
                    <div className="text-center">
                      <div className="font-semibold">{property.details.bedrooms}</div>
                      <div>Habitaciones</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{property.details.bathrooms}</div>
                      <div>Baños</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {property.details.squareFeet ? `${property.details.squareFeet}` : 'N/A'}
                      </div>
                      <div>Pies²</div>
                    </div>
                  </div>
                  
                  {/* Características adicionales */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {property.details?.parking && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Estacionamiento
                      </span>
                    )}
                    {property.details?.petFriendly && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Pet-friendly
                      </span>
                    )}
                    {property.details?.furnished && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        Amueblado
                      </span>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      to={`/properties/${property._id}`}
                      className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Ver detalles completos
                    </Link>
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
