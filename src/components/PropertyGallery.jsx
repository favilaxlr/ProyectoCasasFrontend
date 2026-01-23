import { useState } from 'react';
import { deleteImageRequest, setMainImageRequest } from '../api/properties';
import { useAuth } from '../context/AuthContext';

function PropertyGallery({ property, onImageUpdate, isEditable = false }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const { isAdmin, isCoAdmin } = useAuth();
    
    const canEdit = isEditable && (isAdmin || isCoAdmin);

    const handleDeleteImage = async (imageId, index) => {
        if (window.confirm('Delete this image?')) {
            try {
                await deleteImageRequest(property._id, imageId);
                onImageUpdate && onImageUpdate();
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }
    };

    const handleSetMain = async (imageId) => {
        try {
            await setMainImageRequest(property._id, imageId);
            onImageUpdate && onImageUpdate();
        } catch (error) {
            console.error('Error al establecer imagen principal:', error);
        }
    };

    if (!property.images || property.images.length === 0) {
        return (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Sin imágenes</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative">
                <img
                    src={property.images[selectedImage]?.url}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-lg"
                />
                {canEdit && (
                    <div className="absolute top-2 right-2 space-x-2">
                        {!property.images[selectedImage]?.isMain && (
                            <button
                                onClick={() => handleSetMain(property.images[selectedImage]._id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                                Make Main
                            </button>
                        )}
                        <button
                            onClick={() => handleDeleteImage(property.images[selectedImage]._id, selectedImage)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                )}
                {property.images[selectedImage]?.isMain && (
                    <div className="absolute top-2 left-2">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                            Main
                        </span>
                    </div>
                )}
            </div>

            {/* Miniaturas */}
            {property.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                    {property.images.map((image, index) => (
                        <img
                            key={image._id}
                            src={image.url}
                            alt={`${property.title} ${index + 1}`}
                            className={`w-20 h-20 object-cover rounded cursor-pointer flex-shrink-0 ${
                                selectedImage === index 
                                    ? 'ring-2 ring-blue-500' 
                                    : 'hover:opacity-75'
                            }`}
                            onClick={() => setSelectedImage(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default PropertyGallery;