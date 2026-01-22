import { useState } from 'react';
import { IoDocumentTextOutline, IoCloudUploadOutline, IoTrashOutline, IoCheckmarkCircle, IoWarning, IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import axios from '../api/axiosInstance';

function DocumentUploader({ propertyId, documents = [], onDocumentsChange, isAdminOrCoAdmin }) {
    // Eliminada la vista previa modal
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        
        // Validar tipos de archivo
        const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            toast.error('Only PDF and Word documents are allowed');
            return;
        }

        // Validar tamaño (10MB máximo por archivo)
        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            toast.error('Files must be smaller than 10MB');
            return;
        }

        setSelectedFiles(files);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => formData.append('documents', file));

            const { data } = await axios.post(`/properties/${propertyId}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Documents uploaded successfully');
            setSelectedFiles([]);
            
            if (onDocumentsChange) {
                onDocumentsChange(data.documents);
            }
        } catch (error) {
            console.error('Error uploading documents:', error);
            toast.error('Error uploading documents');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            const { data } = await axios.delete(`/properties/${propertyId}/documents/${documentId}`);
            toast.success('Document deleted successfully');
            
            if (onDocumentsChange) {
                onDocumentsChange(data.documents);
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Error deleting document');
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType === 'application/pdf') {
            return <IoDocumentTextOutline className="text-red-500 text-3xl" />;
        }
        return <IoDocumentTextOutline className="text-blue-500 text-3xl" />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
                <IoDocumentTextOutline className="mr-2" />
                Property Documents
            </h3>

            {/* Upload Section - Solo para Admin/Co-Admin */}
            {isAdminOrCoAdmin && (
                <div className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex flex-col items-center">
                        <IoCloudUploadOutline className="text-gray-400 text-5xl mb-3" />
                        <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-2">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={uploading}
                            />
                            Select Documents
                        </label>
                        <p className="text-xs text-gray-500 text-center">
                            PDF or Word documents (max 10MB per file, up to 5 files)
                        </p>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Selected files:</h4>
                            <ul className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm">{file.name}</span>
                                        <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <IoCloudUploadOutline className="mr-2" />
                                        Upload Documents
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Documents List */}
            {documents && documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc, index) => (
                        <div key={doc._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    {getFileIcon(doc.fileType)}
                                    <div className="flex-1 min-w-0">
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 font-medium break-words underline cursor-pointer"
                                            title="Open document in new tab"
                                        >
                                            {doc.fileName}
                                        </a>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {doc.fileSize && formatFileSize(doc.fileSize)}
                                        </p>
                                        {doc.uploadedAt && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        <a
                                            href={doc.url}
                                            download={doc.fileName || 'property-document'}
                                            className="text-sm text-green-600 hover:text-green-800 underline block mt-1"
                                        >
                                            Download
                                        </a>
                                    </div>
                                </div>
                                {isAdminOrCoAdmin && (
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                                        title="Delete document"
                                    >
                                        <IoTrashOutline className="text-xl" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <IoDocumentTextOutline className="text-6xl mx-auto mb-3 text-gray-300" />
                    <p>No documents uploaded yet</p>
                </div>
            )}


        </div>
    );
}

export default DocumentUploader;
