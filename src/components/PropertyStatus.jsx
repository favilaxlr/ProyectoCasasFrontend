import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IoCheckmarkCircleSharp, IoWarningSharp, IoCloseCircleSharp } from 'react-icons/io5';

function PropertyStatus({ property, onStatusChange, showChangeButton = false, variant = 'badge' }) {
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const { isAdmin, isCoAdmin } = useAuth();

    const canChangeStatus = showChangeButton && (isAdmin || isCoAdmin);

    const statusConfig = {
        'DISPONIBLE': {
            label: 'Available',
            icon: <IoCheckmarkCircleSharp />,
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            borderColor: 'border-green-500',
            dotColor: 'bg-green-500'
        },
        'EN_CONTRATO': {
            label: 'Under Contract',
            icon: <IoWarningSharp />,
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
            borderColor: 'border-orange-500',
            dotColor: 'bg-orange-500'
        },
        'VENDIDA': {
            label: 'Sold',
            icon: <IoCloseCircleSharp />,
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            borderColor: 'border-red-500',
            dotColor: 'bg-red-500'
        }
    };

    const handleStatusChange = async () => {
        if (!newStatus || !reason.trim()) return;

        setLoading(true);
        try {
            await onStatusChange(property._id, newStatus, reason);
            setShowModal(false);
            setNewStatus('');
            setReason('');
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentConfig = statusConfig[property.status] || statusConfig['DISPONIBLE'];

    // Badge version (pequeño)
    if (variant === 'badge') {
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${currentConfig.bgColor} ${currentConfig.textColor}`}>
                <span className={`w-2 h-2 rounded-full ${currentConfig.dotColor}`}></span>
                {currentConfig.label}
            </span>
        );
    }

    // Large version (para headers)
    if (variant === 'large') {
        return (
            <div className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-lg ${currentConfig.bgColor} ${currentConfig.textColor} border-l-4 ${currentConfig.borderColor}`}>
                <span className="text-2xl">{currentConfig.icon}</span>
                {currentConfig.label}
            </div>
        );
    }

    // Dot version (para mapas)
    if (variant === 'dot') {
        return (
            <div className={`w-3 h-3 rounded-full ${currentConfig.dotColor} shadow-lg`} title={currentConfig.label} />
        );
    }

    // Default - flex version
    return (
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${currentConfig.bgColor} ${currentConfig.textColor}`}>
                <span className={`w-2 h-2 rounded-full ${currentConfig.dotColor}`}></span>
                {currentConfig.label}
            </span>
            
            {canChangeStatus && (
                <button
                    onClick={() => setShowModal(true)}
                    className="text-white px-3 py-1 rounded font-medium text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: '#C8A452' }}
                >
                    Change Status
                </button>
            )}

            {/* Modal para cambiar estado */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-90vw shadow-xl">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: '#1F1F1F' }}>Cambiar Estado de Propiedad</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#3C3C3C' }}>New Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#ddd' }}
                                >
                                    <option value="">Select...</option>
                                    <option value="DISPONIBLE">✅ Available</option>
                                    <option value="EN_CONTRATO">⚠️ Under Contract</option>
                                    <option value="VENDIDA">❌ Sold</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#3C3C3C' }}>Reason for Change</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain the reason for the status change..."
                                    className="w-full border-2 border-gray-300 rounded px-3 py-2 h-20 focus:outline-none focus:ring-2"
                                    style={{ borderColor: '#ddd' }}
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleStatusChange}
                                disabled={!newStatus || !reason.trim() || loading}
                                className="text-white px-4 py-2 rounded font-medium transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: '#C8A452' }}
                            >
                                {loading ? 'Cambiando...' : 'Cambiar Estado'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setNewStatus('');
                                    setReason('');
                                }}
                                className="px-4 py-2 rounded font-medium border-2 border-gray-300 transition-all hover:bg-gray-50"
                                style={{ color: '#3C3C3C', borderColor: '#ddd' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PropertyStatus;