import { useState, useRef } from 'react';
import { addImagesRequest } from '../api/properties';
import { IoCloseCircle, IoStarSharp, IoStar, IoArrowBack, IoArrowForward } from 'react-icons/io5';

function ImageUploader({ propertyId, onImagesUploaded, initialImages = [], onChange }) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewImages, setPreviewImages] = useState(initialImages);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;

        console.log('📸 Selected files:', files.length);

        // Create preview URLs for the selected files
        const newPreviews = Array.from(files).map((file, index) => ({
            file,
            url: URL.createObjectURL(file),
            isMain: previewImages.length === 0 && index === 0
        }));

        console.log('🖼️ Previews creados:', newPreviews.length);

        const updatedImages = [...previewImages, ...newPreviews];
        setPreviewImages(updatedImages);

        console.log('📊 Total de imágenes en preview:', updatedImages.length);

        // Si hay una función onChange, llamarla con los archivos
        if (onChange) {
            const filesToSend = updatedImages.map(img => img.file).filter(Boolean);
            console.log('🔄 Enviando archivos a onChange:', filesToSend.length);
            onChange(filesToSend);
        }

        // Si hay propertyId, subir directamente
        if (propertyId) {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('images', file);
            });

            setUploading(true);
            try {
                await addImagesRequest(propertyId, formData);
                onImagesUploaded && onImagesUploaded();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error('Error uploading images:', error);
                alert('Error uploading images');
            } finally {
                setUploading(false);
            }
        }
    };

    const removeImage = (index) => {
        const newImages = previewImages.filter((_, i) => i !== index);
        setPreviewImages(newImages);
        
        // Ajustar índice de imagen principal si es necesario
        if (mainImageIndex >= newImages.length) {
            setMainImageIndex(Math.max(0, newImages.length - 1));
        }

        if (onChange) {
            onChange(newImages.map(img => img.file).filter(Boolean));
        }
    };

    const moveImage = (fromIndex, toIndex) => {
        const newImages = [...previewImages];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        setPreviewImages(newImages);

        // Actualizar el índice de la imagen principal
        if (mainImageIndex === fromIndex) {
            setMainImageIndex(toIndex);
        } else if (fromIndex < mainImageIndex && toIndex >= mainImageIndex) {
            setMainImageIndex(mainImageIndex - 1);
        } else if (fromIndex > mainImageIndex && toIndex <= mainImageIndex) {
            setMainImageIndex(mainImageIndex + 1);
        }

        if (onChange) {
            onChange(newImages.map(img => img.file).filter(Boolean));
        }
    };

    const setAsMainImage = (index) => {
        setMainImageIndex(index);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">
                {propertyId ? 'Add Images' : 'Upload Images'}
            </h3>
            
            {/* Vista previa de imágenes */}
            {previewImages.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-700">
                                Preview ({previewImages.length} image{previewImages.length !== 1 ? 's' : ''})
                            </p>
                            <p className="text-xs text-gray-500">
                                <IoStarSharp className="inline text-yellow-500" /> = Main image
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {previewImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`relative group rounded-lg overflow-hidden border-2 ${
                                        index === mainImageIndex 
                                            ? 'border-yellow-500 shadow-lg' 
                                            : 'border-gray-200'
                                    }`}
                                >
                                    {/* Imagen */}
                                    <div className="aspect-square bg-gray-100">
                                        <img
                                            src={image.url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error('Error loading image:', image.url);
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>

                                    {/* Overlay con controles */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                            {/* Botón para mover a la izquierda */}
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(index, index - 1)}
                                                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                                                    title="Move left"
                                                >
                                                    <IoArrowBack size={16} />
                                                </button>
                                            )}

                                            {/* Botón para establecer como principal */}
                                            <button
                                                type="button"
                                                onClick={() => setAsMainImage(index)}
                                                className={`p-2 rounded-full ${
                                                    index === mainImageIndex
                                                        ? 'bg-yellow-500 text-white'
                                                        : 'bg-white hover:bg-gray-100'
                                                }`}
                                                title="Set as main image"
                                            >
                                                {index === mainImageIndex ? (
                                                    <IoStarSharp size={16} />
                                                ) : (
                                                    <IoStar size={16} />
                                                )}
                                            </button>

                                            {/* Botón para mover a la derecha */}
                                            {index < previewImages.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(index, index + 1)}
                                                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                                                    title="Move right"
                                                >
                                                    <IoArrowForward size={16} />
                                                </button>
                                            )}

                                            {/* Botón para eliminar */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                title="Delete image"
                                            >
                                                <IoCloseCircle size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Indicador de imagen principal */}
                                    {index === mainImageIndex && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <IoStarSharp size={12} />
                                            Main
                                        </div>
                                    )}

                                    {/* Número de orden */}
                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                                        {index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Zona de arrastrar y soltar */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                        <p>Drag images here or</p>
                        <button
                            type="button"
                            className="text-blue-600 hover:text-blue-500 font-medium"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            select files
                        </button>
                    </div>
                    <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB each (maximum 10 images)
                    </p>
                </div>
            </div>

            {/* Input oculto */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
            />

            {uploading && (
                <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subiendo imágenes...
                    </div>
                </div>
            )}
        </div>
    );
}

export default ImageUploader;