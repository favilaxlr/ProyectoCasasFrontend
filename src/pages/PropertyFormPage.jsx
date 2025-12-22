import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { createPropertyRequest, getPropertyRequest, updatePropertyRequest } from '../api/properties';
import PropertyGallery from '../components/PropertyGallery';
import ImageUploader from '../components/ImageUploader';
import LocationPicker from '../components/LocationPicker';
import { toast } from 'react-toastify';

function PropertyFormPage() {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            details: {
                parking: false,
                petFriendly: false,
                furnished: false
            }
        }
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [property, setProperty] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    // Comodidades predefinidas comunes
    const availableAmenities = [
        { id: 'pool', label: 'Piscina', icon: '🏊' },
        { id: 'gym', label: 'Gimnasio', icon: '💪' },
        { id: 'security', label: 'Seguridad 24/7', icon: '🔒' },
        { id: 'garden', label: 'Jardín', icon: '🌳' },
        { id: 'balcony', label: 'Balcón', icon: '🏞️' },
        { id: 'laundry', label: 'Lavandería', icon: '🧺' },
        { id: 'ac', label: 'Aire Acondicionado', icon: '❄️' },
        { id: 'heating', label: 'Calefacción', icon: '🔥' },
        { id: 'internet', label: 'Internet', icon: '📶' },
        { id: 'elevator', label: 'Elevador', icon: '🛗' },
    ];

    const steps = [
        { number: 1, title: 'Información Básica', icon: '📝' },
        { number: 2, title: 'Ubicación', icon: '📍' },
        { number: 3, title: 'Detalles', icon: '🏠' },
        { number: 4, title: 'Imágenes', icon: '📷' }
    ];

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

            // Cargar amenidades
            if (propertyData.amenities) {
                setSelectedAmenities(propertyData.amenities);
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
                } else if (key !== 'amenities' && key !== 'images') {
                    setValue(key, propertyData[key]);
                }
            });
        } catch (error) {
            console.error('Error loading property:', error);
        }
    };

    const toggleAmenity = (amenityId) => {
        setSelectedAmenities(prev => 
            prev.includes(amenityId) 
                ? prev.filter(a => a !== amenityId)
                : [...prev, amenityId]
        );
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Procesar datos básicos (title, description)
            if (data.title) formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);

            // Procesar precio
            if (data.price) {
                if (data.price.rent) formData.append('price.rent', data.price.rent);
                if (data.price.deposit) formData.append('price.deposit', data.price.deposit);
            }

            // Procesar dirección
            if (data.address) {
                if (data.address.street) formData.append('address.street', data.address.street);
                if (data.address.city) formData.append('address.city', data.address.city);
                if (data.address.state) formData.append('address.state', data.address.state);
                if (data.address.zipCode) formData.append('address.zipCode', data.address.zipCode);
            }

            // Agregar coordenadas si existen
            if (coordinates) {
                formData.append('address.coordinates.lat', coordinates.lat);
                formData.append('address.coordinates.lng', coordinates.lng);
            }

            // Procesar detalles
            if (data.details) {
                if (data.details.propertyType) formData.append('details.propertyType', data.details.propertyType);
                if (data.details.bedrooms !== undefined) formData.append('details.bedrooms', data.details.bedrooms);
                if (data.details.bathrooms !== undefined) formData.append('details.bathrooms', data.details.bathrooms);
                if (data.details.squareFeet) formData.append('details.squareFeet', data.details.squareFeet);
                if (data.details.yearBuilt) formData.append('details.yearBuilt', data.details.yearBuilt);
                formData.append('details.parking', data.details.parking || false);
                formData.append('details.petFriendly', data.details.petFriendly || false);
                formData.append('details.furnished', data.details.furnished || false);
            }

            // Agregar amenidades seleccionadas
            selectedAmenities.forEach(amenity => {
                formData.append('amenities', amenity);
            });

            // Agregar imágenes
            images.forEach(image => {
                formData.append('images', image);
            });

            if (isEditing) {
                await updatePropertyRequest(id, formData);
                toast.success('✅ Propiedad actualizada exitosamente');
            } else {
                await createPropertyRequest(formData);
                toast.success('✅ Propiedad creada exitosamente');
            }
            
            navigate('/admin/properties');
        } catch (error) {
            console.error('Error saving property:', error);
            const errorMsg = error.response?.data?.message 
                ? (Array.isArray(error.response.data.message) 
                    ? error.response.data.message.join(', ') 
                    : error.response.data.message)
                : 'Error al guardar la propiedad';
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const validateCurrentStep = async () => {
        const values = watch();
        
        switch(currentStep) {
            case 1: // Información básica
                if (!values.title || !values.description || !values.price?.rent) {
                    toast.error('Por favor completa todos los campos requeridos');
                    return false;
                }
                break;
            case 2: // Ubicación
                if (!values.address?.street || !values.address?.city || 
                    !values.address?.state || !values.address?.zipCode) {
                    toast.error('Por favor completa la dirección completa');
                    return false;
                }
                break;
            case 3: // Detalles
                if (!values.details?.propertyType || 
                    values.details?.bedrooms === undefined || 
                    values.details?.bathrooms === undefined) {
                    toast.error('Por favor completa los detalles de la propiedad');
                    return false;
                }
                break;
            case 4: // Imágenes - opcional
                break;
        }
        return true;
    };

    const nextStep = async () => {
        const isValid = await validateCurrentStep();
        if (isValid && currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (step) => {
        setCurrentStep(step);
    };

    const propertyType = watch('details.propertyType');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="animate-slide-in-left mb-8 text-center">
                    <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">
                        {isEditing ? '✏️ Editar Propiedad' : '🏡 Nueva Propiedad'}
                    </h1>
                    <p className="text-gray-600">Complete los campos del formulario paso a paso</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
                            <div 
                                className="h-full bg-[var(--gold-accent)] transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                            />
                        </div>

                        {steps.map((step) => (
                            <button
                                key={step.number}
                                type="button"
                                onClick={() => goToStep(step.number)}
                                className={`flex flex-col items-center relative group transition-all ${
                                    currentStep === step.number ? 'scale-110' : ''
                                }`}
                            >
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center text-xl
                                    transition-all duration-300 border-4
                                    ${currentStep === step.number 
                                        ? 'bg-[var(--gold-accent)] border-[var(--gold-accent)] text-white shadow-lg' 
                                        : currentStep > step.number
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }
                                `}>
                                    {currentStep > step.number ? '✓' : step.icon}
                                </div>
                                <span className={`mt-2 text-xs md:text-sm font-medium transition-colors ${
                                    currentStep === step.number ? 'text-[var(--charcoal)]' : 'text-gray-500'
                                }`}>
                                    {step.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 min-h-[500px]">
                        
                        {/* Step 1: Información Básica */}
                        {currentStep === 1 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        📝 Información Básica
                                    </h2>
                                    <p className="text-gray-600 mt-1">Datos principales de la propiedad</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Título de la Propiedad *
                                    </label>
                                    <input
                                        {...register('title', { required: 'El título es requerido' })}
                                        placeholder="Ej: Casa moderna en zona residencial"
                                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                            errors.title ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            ⚠️ {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Descripción *
                                    </label>
                                    <textarea
                                        {...register('description', { 
                                            required: 'La descripción es requerida',
                                            minLength: { value: 10, message: 'Mínimo 10 caracteres' }
                                        })}
                                        rows="6"
                                        placeholder="Describe la propiedad, sus características principales y lo que la hace especial..."
                                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                            errors.description ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            ⚠️ {errors.description.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            💰 Precio de Renta (USD) *
                                        </label>
                                        <input
                                            type="number"
                                            {...register('price.rent', { 
                                                required: 'El precio es requerido',
                                                min: { value: 1, message: 'Debe ser mayor a 0' }
                                            })}
                                            placeholder="1000"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.price?.rent ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.price?.rent && (
                                            <p className="text-red-500 text-sm mt-1">⚠️ {errors.price.rent.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            🏦 Depósito (USD)
                                        </label>
                                        <input
                                            type="number"
                                            {...register('price.deposit', {
                                                min: { value: 0, message: 'No puede ser negativo' }
                                            })}
                                            placeholder="500"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Opcional - Depósito de garantía</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Ubicación */}
                        {currentStep === 2 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        📍 Ubicación
                                    </h2>
                                    <p className="text-gray-600 mt-1">Dirección completa de la propiedad</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            Calle y Número *
                                        </label>
                                        <input
                                            {...register('address.street', { required: 'La calle es requerida' })}
                                            placeholder="Ej: Calle Principal #123"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.street ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.address?.street && (
                                            <p className="text-red-500 text-sm mt-1">⚠️ {errors.address.street.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            Ciudad *
                                        </label>
                                        <input
                                            {...register('address.city', { required: 'La ciudad es requerida' })}
                                            placeholder="Ej: Miami"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.city ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.address?.city && (
                                            <p className="text-red-500 text-sm mt-1">⚠️ {errors.address.city.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            Estado *
                                        </label>
                                        <input
                                            {...register('address.state', { required: 'El estado es requerido' })}
                                            placeholder="Ej: Florida"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.state ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.address?.state && (
                                            <p className="text-red-500 text-sm mt-1">⚠️ {errors.address.state.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            Código Postal *
                                        </label>
                                        <input
                                            {...register('address.zipCode', { required: 'El código postal es requerido' })}
                                            placeholder="Ej: 33101"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.zipCode ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.address?.zipCode && (
                                            <p className="text-red-500 text-sm mt-1">⚠️ {errors.address.zipCode.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Mapa */}
                                <div className="mt-6">
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                                        🗺️ Ubicación en el Mapa
                                    </label>
                                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <LocationPicker
                                            initialPosition={coordinates}
                                            onLocationSelect={(location) => {
                                                setCoordinates(location.coordinates);
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Haz clic en el mapa para seleccionar la ubicación exacta
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Detalles */}
                        {currentStep === 3 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        🏠 Detalles de la Propiedad
                                    </h2>
                                    <p className="text-gray-600 mt-1">Características y especificaciones</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                                        Tipo de Propiedad *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { value: 'house', label: 'Casa', icon: '🏠' },
                                            { value: 'apartment', label: 'Apartamento', icon: '🏢' },
                                            { value: 'condo', label: 'Condominio', icon: '🏘️' },
                                            { value: 'townhouse', label: 'Casa Adosada', icon: '🏡' }
                                        ].map((type) => (
                                            <label
                                                key={type.value}
                                                className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all hover:shadow-md ${
                                                    propertyType === type.value
                                                        ? 'border-[var(--gold-accent)] bg-[var(--gold-accent)]/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    {...register('details.propertyType', { required: true })}
                                                    value={type.value}
                                                    className="hidden"
                                                />
                                                <div className="text-3xl mb-2">{type.icon}</div>
                                                <div className="text-sm font-medium">{type.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.details?.propertyType && (
                                        <p className="text-red-500 text-sm mt-2">⚠️ Selecciona un tipo de propiedad</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            🛏️ Habitaciones *
                                        </label>
                                        <input
                                            type="number"
                                            {...register('details.bedrooms', { 
                                                required: 'Requerido',
                                                min: { value: 0, message: 'Mínimo 0' }
                                            })}
                                            placeholder="3"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.details?.bedrooms ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            🚿 Baños *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            {...register('details.bathrooms', { 
                                                required: 'Requerido',
                                                min: { value: 0, message: 'Mínimo 0' }
                                            })}
                                            placeholder="2"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.details?.bathrooms ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            📐 Pies Cuadrados
                                        </label>
                                        <input
                                            type="number"
                                            {...register('details.squareFeet', {
                                                min: { value: 0, message: 'Mínimo 0' }
                                            })}
                                            placeholder="1500"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            📅 Año Construcción
                                        </label>
                                        <input
                                            type="number"
                                            {...register('details.yearBuilt', {
                                                min: { value: 1800, message: 'Año inválido' },
                                                max: { value: new Date().getFullYear() + 2, message: 'Año inválido' }
                                            })}
                                            placeholder="2020"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                                        ✨ Características Especiales
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[var(--gold-accent)] transition-all">
                                            <input
                                                type="checkbox"
                                                {...register('details.parking')}
                                                className="w-5 h-5 text-[var(--gold-accent)] rounded focus:ring-[var(--gold-accent)]"
                                            />
                                            <span className="ml-3 text-sm font-medium">🚗 Estacionamiento</span>
                                        </label>

                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[var(--gold-accent)] transition-all">
                                            <input
                                                type="checkbox"
                                                {...register('details.petFriendly')}
                                                className="w-5 h-5 text-[var(--gold-accent)] rounded focus:ring-[var(--gold-accent)]"
                                            />
                                            <span className="ml-3 text-sm font-medium">🐕 Acepta Mascotas</span>
                                        </label>

                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[var(--gold-accent)] transition-all">
                                            <input
                                                type="checkbox"
                                                {...register('details.furnished')}
                                                className="w-5 h-5 text-[var(--gold-accent)] rounded focus:ring-[var(--gold-accent)]"
                                            />
                                            <span className="ml-3 text-sm font-medium">🛋️ Amueblado</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                                        🎯 Comodidades
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {availableAmenities.map((amenity) => (
                                            <button
                                                key={amenity.id}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity.id)}
                                                className={`p-3 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                                                    selectedAmenities.includes(amenity.id)
                                                        ? 'border-[var(--gold-accent)] bg-[var(--gold-accent)]/10'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="text-2xl mb-1">{amenity.icon}</div>
                                                <div className="text-xs font-medium">{amenity.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Selecciona todas las que apliquen
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Imágenes */}
                        {currentStep === 4 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        📷 Imágenes de la Propiedad
                                    </h2>
                                    <p className="text-gray-600 mt-1">Las imágenes ayudan a atraer más interesados</p>
                                </div>

                                {/* Mostrar galería existente si estamos editando */}
                                {isEditing && property && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Imágenes Actuales</h3>
                                        <PropertyGallery 
                                            property={property} 
                                            isEditable={true}
                                            onImageUpdate={loadProperty}
                                        />
                                    </div>
                                )}
                                
                                {/* Subir nuevas imágenes */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[var(--gold-accent)] transition-all">
                                    {isEditing ? (
                                        <ImageUploader 
                                            propertyId={id}
                                            onImagesUploaded={loadProperty}
                                        />
                                    ) : (
                                        <div>
                                            <div className="text-6xl mb-4">📸</div>
                                            <label className="cursor-pointer inline-block">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                                <span className="px-6 py-3 bg-[var(--gold-accent)] text-white rounded-xl hover:bg-[var(--charcoal)] transition-all inline-block font-medium">
                                                    Seleccionar Imágenes
                                                </span>
                                            </label>
                                            {images.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-green-600 font-medium">
                                                        ✓ {images.length} imagen{images.length > 1 ? 'es' : ''} seleccionada{images.length > 1 ? 's' : ''}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                                        {images.map((img, idx) => (
                                                            <div key={idx} className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                                                                {img.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-500 mt-4">
                                                Formatos: JPG, PNG, WEBP • Máximo 10 imágenes
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                                    <div className="flex">
                                        <div className="text-2xl mr-3">💡</div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">Consejos para mejores imágenes:</p>
                                            <ul className="text-xs text-blue-700 mt-2 space-y-1">
                                                <li>✓ Usa buena iluminación natural</li>
                                                <li>✓ Muestra diferentes ángulos de cada habitación</li>
                                                <li>✓ Incluye áreas exteriores si las hay</li>
                                                <li>✓ La primera imagen será la principal</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center ${
                                currentStep === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Anterior
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/properties')}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                            >
                                Cancelar
                            </button>

                            {currentStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-3 bg-[var(--gold-accent)] text-white rounded-xl font-medium hover:bg-[var(--charcoal)] transition-all flex items-center shadow-lg"
                                >
                                    Siguiente
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all flex items-center shadow-lg disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading-spinner h-5 w-5 mr-2 border-white"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {isEditing ? 'Actualizar Propiedad' : 'Crear Propiedad'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PropertyFormPage;