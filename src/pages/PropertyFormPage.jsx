import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { createPropertyRequest, getPropertyRequest, updatePropertyRequest, uploadDocumentsRequest, uploadVideosRequest, deleteVideoRequest } from '../api/properties';
import PropertyGallery from '../components/PropertyGallery';
import ImageUploader from '../components/ImageUploader';
import VideoUploader from '../components/VideoUploader';
import LocationPicker from '../components/LocationPicker';
import { geocodeAddress } from '../utils/geocoding';
import { toast } from 'react-toastify';
import { IoHomeSharp, IoDocumentTextSharp, IoLocationSharp, IoSettingsSharp, IoCameraSharp, IoCheckmarkSharp, IoCheckmarkCircleSharp, IoWarningSharp, IoCashSharp, IoBedSharp, IoWaterSharp, IoResizeSharp, IoCalendarSharp, IoCarSharp, IoPawSharp, IoRestaurantSharp, IoSparklesSharp, IoMapSharp, IoInformationCircleSharp, IoArrowBackSharp, IoArrowForwardSharp, IoSaveSharp, IoCloseSharp, IoBusinessSharp, IoHelpCircleSharp, IoKeySharp, IoCardSharp, IoCloudUploadOutline, IoTrashOutline, IoVideocam } from 'react-icons/io5';

const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_DOCUMENTS = 5;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB per file

const formatFileSize = (bytes = 0) => {
    if (bytes === 0) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, index)) * 100) / 100} ${units[index]}`;
};

const formatVideoDuration = (seconds = 0) => {
    if (!seconds && seconds !== 0) return '—';
    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (minutes === 0) {
        return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
};

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
    const [videos, setVideos] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [property, setProperty] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [currentStep, setCurrentStep] = useState(0); // Starts at 0 for the modality selector
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [geocodingFromFields, setGeocodingFromFields] = useState(false);
    const [updatingFromMap, setUpdatingFromMap] = useState(false);
    const [businessMode, setBusinessMode] = useState(null); // 'sale', 'rent', 'both'
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    // Common predefined amenities
    const availableAmenities = [
        { id: 'pool', label: 'Pool', icon: <IoWaterSharp /> },
        { id: 'gym', label: 'Gym', icon: <IoSettingsSharp /> },
        { id: 'security', label: '24/7 Security', icon: <IoWarningSharp /> },
        { id: 'garden', label: 'Garden', icon: <IoSparklesSharp /> },
        { id: 'balcony', label: 'Balcony', icon: <IoHomeSharp /> },
        { id: 'laundry', label: 'Laundry', icon: <IoSettingsSharp /> },
        { id: 'ac', label: 'Air Conditioning', icon: <IoSettingsSharp /> },
        { id: 'heating', label: 'Heating', icon: <IoSettingsSharp /> },
        { id: 'internet', label: 'Internet', icon: <IoSettingsSharp /> },
        { id: 'elevator', label: 'Elevator', icon: <IoSettingsSharp /> },
    ];

    const steps = [
        { number: 0, title: 'Business Mode', icon: <IoBusinessSharp /> },
        { number: 1, title: 'Basic Information', icon: <IoDocumentTextSharp /> },
        { number: 2, title: 'Location', icon: <IoLocationSharp /> },
        { number: 3, title: 'Property Details', icon: <IoHomeSharp /> },
        { number: 4, title: businessMode === 'sale' ? 'Sale Information' : 
                          businessMode === 'rent' ? 'Rent Information' : 
                          'Sale and Rent Information', icon: <IoCashSharp /> },
        { number: 5, title: 'Media', icon: <IoCameraSharp /> }
    ];

    const lastStepIndex = steps.length - 1;
    const isLastStep = currentStep >= lastStepIndex;
    const progressValue = lastStepIndex > 0 ? Math.min((currentStep / lastStepIndex) * 100, 100) : 100;

    // Available business modes
    const businessModes = [
        {
            value: 'sale',
            title: 'Sale',
            description: 'Property exclusively for sale',
            icon: <IoCardSharp />,
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            value: 'rent',
            title: 'Rent',
            description: 'Property exclusively for rent',
            icon: <IoKeySharp />,
            gradient: 'from-green-500 to-green-600'
        },
        {
            value: 'both',
            title: 'Rent/Sale',
            description: 'Property available for rent or sale',
            icon: <IoBusinessSharp />,
            gradient: 'from-purple-500 via-blue-500 to-green-500'
        }
    ];

    useEffect(() => {
        if (isEditing) {
            loadProperty();
            setCurrentStep(1); // Skip step 0 when editing
        }
    }, [id]);

    // Observar cambios en los campos de dirección y geocodificar automáticamente
    const street = watch('address.street');
    const city = watch('address.city');
    const state = watch('address.state');
    const zipCode = watch('address.zipCode');

    useEffect(() => {
        // No geocodificar si la actualización viene del mapa o si ya está geocodificando
        if (!street || !city || geocodingFromFields || updatingFromMap) return;

        const geocodeTimeout = setTimeout(async () => {
            try {
                // Construir dirección completa
                const fullAddress = [street, city, state, zipCode]
                    .filter(Boolean)
                    .join(', ');

                if (fullAddress.length < 10) return; // Dirección muy corta

                setGeocodingFromFields(true);
                const result = await geocodeAddress(fullAddress);
                
                if (result && result.lat && result.lng) {
                    setCoordinates({ lat: result.lat, lng: result.lng });
                }
            } catch (error) {
                console.error('Error geocodificando dirección:', error);
            } finally {
                // Esperar 1 segundo antes de permitir otra geocodificación
                setTimeout(() => setGeocodingFromFields(false), 1000);
            }
        }, 1500); // Esperar 1.5 segundos después de que el usuario deje de escribir

        return () => clearTimeout(geocodeTimeout);
    }, [street, city, state, zipCode, updatingFromMap]);

    const loadProperty = async () => {
        try {
            const res = await getPropertyRequest(id);
            const propertyData = res.data;
            setProperty(propertyData);
            
            if (propertyData.address?.coordinates) {
                setCoordinates(propertyData.address.coordinates);
            }

            if (propertyData.amenities) {
                setSelectedAmenities(propertyData.amenities);
            }
            
            // Cargar businessMode si existe, sino inferirlo de los datos de precio
            if (propertyData.businessMode) {
                setBusinessMode(propertyData.businessMode);
            } else {
                // Inferir de los datos de precio existentes
                const hasSalePrice = propertyData.price?.sale;
                const hasRentPrice = propertyData.price?.monthlyRent;
                
                if (hasSalePrice && hasRentPrice) {
                    setBusinessMode('both');
                } else if (hasSalePrice) {
                    setBusinessMode('sale');
                } else if (hasRentPrice) {
                    setBusinessMode('rent');
                } else {
                    setBusinessMode('sale'); // Default
                }
            }
            
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
                } else if (key !== 'amenities' && key !== 'images' && key !== 'businessMode') {
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
            
            if (data.title) formData.append('title', data.title);
            if (data.description) formData.append('description', data.description);

            if (data.price) {
                // Campos de venta (si businessMode es 'sale' o 'both')
                if (businessMode === 'sale' || businessMode === 'both') {
                    if (data.price.sale) formData.append('price.sale', Number(data.price.sale));
                    if (data.price.arv) formData.append('price.arv', Number(data.price.arv));
                    if (data.price.taxes) formData.append('price.taxes', Number(data.price.taxes));
                    if (data.price.deedConditions) formData.append('price.deedConditions', data.price.deedConditions);
                }
                
                // Campos de renta (si businessMode es 'rent' o 'both')
                if (businessMode === 'rent' || businessMode === 'both') {
                    if (data.price.monthlyRent) formData.append('price.monthlyRent', Number(data.price.monthlyRent));
                    if (data.price.deposit) formData.append('price.deposit', Number(data.price.deposit));
                    if (data.price.leaseDuration) formData.append('price.leaseDuration', Number(data.price.leaseDuration));
                    if (data.price.maintenance) formData.append('price.maintenance', Number(data.price.maintenance));
                    if (data.price.leaseConditions) formData.append('price.leaseConditions', data.price.leaseConditions);
                }
            }
            
            // Add the business modality to FormData
            if (businessMode) formData.append('businessMode', businessMode);

            if (data.address) {
                if (data.address.street) formData.append('address.street', data.address.street);
                if (data.address.city) formData.append('address.city', data.address.city);
                if (data.address.state) formData.append('address.state', data.address.state);
                if (data.address.zipCode) formData.append('address.zipCode', data.address.zipCode);
            }

            if (coordinates) {
                formData.append('address.coordinates.lat', coordinates.lat);
                formData.append('address.coordinates.lng', coordinates.lng);
            }

            if (data.details) {
                if (data.details.propertyType) formData.append('details.propertyType', data.details.propertyType);
                if (data.details.bedrooms !== undefined) formData.append('details.bedrooms', Number(data.details.bedrooms));
                if (data.details.bathrooms !== undefined) formData.append('details.bathrooms', Number(data.details.bathrooms));
                if (data.details.squareFeet) formData.append('details.squareFeet', Number(data.details.squareFeet));
                if (data.details.yearBuilt) formData.append('details.yearBuilt', Number(data.details.yearBuilt));
                formData.append('details.parking', data.details.parking || false);
                formData.append('details.petFriendly', data.details.petFriendly || false);
                formData.append('details.furnished', data.details.furnished || false);
            }

            selectedAmenities.forEach(amenity => {
                formData.append('amenities', amenity);
            });

            images.forEach(image => {
                formData.append('images', image);
            });

            let targetPropertyId = isEditing ? id : null;

            if (isEditing) {
                await updatePropertyRequest(id, formData);
                toast.success('Property updated successfully');
            } else {
                const response = await createPropertyRequest(formData);
                toast.success('Property created successfully');
                targetPropertyId = response?.data?._id || null;
            }

            if (documents.length > 0 && targetPropertyId) {
                try {
                    const documentsFormData = new FormData();
                    documents.forEach((doc) => documentsFormData.append('documents', doc));
                    await uploadDocumentsRequest(targetPropertyId, documentsFormData);
                    toast.success('Documents uploaded successfully');
                    setDocuments([]);
                } catch (docError) {
                    console.error('Error uploading documents:', docError);
                    toast.error('Property saved, but documents could not be uploaded');
                }
            }

            if (videos.length > 0 && targetPropertyId) {
                try {
                    const videoFormData = new FormData();
                    videos.forEach((video) => videoFormData.append('videos', video));
                    await uploadVideosRequest(targetPropertyId, videoFormData);
                    toast.success('Videos uploaded successfully');
                    setVideos([]);
                } catch (videoError) {
                    console.error('Error uploading videos:', videoError);
                    toast.error('Property saved, but videos could not be uploaded');
                }
            }
        
            navigate('/admin/properties');
        } catch (error) {
            console.error('Error saving property:', error);
            const errorMsg = error.response?.data?.message 
                ? (Array.isArray(error.response.data.message) 
                    ? error.response.data.message.join(', ') 
                    : error.response.data.message)
                : 'Error saving property';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (files) => {
        console.log('📥 PropertyFormPage recibió archivos:', files?.length);
        // Los archivos ya vienen con su información de preview desde ImageUploader
        setImages(files);
    };

    const handleVideoSelection = (files) => {
        setVideos(files);
    };

    const handleExistingVideoDelete = async (videoId) => {
        if (!videoId || !id) return;
        if (!window.confirm('Delete this video?')) {
            return;
        }

        try {
            await deleteVideoRequest(id, videoId);
            toast.success('Video deleted successfully');
            loadProperty();
        } catch (error) {
            console.error('Error deleting video:', error);
            toast.error('Error deleting video');
        }
    };

    const handleDocumentSelect = (event) => {
        const selected = Array.from(event.target.files || []);
        if (!selected.length) return;

        const availableSlots = MAX_DOCUMENTS - documents.length;
        if (availableSlots <= 0) {
            toast.error(`You can upload up to ${MAX_DOCUMENTS} documents`);
            event.target.value = '';
            return;
        }

        const trimmedFiles = selected.slice(0, availableSlots);

        const invalidFiles = trimmedFiles.filter(file => !ALLOWED_DOCUMENT_TYPES.includes(file.type));
        if (invalidFiles.length) {
            toast.error('Only PDF or Word documents are allowed');
            event.target.value = '';
            return;
        }

        const oversizedFiles = trimmedFiles.filter(file => file.size > MAX_DOCUMENT_SIZE);
        if (oversizedFiles.length) {
            toast.error('Each document must be smaller than 10MB');
            event.target.value = '';
            return;
        }

        setDocuments(prev => [...prev, ...trimmedFiles]);
        event.target.value = '';
    };

    const removeDocument = (index) => {
        setDocuments(prev => prev.filter((_, idx) => idx !== index));
    };

    const validateCurrentStep = async () => {
        const values = watch();
        
        switch(currentStep) {
            case 0:
                if (!businessMode) {
                    toast.error('Please select a business mode');
                    return false;
                }
                break;
            case 1:
                if (!values.title || !values.description) {
                    toast.error('Please complete all required fields');
                    return false;
                }
                break;
            case 2:
                if (!values.address?.street || !values.address?.city || 
                    !values.address?.state || !values.address?.zipCode) {
                    toast.error('Please complete the full address');
                    return false;
                }
                break;
            case 3:
                if (!values.details?.propertyType || 
                    values.details?.bedrooms === undefined || 
                    values.details?.bathrooms === undefined) {
                    toast.error('Please complete the property details');
                    return false;
                }
                break;
            case 4:
                // Validate prices according to modality
                if (businessMode === 'sale' && !values.price?.sale) {
                    toast.error('Please enter the sale price');
                    return false;
                }
                if (businessMode === 'rent' && (!values.price?.monthlyRent || !values.price?.deposit)) {
                    toast.error('Please complete the rent information');
                    return false;
                }
                if (businessMode === 'both') {
                    if (!values.price?.sale) {
                        toast.error('Please enter the sale price');
                        return false;
                    }
                    if (!values.price?.monthlyRent || !values.price?.deposit) {
                        toast.error('Please complete the rent information');
                        return false;
                    }
                }
                break;
            case 5:
                break;
        }
        return true;
    };

    const nextStep = async () => {
        const isValid = await validateCurrentStep();
        if (isValid && currentStep < lastStepIndex) {
            setCurrentStep((prev) => Math.min(prev + 1, lastStepIndex));
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => Math.max(prev - 1, 0));
        }
    };

    const goToStep = (step) => {
        setCurrentStep(Math.max(0, Math.min(step, lastStepIndex)));
    };

    const propertyType = watch('details.propertyType');

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="animate-slide-in-left mb-8 text-center">
                    <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2 flex items-center justify-center">
                        {isEditing ? (
                            <><IoSettingsSharp className="mr-3" /> Edit Property</>
                        ) : (
                            <><IoHomeSharp className="mr-3" /> New Property</>
                        )}
                    </h1>
                    <p className="text-gray-600">Complete the form fields step by step</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
                            <div 
                                className="h-full bg-[var(--gold-accent)] transition-all duration-500"
                                style={{ width: `${progressValue}%` }}
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
                                    {currentStep > step.number ? <IoCheckmarkSharp /> : step.icon}
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

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 min-h-[500px]">
                        
                        {/* Step 0: Business Mode Selection */}
                        {currentStep === 0 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-2">
                                        What type of business do you want to conduct?
                                    </h2>
                                    <p className="text-gray-600">
                                        Select the modality to continue with the form
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                    {businessModes.map((mode) => {
                                        const isSelected = businessMode === mode.value;
                                        
                                        return (
                                            <button
                                                key={mode.value}
                                                type="button"
                                                onClick={() => {
                                                    setBusinessMode(mode.value);
                                                    setCurrentStep(1);
                                                }}
                                                className={`
                                                    group relative overflow-hidden rounded-2xl p-8 
                                                    border-4 transition-all duration-300 transform hover:scale-105
                                                    ${isSelected 
                                                        ? 'border-[var(--gold-accent)] shadow-2xl' 
                                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                                                    }
                                                `}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                                
                                                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                                    <div className={`
                                                        text-6xl p-6 rounded-full 
                                                        bg-gradient-to-br ${mode.gradient}
                                                        text-white shadow-lg
                                                        group-hover:scale-110 transition-transform
                                                        flex items-center justify-center
                                                    `}>
                                                        <div className="text-5xl">
                                                            {mode.icon}
                                                        </div>
                                                    </div>
                                                    
                                                    <h3 className="text-xl font-bold text-[var(--charcoal)]">
                                                        {mode.title}
                                                    </h3>
                                                    
                                                    <p className="text-sm text-gray-600 leading-relaxed">
                                                        {mode.description}
                                                    </p>
                                                    
                                                    {isSelected && (
                                                        <div className="flex items-center text-[var(--gold-accent)] font-semibold">
                                                            <IoCheckmarkCircleSharp className="text-2xl mr-2" />
                                                            Selected
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl mt-8 max-w-3xl mx-auto">
                                    <div className="flex">
                                        <IoInformationCircleSharp className="text-2xl text-blue-600 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800 mb-2">
                                                ℹ️ Information about modalities:
                                            </p>
                                            <ul className="text-xs text-blue-700 space-y-1">
                                                <li>• <strong>Sale:</strong> The property will be sold permanently</li>
                                                <li>• <strong>Rent:</strong> The property will be rented for periods</li>
                                                <li>• <strong>Rent/Sale:</strong> The client can choose between renting or buying</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        <IoDocumentTextSharp className="mr-3" /> Basic Information
                                    </h2>
                                    <p className="text-gray-600 mt-1">Main property data</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Property Title *
                                    </label>
                                    <input
                                        {...register('title', { required: 'Title is required' })}
                                        placeholder="E.g: Modern house in residential area"
                                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                            errors.title ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.title && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <IoWarningSharp className="mr-1" /> {errors.title.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        Description *
                                    </label>
                                    <textarea
                                        {...register('description', { 
                                            required: 'Description is required',
                                            minLength: { value: 10, message: 'Minimum 10 characters' }
                                        })}
                                        rows="6"
                                        placeholder="Describe the property, its main features and what makes it special..."
                                        className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                            errors.description ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center">
                                            <IoWarningSharp className="mr-1" /> {errors.description.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        <IoLocationSharp className="mr-3" /> Location
                                    </h2>
                                    <p className="text-gray-600 mt-1">Complete property address</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            Street and Number *
                                        </label>
                                        <input
                                            {...register('address.street', { required: 'Street is required' })}
                                            placeholder="E.g: Main Street #123"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.street ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                        {errors.address?.street && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <IoWarningSharp className="mr-1" /> {errors.address.street.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            City *
                                        </label>
                                        <input
                                            {...register('address.city', { required: 'City is required' })}
                                            placeholder="E.g: Miami"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.city ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            State *
                                        </label>
                                        <input
                                            {...register('address.state', { required: 'State is required' })}
                                            placeholder="E.g: Florida"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.state ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                                            Zip Code *
                                        </label>
                                        <input
                                            {...register('address.zipCode', { required: 'Zip code is required' })}
                                            placeholder="E.g: 33101"
                                            className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] ${
                                                errors.address?.zipCode ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="flex items-center text-sm font-semibold mb-3 text-gray-700">
                                        <IoMapSharp className="mr-2" /> Location on Map
                                    </label>
                                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                                        <LocationPicker
                                            initialPosition={coordinates}
                                            address={[street, city, state, zipCode].filter(Boolean).join(', ')}
                                            onLocationSelect={(location) => {
                                                // Marcar que la actualización viene del mapa
                                                setUpdatingFromMap(true);
                                                
                                                setCoordinates(location.coordinates);
                                                
                                                // Solo autocompletar campos si están vacíos
                                                // Esto permite que el usuario escriba su dirección exacta
                                                // y solo ajuste las coordenadas en el mapa sin que se sobrescriba
                                                const currentStreet = watch('address.street');
                                                const currentCity = watch('address.city');
                                                const currentState = watch('address.state');
                                                const currentZipCode = watch('address.zipCode');
                                                
                                                // Autocompletar campos de dirección SOLO si existen detalles Y los campos están vacíos
                                                if (location.addressDetails) {
                                                    const addr = location.addressDetails;
                                                    
                                                    // Calle y número - solo si está vacío
                                                    if (!currentStreet || currentStreet.trim() === '') {
                                                        const street = [
                                                            addr.house_number,
                                                            addr.road || addr.street || addr.highway
                                                        ].filter(Boolean).join(' ');
                                                        if (street) setValue('address.street', street);
                                                    }
                                                    
                                                    // Ciudad - solo si está vacía
                                                    if (!currentCity || currentCity.trim() === '') {
                                                        const city = addr.city || addr.town || addr.village || addr.municipality;
                                                        if (city) setValue('address.city', city);
                                                    }
                                                    
                                                    // Estado - solo si está vacío
                                                    if (!currentState || currentState.trim() === '') {
                                                        const state = addr.state || addr.province;
                                                        if (state) setValue('address.state', state);
                                                    }
                                                    
                                                    // Código postal - solo si está vacío
                                                    if (!currentZipCode || currentZipCode.trim() === '') {
                                                        if (addr.postcode) setValue('address.zipCode', addr.postcode);
                                                    }
                                                }
                                                
                                                // Resetear la bandera después de 2 segundos
                                                setTimeout(() => setUpdatingFromMap(false), 2000);
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                                        <IoInformationCircleSharp className="mr-1" /> Click on the map to select the exact location
                                    </p>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        <IoHomeSharp className="mr-3" /> Property Details
                                    </h2>
                                    <p className="text-gray-600 mt-1">Features and specifications</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                                        Property Type *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { value: 'house', label: 'House', icon: <IoHomeSharp /> },
                                            { value: 'apartment', label: 'Apartment', icon: <IoBusinessSharp /> },
                                            { value: 'condo', label: 'Condo', icon: <IoBusinessSharp /> },
                                            { value: 'townhouse', label: 'Townhouse', icon: <IoHomeSharp /> }
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
                                                <div className="text-3xl mb-2 flex justify-center">{type.icon}</div>
                                                <div className="text-sm font-medium">{type.label}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                                            <IoBedSharp className="mr-2" /> Bedrooms *
                                        </label>
                                        <input
                                            type="number"
                                            {...register('details.bedrooms', { 
                                                required: 'Required',
                                                min: { value: 0, message: 'Minimum 0' }
                                            })}
                                            placeholder="3"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                                            <IoWaterSharp className="mr-2" /> Bathrooms *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            {...register('details.bathrooms', { 
                                                required: 'Required',
                                                min: { value: 0, message: 'Minimum 0' }
                                            })}
                                            placeholder="2"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                                            <IoResizeSharp className="mr-2" /> Square Feet
                                        </label>
                                        <input
                                            type="number"
                                            {...register('details.squareFeet')}
                                            placeholder="1500"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center text-sm font-semibold mb-2 text-gray-700">
                                            <IoCalendarSharp className="mr-2" /> Year Built
                                        </label>
                                        <input
                                            type="number"
                                            {...register('details.yearBuilt')}
                                            placeholder="2020"
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                                        Special Features
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[var(--gold-accent)] transition-all">
                                            <input
                                                type="checkbox"
                                                {...register('details.parking')}
                                                className="w-5 h-5 text-[var(--gold-accent)] rounded focus:ring-[var(--gold-accent)]"
                                            />
                                            <IoCarSharp className="ml-3 mr-2" />
                                            <span className="text-sm font-medium">Garage</span>
                                        </label>

                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[var(--gold-accent)] transition-all">
                                            <input
                                                type="checkbox"
                                                {...register('details.petFriendly')}
                                                className="w-5 h-5 text-[var(--gold-accent)] rounded focus:ring-[var(--gold-accent)]"
                                            />
                                            <IoPawSharp className="ml-3 mr-2" />
                                            <span className="text-sm font-medium">Pet Friendly</span>
                                        </label>

                                        <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[var(--gold-accent)] transition-all">
                                            <input
                                                type="checkbox"
                                                {...register('details.furnished')}
                                                className="w-5 h-5 text-[var(--gold-accent)] rounded focus:ring-[var(--gold-accent)]"
                                            />
                                            <IoRestaurantSharp className="ml-3 mr-2" />
                                            <span className="text-sm font-medium">Furnished</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700">
                                        Amenities
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
                                                <div className="text-2xl mb-1 flex justify-center">{amenity.icon}</div>
                                                <div className="text-xs font-medium">{amenity.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Price Information (Conditional based on modality) */}
                        {currentStep === 4 && (
                            <div className="animate-fade-in space-y-6">
                                {!businessMode ? (
                                    <div className="text-center py-16">
                                        <IoWarningSharp className="text-6xl text-yellow-500 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-2">
                                            Modality not selected
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            You must go back to step 0 and select a business modality
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(0)}
                                            className="px-6 py-3 bg-[var(--gold-accent)] text-white rounded-xl font-medium hover:bg-[var(--charcoal)] transition-all inline-flex items-center"
                                        >
                                            <IoArrowBackSharp className="mr-2" />
                                            Back to Step 0
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="border-b pb-4 mb-6">
                                            <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                                <IoCashSharp className="mr-3" /> 
                                                {businessMode === 'sale' && 'Sale Information'}
                                                {businessMode === 'rent' && 'Rent Information'}
                                                {businessMode === 'both' && 'Sale and Rent Information'}
                                            </h2>
                                            <p className="text-gray-600 mt-1">
                                                {businessMode === 'sale' && 'Sale price and conditions'}
                                                {businessMode === 'rent' && 'Rent price and conditions'}
                                                {businessMode === 'both' && 'Prices for both modalities'}
                                            </p>
                                        </div>

                                        {/* Badge indicador de modalidad */}
                                        <div className="flex items-center justify-center mb-6">
                                            <div className={`
                                                inline-flex items-center px-6 py-3 rounded-full 
                                                bg-gradient-to-r ${businessModes.find(m => m.value === businessMode)?.gradient}
                                                text-white font-semibold shadow-lg
                                            `}>
                                                {businessModes.find(m => m.value === businessMode)?.icon}
                                                <span className="ml-2">
                                                    {businessModes.find(m => m.value === businessMode)?.title}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Campos de VENTA (si businessMode es 'sale' o 'both') */}
                                        {(businessMode === 'sale' || businessMode === 'both') && (
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 space-y-6">
                                        <h3 className="text-xl font-bold text-blue-800 flex items-center">
                                            <IoCardSharp className="mr-2" /> Sale Information
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Sale Price (USD) *
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('price.sale', { 
                                                        required: businessMode !== 'rent' ? 'Sale price is required' : false,
                                                        min: { value: 1, message: 'Must be greater than 0' }
                                                    })}
                                                    placeholder="250000"
                                                    className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.price?.sale ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.price?.sale && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                                        <IoWarningSharp className="mr-1" /> {errors.price.sale.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    ARV - After Repair Value (USD)
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('price.arv')}
                                                    placeholder="300000"
                                                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Estimated value after repairs/renovations</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Annual Taxes and Fees (USD)
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('price.taxes')}
                                                    placeholder="3000"
                                                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Property taxes, HOA, etc.</p>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Closing Conditions
                                                </label>
                                                <textarea
                                                    {...register('price.deedConditions')}
                                                    rows="3"
                                                    placeholder="E.g: Mortgage credit required, financing accepted..."
                                                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Campos de RENTA (si businessMode es 'rent' o 'both') */}
                                {(businessMode === 'rent' || businessMode === 'both') && (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 space-y-6">
                                        <h3 className="text-xl font-bold text-green-800 flex items-center">
                                            <IoKeySharp className="mr-2" /> Rent Information
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Monthly Rent (USD) *
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('price.monthlyRent', { 
                                                        required: businessMode !== 'sale' ? 'Monthly rent is required' : false,
                                                        min: { value: 1, message: 'Must be greater than 0' }
                                                    })}
                                                    placeholder="1500"
                                                    className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                        errors.price?.monthlyRent ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.price?.monthlyRent && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                                        <IoWarningSharp className="mr-1" /> {errors.price.monthlyRent.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Security Deposit (USD) *
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('price.deposit', { 
                                                        required: businessMode !== 'sale' ? 'Security deposit is required' : false,
                                                        min: { value: 0, message: 'Must be greater than or equal to 0' }
                                                    })}
                                                    placeholder="1500"
                                                    className={`w-full border-2 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                                        errors.price?.deposit ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors.price?.deposit && (
                                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                                        <IoWarningSharp className="mr-1" /> {errors.price.deposit.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Minimum Lease Duration (months)
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('price.leaseDuration')}
                                                    placeholder="12"
                                                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Monthly Maintenance (USD)
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('price.maintenance')}
                                                    placeholder="150"
                                                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Maintenance fee, if applicable</p>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                                    Additional Rent Conditions
                                                </label>
                                                <textarea
                                                    {...register('price.leaseConditions')}
                                                    rows="3"
                                                    placeholder="E.g: Co-signer required, employment references, no pets..."
                                                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Additional information for 'both' modality */}
                                {businessMode === 'both' && (
                                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-xl">
                                        <div className="flex">
                                            <IoInformationCircleSharp className="text-2xl text-purple-600 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-purple-800">
                                                    Modality: Sale and Rent
                                                </p>
                                                <p className="text-xs text-purple-700 mt-1">
                                                    This property will be available for sale OR rent. Users can choose the modality they prefer.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                    </>
                                )}
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="border-b pb-4 mb-6">
                                    <h2 className="text-2xl font-bold text-[var(--charcoal)] flex items-center">
                                        <IoCameraSharp className="mr-3" /> Property Media
                                    </h2>
                                    <p className="text-gray-600 mt-1">High quality images and short videos help increase engagement</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        {isEditing && property && (
                                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                                <h3 className="text-lg font-semibold mb-3 text-gray-700">Current Images</h3>
                                                <PropertyGallery 
                                                    property={property} 
                                                    isEditable={true}
                                                    onImageUpdate={loadProperty}
                                                />
                                            </div>
                                        )}

                                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-[var(--charcoal)] flex items-center">
                                                    <IoCameraSharp className="mr-2" /> Upload Images
                                                </h3>
                                                <span className="text-xs uppercase tracking-widest text-gray-400">Step 5</span>
                                            </div>
                                            {isEditing ? (
                                                <ImageUploader 
                                                    propertyId={id}
                                                    onImagesUploaded={loadProperty}
                                                />
                                            ) : (
                                                <ImageUploader 
                                                    onChange={handleImageChange}
                                                />
                                            )}

                                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl mt-4">
                                                <div className="flex">
                                                    <div className="mr-3">
                                                        <IoHelpCircleSharp className="text-2xl text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-800">Tips for better images:</p>
                                                        <ul className="text-xs text-blue-700 mt-2 space-y-1">
                                                            <li>• Use good natural lighting</li>
                                                            <li>• Show different angles of each room</li>
                                                            <li>• Include outdoor areas if available</li>
                                                            <li>• Use the buttons to reorder images</li>
                                                            <li>• Mark with the star the image you want to appear first</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-[var(--charcoal)] flex items-center">
                                                        <IoVideocam className="mr-2" /> Property Videos
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Attach up to 3 short walkthroughs (MP4, MOV, AVI, MPEG or WebM)
                                                    </p>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {videos.length}/3 selected
                                                </span>
                                            </div>

                                            <VideoUploader
                                                selectedVideos={videos}
                                                onChange={handleVideoSelection}
                                            />

                                            {isEditing && property?.videos?.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Current videos</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {property.videos.map((video) => (
                                                            <div key={video._id} className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                                                                <div className="aspect-video bg-black rounded-xl overflow-hidden mb-3">
                                                                    <video
                                                                        controls
                                                                        src={video.url}
                                                                        poster={video.thumbnailUrl || undefined}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm text-gray-600">
                                                                    <div>
                                                                        <p className="font-semibold text-gray-800">
                                                                            Duration: {formatVideoDuration(video.duration)}
                                                                        </p>
                                                                        {video.bytes && (
                                                                            <p className="text-xs text-gray-500">{formatFileSize(video.bytes)}</p>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleExistingVideoDelete(video._id)}
                                                                        className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                                                                    >
                                                                        <IoTrashOutline size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-500 mt-4">
                                                Videos are uploaded after saving the property. You can delete existing ones at any time.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--charcoal)] flex items-center">
                                                <IoDocumentTextSharp className="mr-2" /> Property Documents
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Attach optional PDFs or Word files (contracts, disclosures, brochures)
                                            </p>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {documents.length}/{MAX_DOCUMENTS} selected
                                        </span>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
                                        <IoCloudUploadOutline className="mx-auto text-5xl text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-600 mb-3">
                                            Select supporting documents to share with interested buyers
                                        </p>
                                        <label
                                            className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-white transition-colors ${
                                                documents.length >= MAX_DOCUMENTS
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-[var(--gold-accent)] hover:bg-[var(--charcoal)] cursor-pointer'
                                            }`}
                                        >
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                multiple
                                                className="hidden"
                                                onChange={handleDocumentSelect}
                                                disabled={documents.length >= MAX_DOCUMENTS}
                                            />
                                            Select documents
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">
                                            PDF, DOC or DOCX up to 10MB each (max {MAX_DOCUMENTS} files)
                                        </p>
                                    </div>

                                    {documents.length > 0 && (
                                        <ul className="mt-4 space-y-3">
                                            {documents.map((file, index) => (
                                                <li
                                                    key={`${file.name}-${index}`}
                                                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <IoDocumentTextSharp className="text-2xl text-[var(--gold-accent)] flex-shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDocument(index)}
                                                        className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                                                        aria-label="Remove document"
                                                    >
                                                        <IoTrashOutline size={18} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {isEditing && (
                                        <p className="text-xs text-gray-500 mt-4">
                                            Existing documents remain stored. Uploading new files here will add them to the property.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center ${
                                currentStep === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <IoArrowBackSharp className="mr-2" />
                            Previous
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/properties')}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all flex items-center"
                            >
                                <IoCloseSharp className="mr-2" />
                                Cancel
                            </button>

                            {!isLastStep ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-3 bg-[var(--gold-accent)] text-white rounded-xl font-medium hover:bg-[var(--charcoal)] transition-all flex items-center shadow-lg"
                                >
                                    Next
                                    <IoArrowForwardSharp className="ml-2" />
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
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <IoSaveSharp className="mr-2" />
                                            {isEditing ? 'Update Property' : 'Create Property'}
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