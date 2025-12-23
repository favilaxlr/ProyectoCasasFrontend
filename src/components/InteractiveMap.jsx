import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect } from 'react';
import { Link } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Icono personalizado de casita para propiedades disponibles
const createHouseIcon = (color = '#4CAF50', isSelected = false) => {
  const size = isSelected ? 40 : 32;
  return L.divIcon({
    className: 'custom-house-icon',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
             width="${size}" height="${size}" 
             style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
          <path fill="${color}" stroke="#fff" stroke-width="0.5"
                d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        ${isSelected ? '<div style="position: absolute; top: -8px; right: -8px; width: 16px; height: 16px; background: #FFD700; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>' : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

// Función para obtener color según el estado
const getIconColor = (status) => {
  switch(status) {
    case 'DISPONIBLE': return '#4CAF50'; // Verde
    case 'EN_CONTRATO': return '#FF9800'; // Naranja
    case 'VENDIDA': return '#F44336'; // Rojo
    default: return '#9E9E9E'; // Gris
  }
};

// Crear iconos según el estado de la propiedad
const propertyIcon = (property) => createHouseIcon(getIconColor(property.status), false);
const selectedPropertyIcon = (property) => createHouseIcon(getIconColor(property.status), true);

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
        
        {/* MarkerClusterGroup agrupa los marcadores automáticamente */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            let size = 50;
            
            if (count > 10) {
              size = 60;
            }
            if (count > 25) {
              size = 70;
            }
            
            return L.divIcon({
              html: `
                <div style="position: relative; width: ${size}px; height: ${size}px;">
                  <!-- Icono de casa de fondo -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                       width="${size}" height="${size}" 
                       style="filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.4)); display: block;">
                    <path fill="#C8A452" stroke="#fff" stroke-width="0.8"
                          d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  <!-- Número de propiedades - Centrado en el área de la casa -->
                  <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding-bottom: ${size * 0.15}px;
                  ">
                    <span style="
                      color: white;
                      font-weight: 900;
                      font-size: ${size > 60 ? '24px' : size > 50 ? '20px' : '18px'};
                      text-shadow: 
                        -1px -1px 0 rgba(0,0,0,0.9),  
                        1px -1px 0 rgba(0,0,0,0.9),
                        -1px 1px 0 rgba(0,0,0,0.9),
                        1px 1px 0 rgba(0,0,0,0.9),
                        0 3px 6px rgba(0,0,0,0.9);
                      font-family: Arial, sans-serif;
                      line-height: 1;
                    ">
                      ${count}
                    </span>
                  </div>
                </div>
              `,
              className: 'marker-cluster-house',
              iconSize: L.point(size, size),
              iconAnchor: [size / 2, size]
            });
          }}
        >
          {validProperties.map((property) => {
            const isSelected = selectedProperty?._id === property._id;
            
            return (
              <Marker
                key={property._id}
                position={[property.address.coordinates.lat, property.address.coordinates.lng]}
                icon={isSelected ? selectedPropertyIcon(property) : propertyIcon(property)}
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
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default InteractiveMap;
