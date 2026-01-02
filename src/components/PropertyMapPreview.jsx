import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getPropertyRequest } from '../api/properties';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Componente para mostrar un mini mapa en la página de detalles de propiedad
 */
function PropertyMapPreview({ property }) {
  if (!property?.address?.coordinates?.lat || !property?.address?.coordinates?.lng) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-gray-500">Location not available</p>
      </div>
    );
  }

  const { lat, lng } = property.address.coordinates;

  return (
    <div className="space-y-4">
      {/* Información de dirección */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-[var(--gold-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ubicación
        </h3>
        <div className="space-y-2 text-gray-700">
          <p>{property.address.street}</p>
          <p>{property.address.city}, {property.address.state} {property.address.zipCode}</p>
          <p className="text-sm text-gray-500 font-mono">
            📍 {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </div>
        
        {/* Enlaces externos */}
        <div className="mt-4 flex gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver en Google Maps
          </a>
          
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            OpenStreetMap
          </a>
        </div>
      </div>

      {/* Mapa */}
      <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]}>
            <Popup>
              <div className="text-center">
                <strong>{property.title}</strong>
                <br />
                <span className="text-sm">{property.address.city}</span>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Indicaciones */}
      <p className="text-xs text-gray-500 text-center">
        💡 Haz clic en "Ver en Google Maps" para obtener indicaciones de cómo llegar
      </p>
    </div>
  );
}

export default PropertyMapPreview;
