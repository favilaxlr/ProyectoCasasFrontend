import { useEffect } from 'react';
import { IoCloseSharp } from 'react-icons/io5';

function PropertyPreviewModal({ isOpen, onClose, propertyId }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Vista Previa de Propiedad</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <IoCloseSharp className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="overflow-auto max-h-[calc(90vh-80px)]">
          {propertyId && (
            <iframe
              src={`/properties/${propertyId}`}
              className="w-full h-[600px] border-0"
              title="Vista previa de propiedad"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyPreviewModal;
