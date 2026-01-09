import { useState } from 'react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { IoTrashBinSharp, IoPencilSharp, IoLocationSharp, IoBedSharp, IoEyeSharp, IoCardSharp, IoKeySharp, IoBusinessSharp, IoHomeSharp } from 'react-icons/io5';
import Tooltip from '@mui/material/Tooltip';
import PropertyPreviewModal from './PropertyPreviewModal';

function PropertyCard({ property, compact = false }) {
  const { deleteProperty } = useProperties();
  const { isAdmin, isCoAdmin } = useAuth();
  const [showPreview, setShowPreview] = useState(false);

  // Obtener la imagen principal o la primera imagen
  const mainImage = property.images?.find(img => img.isMain) || property.images?.[0];

  if (compact) {
    return (
      <div className="card p-3 md:p-5 hover:shadow-xl transition-shadow overflow-hidden">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0 mb-3 min-w-0">
          {/* Imagen compacta */}
          <div className="flex-shrink-0 w-full md:w-40 lg:w-48">
            {mainImage ? (
              <div className="w-full h-48 md:h-32 lg:h-36 rounded-lg overflow-hidden bg-gray-50 shadow-md flex items-center justify-center">
                <img
                  src={mainImage.url}
                  alt={property.title}
                  className="max-w-full max-h-full object-contain cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-48 md:h-32 lg:h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No photo</span>
              </div>
            )}
          </div>
          
          {/* Información compacta */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2 min-w-0">
              {/* Show price according to modality and only if AVAILABLE */}
              {property.status === 'DISPONIBLE' && (
                <div className="flex flex-col gap-1 flex-shrink-0 min-w-0">
                  {/* Badge de modalidad */}
                  {property.businessMode && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      property.businessMode === 'sale' ? 'bg-blue-100 text-blue-800' :
                      property.businessMode === 'rent' ? 'bg-green-100 text-green-800' :
                      'bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 text-purple-800'
                    }`}>
                      {property.businessMode === 'sale' && <><IoCardSharp className="mr-1" />Sale</>}
                      {property.businessMode === 'rent' && <><IoKeySharp className="mr-1" />Rent</>}
                      {property.businessMode === 'both' && <><IoBusinessSharp className="mr-1" />Rent/Sale</>}
                    </span>
                  )}
                  
                  {/* Para Renta/Venta, mostrar ambos precios apilados en móvil */}
                  {property.businessMode === 'both' && property.price?.sale && property.price?.monthlyRent ? (
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs text-blue-500 font-semibold flex-shrink-0">Sale:</span>
                        <h3 className="text-sm md:text-base lg:text-lg font-bold text-blue-600 truncate">
                          ${property.price.sale.toLocaleString()}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs text-green-500 font-semibold flex-shrink-0">Rent:</span>
                        <h3 className="text-sm md:text-base lg:text-lg font-bold text-green-600 truncate">
                          ${property.price.monthlyRent.toLocaleString()}/mo
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Precio de venta (solo cuando NO es 'both') */}
                      {(!property.businessMode || property.businessMode === 'sale') && property.price?.sale && (
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-blue-600 truncate">
                          ${property.price.sale.toLocaleString()}
                        </h3>
                      )}
                      
                      {/* Precio de renta (solo cuando NO es 'both') */}
                      {property.businessMode === 'rent' && property.price?.monthlyRent && (
                        <h3 className="text-base md:text-lg lg:text-xl font-bold text-green-600 truncate">
                          ${property.price.monthlyRent.toLocaleString()}/mo
                        </h3>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Estado siempre visible para todos */}
              {property.status && (
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 self-start ${
                  property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border border-green-300' :
                  property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                  property.status === 'VENDIDA' ? 'bg-red-100 text-red-800 border border-red-300' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status === 'DISPONIBLE' ? 'Available' :
                   property.status === 'EN_CONTRATO' ? 'Under Contract' :
                   property.status === 'VENDIDA' ? 'Sold' :
                   property.status}
                </span>
              )}
            </div>
            
            <p className="text-sm md:text-base text-gray-600 mb-2 font-medium line-clamp-1">
              {property.address?.street}, {property.address?.city}
            </p>

            {(isAdmin || isCoAdmin) && property.createdBy?.username && (
              <p className="text-xs text-gray-500 truncate mb-1">Uploaded by: {property.createdBy.username}</p>
            )}

            {(isAdmin || isCoAdmin) && property.lastModifiedBy?.username && (
              <p className="text-xs text-yellow-600 truncate mb-1">Modified by: {property.lastModifiedBy.username}</p>
            )}
            
            <div className="flex items-center text-xs md:text-sm text-gray-600 gap-2 md:gap-4 font-medium flex-wrap">
              <span className="flex items-center gap-1 whitespace-nowrap">
                <IoBedSharp className="text-[var(--gold-accent)]" />
                {property.details?.bedrooms || 0} Beds
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <IoBusinessSharp className="text-[var(--gold-accent)]" />
                {property.details?.bathrooms || 0} Baths
              </span>
              <span className="flex items-center gap-1 whitespace-nowrap">
                <IoLocationSharp className="text-[var(--gold-accent)]" />
                {property.details?.squareFeet || 0} Sq. Ft.
              </span>
            </div>
          </div>
        </div>

        {/* Botones separados debajo - Mejor visibilidad */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
          {/* View Details Button - Visible for everyone */}
          <Tooltip title="View full details">
            <Link
              to={'/properties/' + property._id}
              className='flex-1 min-w-[120px] bg-blue-500 hover:bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1 md:gap-2'
              onClick={(e) => e.stopPropagation()}
            >
              <IoEyeSharp size={16} />
              <span className="hidden md:inline">View details</span>
              <span className="md:hidden">View</span>
            </Link>
          </Tooltip>
          
          {/* Botones de admin/co-admin */}
          {(isAdmin || isCoAdmin) && (
            <>
              <Tooltip title="Edit property">
                <Link
                  to={'/properties/' + property._id}
                  className='bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap'
                  onClick={(e) => e.stopPropagation()}
                >
                  <IoPencilSharp size={16} />
                  <span className="hidden md:inline">Edit</span>
                </Link>
              </Tooltip>
              <Tooltip title="Delete property">
                <button
                  className='bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap'
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProperty(property._id);
                  }}
                >
                  <IoTrashBinSharp size={16} />
                  <span className="hidden md:inline">Delete</span>
                </button>
              </Tooltip>
            </>
          )}
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
            Available
          </span>
        )}
      </header>

      {(isAdmin || isCoAdmin) && (
        <div className="flex gap-x-2 justify-end border-b-2 border-b-slate-200 mb-4 pb-2">
          <Tooltip title="Preview">
            <button
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm'
              onClick={() => setShowPreview(true)}
            >
              <IoEyeSharp />
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm'
              onClick={() => {
                deleteProperty(property._id)
              }}
            >
              <IoTrashBinSharp />
            </button>
          </Tooltip>
          <Tooltip title="Update">
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
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Información del creador - Solo admin/co-admin */}
      {(isAdmin || isCoAdmin) && property.createdBy && (
        <div className="bg-gray-700 px-3 py-2 rounded-lg mb-4 text-xs">
          <p className="text-gray-300">
            Uploaded by: <span className="font-semibold text-[var(--gold-accent)]">{property.createdBy.username}</span>
          </p>
        </div>
      )}

      {/* Última modificación - Solo admin/co-admin */}
      {(isAdmin || isCoAdmin) && property.lastModifiedBy && (
        <div className="bg-yellow-900/30 px-3 py-2 rounded-lg mb-4 text-xs border-l-2 border-yellow-500">
          <p className="text-yellow-200">
            Modified by: <span className="font-semibold text-yellow-400">{property.lastModifiedBy.username}</span>
          </p>
          {property.updatedAt && (
            <p className="text-yellow-300/70 text-xs mt-1">
              {new Date(property.updatedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      )}

      {/* Información básica */}
      <div className="space-y-3">
        <div className="flex items-center text-slate-300">
          <IoLocationSharp className="mr-2" />
          <span className="text-sm">
            {property.address?.street}, {property.address?.city}, {property.address?.state}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center">
            <IoBedSharp className="mr-2" />
            <span className="text-sm">
              {property.details?.bedrooms} beds, {property.details?.bathrooms} baths
            </span>
          </div>
          {property.details?.squareFeet && (
            <span className="text-xs text-slate-400">
              {property.details.squareFeet} sq ft
            </span>
          )}
        </div>

        {/* Additional Features */}
        <div className="flex flex-wrap gap-2 text-xs">
          {property.details?.parking && (
            <span className="bg-green-600 text-white px-2 py-1 rounded">
              Garage
            </span>
          )}
          {property.details?.petFriendly && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded">
              Pet-friendly
            </span>
          )}
          {property.details?.furnished && (
            <span className="bg-purple-600 text-white px-2 py-1 rounded">
              Furnished
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            {/* Mostrar precio solo si está DISPONIBLE */}
            {property.status === 'DISPONIBLE' ? (
              <p className="text-3xl font-bold text-green-500">
                ${property.price?.sale?.toLocaleString()}
              </p>
            ) : (
              <div className="h-10"></div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-400">
              {property.details?.propertyType === 'house' ? 'House' :
               property.details?.propertyType === 'apartment' ? 'Apartment' :
               property.details?.propertyType === 'condo' ? 'Condo' :
               property.details?.propertyType === 'townhouse' ? 'Townhouse' :
                 property.details?.propertyType}
              </p>
              
              {/* Estado siempre visible */}
              {property.status && (
                <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                  property.status === 'DISPONIBLE' ? 'bg-green-500 text-white' :
                  property.status === 'EN_CONTRATO' ? 'bg-orange-500 text-white' :
                  property.status === 'VENDIDA' ? 'bg-red-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {property.status === 'DISPONIBLE' ? 'Disponible' :
                   property.status === 'EN_CONTRATO' ? 'En Contrato' :
                   property.status === 'VENDIDA' ? 'Vendida' :
                   property.status}
                </span>
              )}
            </div>
          </div>
          
          <Link 
            to={`/properties/${property._id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            View details
          </Link>
        </div>
      </div>
      
      {/* Modal de vista previa */}
      <PropertyPreviewModal 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        propertyId={property._id}
      />
    </div>
  )
}

export default PropertyCard;