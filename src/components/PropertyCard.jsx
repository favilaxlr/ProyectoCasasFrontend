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
      <div className="card p-2 md:p-5 hover:shadow-xl transition-shadow overflow-hidden">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-2 md:mb-3 min-w-0">
          {/* Imagen compacta */}
          <div className="flex-shrink-0 w-full md:w-40 lg:w-48">
            {mainImage ? (
              <div className="w-full h-32 md:h-32 lg:h-36 rounded-lg overflow-hidden bg-gray-100 shadow-md flex items-center justify-center">
                <img
                  src={mainImage.url}
                  alt={property.title}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-32 md:h-32 lg:h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No photo</span>
              </div>
            )}
          </div>
          
          {/* Información compacta */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-2 mb-1 md:mb-2 min-w-0">
              {/* Show price and businessMode - Inferir si no está definido */}
              {(() => {
                let mode = property.businessMode;
                // Si no tiene businessMode, inferirlo de los precios disponibles
                if (!mode) {
                  if (property.price?.sale && property.price?.monthlyRent) {
                    mode = 'both';
                  } else if (property.price?.monthlyRent) {
                    mode = 'rent';
                  } else if (property.price?.sale) {
                    mode = 'sale';
                  }
                }
                
                return (
                  <div className="flex flex-col gap-0.5 md:gap-1 flex-shrink-0 min-w-0">
                    {/* Badge de modalidad */}
                    {mode && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${
                        mode === 'sale' ? 'bg-blue-100 text-blue-800' :
                        mode === 'rent' ? 'bg-green-100 text-green-800' :
                        'bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 text-purple-800'
                      }`}>
                        {mode === 'sale' && <><IoCardSharp className="mr-1" />Sale</>}
                        {mode === 'rent' && <><IoKeySharp className="mr-1" />Rent</>}
                        {mode === 'both' && <><IoBusinessSharp className="mr-1" />Rent/Sale</>}
                      </span>
                    )}
                    
                    {/* Para Renta/Venta, mostrar ambos precios apilados */}
                    {mode === 'both' && property.price?.sale && property.price?.monthlyRent ? (
                      <div className="flex flex-col gap-0.5 md:gap-1 min-w-0">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[10px] md:text-xs text-blue-500 font-semibold flex-shrink-0">Sale:</span>
                          <h3 className="text-xs md:text-base lg:text-lg font-bold text-blue-600 truncate">
                            ${property.price.sale.toLocaleString()}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[10px] md:text-xs text-green-500 font-semibold flex-shrink-0">Rent:</span>
                          <h3 className="text-xs md:text-base lg:text-lg font-bold text-green-600 truncate">
                            ${property.price.monthlyRent.toLocaleString()}/mo
                          </h3>
                        </div>
                      </div>
                    ) : mode === 'rent' && property.price?.monthlyRent ? (
                      <h3 className="text-sm md:text-lg lg:text-xl font-bold text-green-600 truncate">
                        ${property.price.monthlyRent.toLocaleString()}/mo
                      </h3>
                    ) : property.price?.sale ? (
                      <h3 className="text-sm md:text-lg lg:text-xl font-bold text-blue-600 truncate">
                        ${property.price.sale.toLocaleString()}
                      </h3>
                    ) : null}
                  </div>
                );
              })()}
              
              {/* Estado siempre visible para todos */}
              {property.status && (
                <span className={`px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold flex-shrink-0 self-start ${
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
            
            <p className="text-xs md:text-base text-gray-600 mb-1 md:mb-2 font-medium line-clamp-1">
              {property.address?.street}, {property.address?.city}
            </p>

            <div className="flex items-center text-[10px] md:text-sm text-gray-600 gap-1 md:gap-4 font-medium flex-wrap">
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

        {/* Botones separados debajo - Mejor visibilidad - Solo para admin/co-admin */}
        {(isAdmin || isCoAdmin) && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
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
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 max-w-md w-full p-6 rounded-lg shadow-md">
      <header className="flex justify-between items-start mb-4">
        <h1 className="text-xl font-bold text-[var(--charcoal)]">
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
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src={mainImage.url}
              alt={property.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>

      {/* Información del creador - Solo admin/co-admin */}
      {/* Información básica */}
      <div className="space-y-3">
        <div className="flex items-center text-gray-700">
          <IoLocationSharp className="mr-2 text-[var(--gold-accent)]" />
          <span className="text-sm">
            {property.address?.street}, {property.address?.city}, {property.address?.state}
          </span>
        </div>

        <div className="flex items-center justify-between text-gray-700">
          <div className="flex items-center">
            <IoBedSharp className="mr-2 text-[var(--gold-accent)]" />
            <span className="text-sm">
              {property.details?.bedrooms} beds, {property.details?.bathrooms} baths
            </span>
          </div>
          {property.details?.squareFeet && (
            <span className="text-xs text-gray-600">
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
          <div className="flex-1">
            {/* Badge de businessMode - Inferir si no está definido */}
            {(() => {
              let mode = property.businessMode;
              if (!mode) {
                if (property.price?.sale && property.price?.monthlyRent) {
                  mode = 'both';
                } else if (property.price?.monthlyRent) {
                  mode = 'rent';
                } else if (property.price?.sale) {
                  mode = 'sale';
                }
              }
              
              return mode ? (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                  mode === 'sale' ? 'bg-blue-100 text-blue-800' :
                  mode === 'rent' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {mode === 'sale' && <><IoCardSharp className="mr-1" />Sale</>}
                  {mode === 'rent' && <><IoKeySharp className="mr-1" />Rent</>}
                  {mode === 'both' && <><IoBusinessSharp className="mr-1" />Rent/Sale</>}
                </span>
              ) : null;
            })()}
            
            {/* Mostrar precios según businessMode */}
            {(() => {
              const mode = property.businessMode || 
                (property.price?.sale && property.price?.monthlyRent ? 'both' :
                 property.price?.monthlyRent ? 'rent' : 'sale');
              
              if (mode === 'both' && property.price?.sale && property.price?.monthlyRent) {
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600 font-semibold">Sale:</span>
                      <p className="text-xl font-bold text-blue-600">
                        ${property.price.sale.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 font-semibold">Rent:</span>
                      <p className="text-xl font-bold text-green-600">
                        ${property.price.monthlyRent.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                );
              } else if (mode === 'rent' && property.price?.monthlyRent) {
                return (
                  <p className="text-3xl font-bold text-green-600">
                    ${property.price.monthlyRent.toLocaleString()}/mo
                  </p>
                );
              } else if (property.price?.sale) {
                return (
                  <p className="text-3xl font-bold text-blue-600">
                    ${property.price.sale.toLocaleString()}
                  </p>
                );
              }
              return <div className="h-10"></div>;
            })()}
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">
              {(() => {
                const type = property.details?.propertyType;
                if (type === 'house') return 'House';
                if (type === 'apartment') return 'Apartment';
                if (type === 'condo') return 'Condo';
                if (type === 'townhouse') return 'Townhouse';
                if (typeof type === 'string' || typeof type === 'number') return type;
                return '';
              })()}
              </p>
              
              {/* Estado solo se muestra en el encabezado superior */}
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