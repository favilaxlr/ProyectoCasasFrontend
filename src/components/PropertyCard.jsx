import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { IoTrashBinSharp, IoPencilSharp, IoLocationSharp, IoBedSharp } from 'react-icons/io5';
import Tooltip from '@mui/material/Tooltip';

function PropertyCard({ property, compact = false }) {
  const { deleteProperty } = useProperties();
  const { isAdmin } = useAuth();

  // Obtener la imagen principal o la primera imagen
  const mainImage = property.images?.find(img => img.isMain) || property.images?.[0];

  if (compact) {
    return (
      <div className="card p-4 hover:shadow-xl transition-shadow">
        <div className="flex space-x-3">
          {/* Imagen compacta */}
          <div className="flex-shrink-0">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={property.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">Sin foto</span>
              </div>
            )}
          </div>
          
          {/* Información compacta */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-bold text-[var(--charcoal)] truncate">
                ${property.price?.toLocaleString() || 'N/A'}
              </h3>
              {property.status && (
                <span className={`status-${property.status.toLowerCase().replace('_', '-')} px-2 py-1 rounded text-xs`}>
                  {property.status}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 truncate mb-2">
              {property.address?.street}, {property.address?.city}
            </p>
            
            <div className="flex items-center text-xs text-gray-500 space-x-3">
              <span>{property.details?.bedrooms || 0} Beds</span>
              <span>{property.details?.bathrooms || 0} Baths</span>
              <span>{property.details?.area || 0} Sq. Ft.</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-800 max-w-md w-full p-6 rounded-lg">
      <header className="flex justify-between items-start mb-4">
        <h1 className="text-xl font-bold text-white">
          {property.title}
        </h1>
        {property.availability?.isAvailable && (
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
            Disponible
          </span>
        )}
      </header>

      {isAdmin && (
        <div className="flex gap-x-2 justify-end border-b-2 border-b-slate-200 mb-4 pb-2">
          <Tooltip title="Eliminar">
            <button
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm'
              onClick={() => {
                deleteProperty(property._id)
              }}
            >
              <IoTrashBinSharp />
            </button>
          </Tooltip>
          <Tooltip title="Actualizar">
            <button className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm'>
              <Link to={'/properties/' + property._id}>
                <IoPencilSharp />
              </Link>
            </button>
          </Tooltip>
        </div>
      )}

      {/* Imagen principal */}
      <div className="flex justify-center mb-4">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={property.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Información básica */}
      <div className="space-y-2">
        <div className="flex items-center text-slate-300">
          <IoLocationSharp className="mr-2" />
          <span className="text-sm">
            {property.address?.city}, {property.address?.state}
          </span>
        </div>

        <div className="flex items-center text-slate-300">
          <IoBedSharp className="mr-2" />
          <span className="text-sm">
            {property.details?.bedrooms} hab, {property.details?.bathrooms} baños
          </span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-2xl font-bold text-green-400">
              ${property.price?.rent}/mes
            </p>
            <p className="text-xs text-slate-400">
              {property.details?.propertyType}
            </p>
          </div>
          
          <Link 
            to={`/properties/detail/${property._id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PropertyCard;