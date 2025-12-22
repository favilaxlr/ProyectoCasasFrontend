import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { createPropertyRequest, getPropertyRequest, updatePropertyRequest } from '../api/properties';
import PropertyGallery from '../components/PropertyGallery';
import ImageUploader from '../components/ImageUploader';
import LocationPicker from '../components/LocationPicker';

function PropertyFormPage() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [property, setProperty] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    useEffect(() => {
        if (isEditing) {
            loadProperty();
        }
    }, [id]);

    const loadProperty = async () => {
        try {
            const res = await getPropertyRequest(id);
            const propertyData = res.data;
            setProperty(propertyData);
            
            // Cargar coordenadas si existen
            if (propertyData.address?.coordinates) {
                setCoordinates(propertyData.address.coordinates);
            }
            
            // Llenar formulario con datos existentes
            Object.keys(propertyData).forEach(key => {
                if (key === 'address') {
                    Object.keys(propertyData.address).forEach(addressKey => {
                        if (addressKey !== 'coordinates') {
                            setValue(`address.${addressKey}`, propertyData.address[addressKey]);
                        }
                    });
                } else if (key === 'price') {
                    Object.keys(propertyData.price).forEach(priceKey => {
                        setValue(`price.${priceKey}`, propertyData.price[priceKey]);
                    });
                } else if (key === 'details') {
                    Object.keys(propertyData.details).forEach(detailKey => {
                        setValue(`details.${detailKey}`, propertyData.details[detailKey]);
                    });
                } else if (key === 'amenities') {
                    setValue('amenities', propertyData.amenities.join(', '));
                } else {
                    setValue(key, propertyData[key]);
                }
            });
        } catch (error) {
            console.error('Error loading property:', error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Agregar datos del formulario
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'object' && data[key] !== null) {
                    Object.keys(data[key]).forEach(subKey => {
                        formData.append(`${key}.${subKey}`, data[key][subKey]);
                    });
                } else {
                    formData.append(key, data[key]);
                }
            });

            // Agregar coordenadas si existen (convertir a números)
            if (coordinates) {
                formData.append('address.coordinates.lat', parseFloat(coordinates.lat));
                formData.append('address.coordinates.lng', parseFloat(coordinates.lng));
            }

            // Agregar imágenes
            images.forEach(image => {
                formData.append('images', image);
            });

            if (isEditing) {
                await updatePropertyRequest(id, formData);
            } else {
                await createPropertyRequest(formData);
            }
            
            navigate('/admin/properties');
        } catch (error) {
            console.error('Error saving property:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        setImages([...e.target.files]);
    };

    return (
        <div className="page-container max-w-4xl mx-auto p-6">
            <div className="animate-slide-in-left mb-8">
                <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">
                    {isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}
                </h1>
                <p className="text-gray-600">Complete la información de la propiedad</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Información básica */}
                <div className="form-container stagger-item">
                    <h2 className="text-xl font-semibold mb-4 text-[var(--charcoal)] flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[var(--gold-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Información Básica
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Título</label>
                            <input
                                {...register('title', { required: 'Título es requerido' })}
                                className={`input-field ${errors.title ? 'error' : ''}`}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Precio de Renta</label>
                            <input
                                type="number"
                                {...register('price.rent', { required: 'Precio es requerido' })}
                                className={`input-field ${errors.price?.rent ? 'error' : ''}`}
                            />
                            {errors.price?.rent && <p className="text-red-500 text-sm">{errors.price.rent.message}</p>}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Descripción</label>
                        <textarea
                            {...register('description', { required: 'Descripción es requerida' })}
                            rows="4"
                            className={`input-field ${errors.description ? 'error' : ''}`}
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>
                </div>

                {/* Dirección */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-[var(--charcoal)] flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[var(--gold-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Dirección y Ubicación
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Calle</label>
                            <input
                                {...register('address.street', { required: 'Calle es requerida' })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Ciudad</label>
                            <input
                                {...register('address.city', { required: 'Ciudad es requerida' })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Estado</label>
                            <input
                                {...register('address.state', { required: 'Estado es requerido' })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Código Postal</label>
                            <input
                                {...register('address.zipCode', { required: 'Código postal es requerido' })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Selector de ubicación en el mapa */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium mb-3 text-[var(--charcoal)]">
                            📍 Ubicación en el Mapa
                        </label>
                        <LocationPicker
                            initialPosition={coordinates}
                            onLocationSelect={(location) => {
                                setCoordinates(location.coordinates);
                            }}
                        />
                    </div>
                </div>

                {/* Detalles */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Detalles</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Habitaciones</label>
                            <input
                                type="number"
                                {...register('details.bedrooms', { required: 'Habitaciones es requerido' })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Baños</label>
                            <input
                                type="number"
                                {...register('details.bathrooms', { required: 'Baños es requerido' })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Tipo de Propiedad</label>
                            <select
                                {...register('details.propertyType', { required: 'Tipo es requerido' })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="house">Casa</option>
                                <option value="apartment">Apartamento</option>
                                <option value="condo">Condominio</option>
                                <option value="townhouse">Casa Adosada</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Pies Cuadrados</label>
                            <input
                                type="number"
                                {...register('details.squareFeet')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Año de Construcción</label>
                            <input
                                type="number"
                                {...register('details.yearBuilt')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Depósito</label>
                            <input
                                type="number"
                                {...register('price.deposit')}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                {...register('details.parking')}
                                className="mr-2"
                            />
                            Estacionamiento
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                {...register('details.petFriendly')}
                                className="mr-2"
                            />
                            Acepta Mascotas
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                {...register('details.furnished')}
                                className="mr-2"
                            />
                            Amueblado
                        </label>
                    </div>
                </div>

                {/* Comodidades */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Comodidades</h2>
                    <input
                        {...register('amenities')}
                        placeholder="Separar con comas: piscina, gym, seguridad"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                {/* Imágenes */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Imágenes</h2>
                    
                    {/* Mostrar galería existente si estamos editando */}
                    {isEditing && property && (
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3">Imágenes Actuales</h3>
                            <PropertyGallery 
                                property={property} 
                                isEditable={true}
                                onImageUpdate={loadProperty}
                            />
                        </div>
                    )}
                    
                    {/* Subir nuevas imágenes */}
                    {isEditing ? (
                        <ImageUploader 
                            propertyId={id}
                            onImagesUploaded={loadProperty}
                        />
                    ) : (
                        <div>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            <p className="text-sm text-gray-500 mt-2">Máximo 10 imágenes</p>
                        </div>
                    )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 animate-slide-up">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary-animated flex-1"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="loading-spinner h-5 w-5 mr-2"></div>
                                Guardando...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {isEditing ? 'Actualizar' : 'Crear Propiedad'}
                            </div>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => navigate('/admin/properties')}
                        className="btn-secondary-animated flex-1"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PropertyFormPage;