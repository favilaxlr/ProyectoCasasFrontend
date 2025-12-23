import { useState } from 'react';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { IoTrashBinSharp, IoPencilSharp, IoLocationSharp, IoBedSharp, IoEyeSharp } from 'react-icons/io5';
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
      <div className="card p-5 hover:shadow-xl transition-shadow">
        <div className="flex space-x-4">
          {/* Imagen compacta */}
          <div className="flex-shrink-0">
            {mainImage ? (
              <img
                src={mainImage.url}
                alt={property.title}
                className="w-28 h-28 object-cover rounded-lg cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(true);
                }}
              />
            ) : (
              <div className="w-28 h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">Sin foto</span>
              </div>
            )}
          </div>
          
          {/* Información compacta */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              {/* Mostrar precio solo si está DISPONIBLE */}
              {property.status === 'DISPONIBLE' ? (
                <h3 className="text-2xl font-bold text-green-600 truncate">
                  ${property.price?.sale?.toLocaleString()}
                </h3>
              ) : (
                <div></div>
              )}
              
              {/* Estado siempre visible para todos */}
              {property.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800 border border-green-300' :
                  property.status === 'EN_CONTRATO' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                  property.status === 'VENDIDA' ? 'bg-red-100 text-red-800 border border-red-300' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status === 'DISPONIBLE' ? 'Disponible' :
                   property.status === 'EN_CONTRATO' ? 'En Contrato' :
                   property.status === 'VENDIDA' ? 'Vendida' :
                   property.status}
                </span>
              )}
            </div>
            
            <p className="text-base text-gray-600 truncate mb-2 font-medium">
              {property.address?.street}, {property.address?.city}
            </p>

            {(isAdmin || isCoAdmin) && property.createdBy?.username && (
              <p className="text-xs text-gray-500 truncate mb-1">Subida por: {property.createdBy.username}</p>
            )}

            {(isAdmin || isCoAdmin) && property.lastModifiedBy?.username && (
              <p className="text-xs text-yellow-600 truncate mb-1">Modificada por: {property.lastModifiedBy.username}</p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600 space-x-4 font-medium">
                <span>{property.details?.bedrooms || 0} Beds</span>
                <span>{property.details?.bathrooms || 0} Baths</span>
                <span>{property.details?.area || 0} Sq. Ft.</span>
              </div>
              
              {/* Botones para todos los usuarios */}
              <div className="flex gap-1">
                {/* Botón Ver Detalles - Visible para todos */}
                <Tooltip title="Ver detalles">
                  <Link
                    to={'/properties/' + property._id}
                    className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs inline-flex items-center font-semibold'
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver detalles
                  </Link>
                </Tooltip>
                
                {/* Botones de admin/co-admin en modo compacto */}
                {(isAdmin || isCoAdmin) && (
                  <>
                    <Tooltip title="Vista previa">
                      <button
                        className='bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded text-xs'
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreview(true);
                        }}
                      >
                        <IoEyeSharp size={14} />
                      </button>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <Link
                        to={'/properties/' + property._id}
                        className='bg-green-500 hover:bg-green-600 text-white p-1.5 rounded text-xs inline-flex items-center'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IoPencilSharp size={14} />
                      </Link>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <button
                        className='bg-red-500 hover:bg-red-600 text-white p-1.5 rounded text-xs'
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProperty(property._id);
                        }}
                      >
                        <IoTrashBinSharp size={14} />
                      </button>
                    </Tooltip>
                  </>
                )}
              </div>
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

      {(isAdmin || isCoAdmin) && (
        <div className="flex gap-x-2 justify-end border-b-2 border-b-slate-200 mb-4 pb-2">
          <Tooltip title="Vista previa">
            <button
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm'
              onClick={() => setShowPreview(true)}
            >
              <IoEyeSharp />
            </button>
          </Tooltip>
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

      {/* Información del creador - Solo admin/co-admin */}
      {(isAdmin || isCoAdmin) && property.createdBy && (
        <div className="bg-gray-700 px-3 py-2 rounded-lg mb-4 text-xs">
          <p className="text-gray-300">
            Subida por: <span className="font-semibold text-[var(--gold-accent)]">{property.createdBy.username}</span>
          </p>
        </div>
      )}

      {/* Última modificación - Solo admin/co-admin */}
      {(isAdmin || isCoAdmin) && property.lastModifiedBy && (
        <div className="bg-yellow-900/30 px-3 py-2 rounded-lg mb-4 text-xs border-l-2 border-yellow-500">
          <p className="text-yellow-200">
            Modificada por: <span className="font-semibold text-yellow-400">{property.lastModifiedBy.username}</span>
          </p>
          {property.updatedAt && (
            <p className="text-yellow-300/70 text-xs mt-1">
              {new Date(property.updatedAt).toLocaleString('es-MX', {
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
              {property.details?.bedrooms} hab, {property.details?.bathrooms} baños
            </span>
          </div>
          {property.details?.squareFeet && (
            <span className="text-xs text-slate-400">
              {property.details.squareFeet} pies²
            </span>
          )}
        </div>

        {/* Características adicionales */}
        <div className="flex flex-wrap gap-2 text-xs">
          {property.details?.parking && (
            <span className="bg-green-600 text-white px-2 py-1 rounded">
              Estacionamiento
            </span>
          )}
          {property.details?.petFriendly && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded">
              Pet-friendly
            </span>
          )}
          {property.details?.furnished && (
            <span className="bg-purple-600 text-white px-2 py-1 rounded">
              Amueblado
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
                {property.details?.propertyType === 'house' ? 'Casa' :
                 property.details?.propertyType === 'apartment' ? 'Apartamento' :
                 property.details?.propertyType === 'condo' ? 'Condominio' :
                 property.details?.propertyType === 'townhouse' ? 'Casa Adosada' :
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
            Ver detalles
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