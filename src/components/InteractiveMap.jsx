import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import L from 'leaflet';
import { IoEyeSharp } from 'react-icons/io5';
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
        ${isSelected ? '<div style="position: absolute; top: -8px; right: -8px; width: 16px; height: 16px; background: #1b6487; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>' : ''}
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
    case 'VENDIDA': return '#DC2626'; // Rojo
    default: return '#9E9E9E'; // Gris
  }
};

// Crear iconos según el estado de la propiedad
const propertyIcon = (property) => createHouseIcon(getIconColor(property.status), false);
const selectedPropertyIcon = (property) => createHouseIcon(getIconColor(property.status), true);

// Componente para un marcador individual que maneja su propio popup
function PropertyMarker({ property, isSelected, onPropertyClick, getStatusColor, getStatusLabel, isSplitView = false }) {
  const markerRef = useRef(null);
  
  // Abrir popup automáticamente cuando se selecciona desde la lista
  useEffect(() => {
    if (isSelected && markerRef.current) {
      // En móvil SPLIT view, necesita más tiempo por la animación del mapa
      const isMobile = window.innerWidth < 768;
      const delay = (isMobile && isSplitView) ? 1000 : 600;
      
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, delay);
    }
  }, [isSelected, isSplitView]);
  
  return (
    <Marker
      ref={markerRef}
      position={[property.address.coordinates.lat, property.address.coordinates.lng]}
      icon={isSelected ? selectedPropertyIcon(property) : propertyIcon(property)}
      eventHandlers={{
        click: (e) => {
          // Prevenir que el click se propague al mapa
          L.DomEvent.stopPropagation(e);
          
          if (onPropertyClick) {
            onPropertyClick(property);
          }
          
          // Asegurar que el popup se abre
          if (markerRef.current) {
            setTimeout(() => {
              if (markerRef.current) {
                markerRef.current.openPopup();
              }
            }, 50);
          }
        },
      }}
    >
      <Popup 
        maxWidth={isSplitView && window.innerWidth < 768 ? 240 : (window.innerWidth < 768 ? 220 : 320)} 
        minWidth={isSplitView && window.innerWidth < 768 ? 220 : (window.innerWidth < 768 ? 200 : 280)}
        className="custom-leaflet-popup"
        closeButton={true}
        autoClose={isSplitView && window.innerWidth < 768 ? false : true}
        autoPan={isSplitView && window.innerWidth < 768 ? false : true}
        keepInView={true}
      >
        {/* Layout horizontal para SPLIT view móvil */}
        {isSplitView && window.innerWidth < 768 ? (
          <div className="flex gap-1.5 p-1.5">
            {/* Imagen a la izquierda */}
            {property.images?.[0]?.url && (
              <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                <img 
                  src={property.images[0].url} 
                  alt={property.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            
            {/* Info a la derecha */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="font-bold text-[9px] leading-tight line-clamp-2 mb-0.5">{property.title}</h3>
                <p className="text-[7px] text-gray-600 leading-tight mb-0.5">{property.address?.street}, {property.address?.city}</p>
                {property.businessMode && (
                  <span className={`inline-block text-[6px] font-semibold px-1 py-0.5 rounded ${
                    property.businessMode === 'sale' ? 'bg-blue-100 text-blue-800' :
                    property.businessMode === 'rent' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {property.businessMode === 'sale' && 'Sale'}
                    {property.businessMode === 'rent' && 'Rent'}
                    {property.businessMode === 'both' && 'R/S'}
                  </span>
                )}
              </div>
              
              <div className="flex gap-1 text-[6px] text-gray-700 mt-0.5">
                <div className="text-center bg-gray-50 rounded px-1 py-0.5">
                  <div className="font-bold text-[8px]">{property.details.bedrooms}</div>
                  <div>Bd</div>
                </div>
                <div className="text-center bg-gray-50 rounded px-1 py-0.5">
                  <div className="font-bold text-[8px]">{property.details.bathrooms}</div>
                  <div>Ba</div>
                </div>
                <div className="text-center bg-gray-50 rounded px-1 py-0.5">
                  <div className="font-bold text-[8px]">{property.details.squareFeet || 'N/A'}</div>
                  <div>Ft²</div>
                </div>
              </div>
              
              <Link 
                to={`/properties/${property._id}`}
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white rounded text-[8px] font-bold px-1.5 py-1 mt-0.5 gap-1"
              >
                <IoEyeSharp className="text-[9px] text-white" />
                <span className="text-white font-bold">View Details</span>
              </Link>
            </div>
          </div>
        ) : (
          // Layout vertical para MAP view y desktop
          <div className={`max-w-full ${window.innerWidth < 768 ? 'p-2' : 'p-3'}`}>
            {property.images?.[0]?.url && (
              <div className={`w-full bg-gray-100 rounded shadow-sm flex items-center justify-center overflow-hidden ${window.innerWidth < 768 ? 'h-24 mb-1.5' : 'h-40 mb-1.5'}`}>
                <img 
                  src={property.images[0].url} 
                  alt={property.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            
            <div className="space-y-1 mb-1.5">
              <div className="flex justify-between items-start gap-1">
                <h3 className={`font-bold leading-tight flex-1 ${window.innerWidth < 768 ? 'text-[10px]' : 'text-base'}`}>{property.title}</h3>
              </div>
              <span className={`inline-block font-semibold px-1 py-0.5 rounded ${window.innerWidth < 768 ? 'text-[8px]' : 'text-xs'} ${getStatusColor(property.status)} bg-opacity-20`}>
                {getStatusLabel(property.status)}
              </span>
            </div>
            
            <p className={`text-gray-600 ${window.innerWidth < 768 ? 'text-[8px] leading-tight mb-1' : 'text-sm mb-1'}`}>
              {property.address?.street}, {property.address?.city}
            </p>
            
            <div className="mb-1">
              {property.businessMode && (
                <div className="mb-1">
                  <span className={`inline-flex items-center px-1 py-0.5 rounded-full font-semibold ${
                    property.businessMode === 'sale' ? 'bg-blue-100 text-blue-800' :
                    property.businessMode === 'rent' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  } ${window.innerWidth < 768 ? 'text-[8px]' : 'text-xs'}`}>
                    {property.businessMode === 'sale' && 'For Sale'}
                    {property.businessMode === 'rent' && 'For Rent'}
                    {property.businessMode === 'both' && 'Rent/Sale'}
                  </span>
                </div>
              )}
            
            {/* Ocultar precios en móvil para ahorrar espacio */}
            {window.innerWidth >= 768 && (
              <>
                {property.businessMode === 'both' && property.price?.sale && property.price?.monthlyRent ? (
                  <div className="space-y-0.5">
                    <div>
                      <span className={`font-bold text-blue-600 ${window.innerWidth < 768 ? 'text-xs' : 'text-lg'}`}>
                        ${property.price.sale.toLocaleString()}
                      </span>
                      <span className={`text-gray-500 ml-0.5 ${window.innerWidth < 768 ? 'text-[9px]' : 'text-xs'}`}>/sale</span>
                    </div>
                    <div>
                      <span className={`font-bold text-green-600 ${window.innerWidth < 768 ? 'text-xs' : 'text-lg'}`}>
                        ${property.price.monthlyRent.toLocaleString()}
                      </span>
                      <span className={`text-gray-500 ml-0.5 ${window.innerWidth < 768 ? 'text-[9px]' : 'text-xs'}`}>/month</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {(!property.businessMode || property.businessMode === 'sale') && property.price?.sale && (
                      <div>
                        <span className={`font-bold text-blue-600 ${window.innerWidth < 768 ? 'text-sm' : 'text-xl'}`}>
                          ${property.price.sale.toLocaleString()}
                        </span>
                        <span className={`text-gray-500 ml-0.5 ${window.innerWidth < 768 ? 'text-[9px]' : 'text-sm'}`}>/sale</span>
                      </div>
                    )}
                    
                    {property.businessMode === 'rent' && property.price?.monthlyRent && (
                      <div>
                        <span className={`font-bold text-green-600 ${window.innerWidth < 768 ? 'text-sm' : 'text-xl'}`}>
                          ${property.price.monthlyRent.toLocaleString()}
                        </span>
                        <span className={`text-gray-500 ml-0.5 ${window.innerWidth < 768 ? 'text-[9px]' : 'text-sm'}`}>/month</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          
          <div className={`grid grid-cols-3 gap-0.5 text-gray-700 ${window.innerWidth < 768 ? 'text-[8px] mb-1' : 'text-xs mb-1'}`}>
            <div className={`text-center bg-gray-50 rounded ${window.innerWidth < 768 ? 'py-0.5 px-0.5' : 'py-2'}`}>
              <div className={`font-bold text-gray-800 ${window.innerWidth < 768 ? 'text-[10px]' : 'text-base'}`}>{property.details.bedrooms}</div>
              <div className={window.innerWidth < 768 ? 'text-[7px]' : 'text-xs'}>Beds</div>
            </div>
            <div className={`text-center bg-gray-50 rounded ${window.innerWidth < 768 ? 'py-0.5 px-0.5' : 'py-2'}`}>
              <div className={`font-bold text-gray-800 ${window.innerWidth < 768 ? 'text-[10px]' : 'text-base'}`}>{property.details.bathrooms}</div>
              <div className={window.innerWidth < 768 ? 'text-[7px]' : 'text-xs'}>Baths</div>
            </div>
            <div className={`text-center bg-gray-50 rounded ${window.innerWidth < 768 ? 'py-0.5 px-0.5' : 'py-2'}`}>
              <div className={`font-bold text-gray-800 ${window.innerWidth < 768 ? 'text-[10px]' : 'text-base'}`}>
                {property.details.squareFeet ? `${property.details.squareFeet}` : 'N/A'}
              </div>
              <div className={window.innerWidth < 768 ? 'text-[7px]' : 'text-xs'}>Ft²</div>
            </div>
          </div>
          
          <div className={`${window.innerWidth < 768 ? 'hidden' : 'flex flex-wrap gap-1 mb-1.5'}`}>
            {property.details?.parking && (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                Garage
              </span>
            )}
            {property.details?.petFriendly && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                Pet-friendly
              </span>
            )}
            {property.details?.furnished && (
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
                Furnished
              </span>
            )}
          </div>
          
          <div className={`text-center ${window.innerWidth < 768 ? 'mt-1' : 'mt-2'}`}>
            <Link 
              to={`/properties/${property._id}`}
              className={`inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded font-bold transition-all shadow-lg hover:shadow-xl ${window.innerWidth < 768 ? 'px-1.5 py-1 text-[9px] gap-0.5' : 'px-4 py-3 text-sm gap-1'}`}
            >
              <IoEyeSharp className={window.innerWidth < 768 ? 'text-[10px] text-white' : 'text-lg text-white'} />
              <span className="text-white">{window.innerWidth < 768 ? 'View' : 'View full details'}</span>
            </Link>
          </div>
        </div>
        )}
      </Popup>
    </Marker>
  );
}

// Componente para ajustar el centro del mapa
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // En móviles: offset hacia arriba para que el popup no cubra el marcador
        map.setView(center, zoom, {
          animate: true,
          duration: 0.5,
          paddingTopLeft: [0, 100]
        });
      } else {
        // En desktop: offset hacia la derecha para respetar el panel flotante
        // Panel tiene ~32rem (512px) + márgenes
        const panelWidth = 540; // 32rem + márgenes
        map.setView(center, zoom, {
          animate: true,
          duration: 0.5,
          paddingTopLeft: [panelWidth / 2, 0] // Centrar considerando el panel
        });
      }
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
  mapStyle = 'osm', // 'osm' o 'satellite'
  isSplitView = false // Indica si está en modo SPLIT
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
      case 'DISPONIBLE': return 'Available';
      case 'EN_CONTRATO': return 'Under Contract';
      case 'VENDIDA': return 'Sold';
      default: return status;
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 px-3 py-2 text-[11px] md:text-xs font-semibold text-gray-700 space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#4CAF50' }}></span>
          Available
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#FF9800' }}></span>
          Under contract
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#DC2626' }}></span>
          Sold
        </div>
      </div>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        scrollWheelZoom={true}
        zoomControl={true}
        closePopupOnClick={false}
      >
        <TileLayer
          attribution={tileConfig.attribution}
          url={tileConfig.url}
        />
        
        {/* Controlador para centrar el mapa cuando se selecciona una propiedad */}
        {selectedProperty?.address?.coordinates && (
          <MapController 
            center={[selectedProperty.address.coordinates.lat, selectedProperty.address.coordinates.lng]}
            zoom={15}
          />
        )}
        
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
                    <path fill="#1b6487" stroke="#fff" stroke-width="0.8"
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
          {validProperties.map((property) => (
            <PropertyMarker
              key={property._id}
              property={property}
              isSelected={selectedProperty?._id === property._id}
              onPropertyClick={onPropertyClick}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              isSplitView={isSplitView}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default InteractiveMap;
