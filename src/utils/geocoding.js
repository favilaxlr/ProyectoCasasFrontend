import { useState } from 'react';

/**
 * Servicio de geocodificación usando Nominatim (OpenStreetMap)
 * Totalmente gratuito, sin API key necesaria
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Importante: Añadir un User-Agent para cumplir con las políticas de uso
const headers = {
  'User-Agent': 'FRFamilyInvestments/1.0'
};

/**
 * Geocodifica una dirección a coordenadas
 * @param {string} address - Dirección completa a geocodificar
 * @returns {Promise<{lat: number, lng: number, display_name: string} | null>}
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` + 
      new URLSearchParams({
        q: address,
        format: 'json',
        limit: '1',
        addressdetails: '1'
      }),
      { headers }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name,
        address: data[0].address
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Geocodificación inversa: convierte coordenadas a dirección
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<object | null>}
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` + 
      new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json'
      }),
      { headers }
    );
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Busca múltiples ubicaciones
 * @param {string} query - Búsqueda
 * @returns {Promise<Array>}
 */
export const searchLocations = async (query) => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?` + 
      new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5',
        addressdetails: '1'
      }),
      { headers }
    );
    
    const data = await response.json();
    return data.map(item => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
      address: item.address
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

/**
 * Hook de React para geocodificación
 */
export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const geocode = async (address) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await geocodeAddress(address);
      setResults(result ? [result] : []);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const search = async (query) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchLocations(query);
      setResults(searchResults);
      return searchResults;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    geocode,
    search,
    loading,
    error,
    results
  };
};

export default {
  geocodeAddress,
  reverseGeocode,
  searchLocations,
  useGeocoding
};
