import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useProperties } from "../context/PropertyContext";
import PropertyCard from '../components/PropertyCard';
import { IoArrowBack } from 'react-icons/io5';

function AllPropertiesPage() {
  const navigate = useNavigate();
  const { properties, getAllProperties } = useProperties();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: ''
  });

  useEffect(() => {
    getAllProperties();
  }, []);

  const filteredProperties = properties.filter(property => {
    if (filters.minPrice && property.price?.rent < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && property.price?.rent > parseInt(filters.maxPrice)) return false;
    if (filters.bedrooms && property.details?.bedrooms !== parseInt(filters.bedrooms)) return false;
    if (filters.propertyType && property.details?.propertyType !== filters.propertyType) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 btn-secondary px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 mr-4"
        >
          <IoArrowBack size={20} />
          <span>Volver</span>
        </button>
        <h1 className="text-3xl font-bold text-white">
          Propiedades Disponibles
        </h1>
      </div>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Precio Mínimo</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="$0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Precio Máximo</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="$999999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Habitaciones</label>
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Cualquiera</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="house">Casa</option>
              <option value="apartment">Apartamento</option>
              <option value="condo">Condominio</option>
              <option value="townhouse">Casa Adosada</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <h1 className="text-2xl text-slate-300">No se encontraron propiedades</h1>
        </div>
      ) : (
        <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredProperties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}

export default AllPropertiesPage;