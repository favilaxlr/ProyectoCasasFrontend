import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function PropertyStatus({ property, onStatusChange, showChangeButton = false }) {
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const { isAdmin, isCoAdmin } = useAuth();

    const canChangeStatus = showChangeButton && (isAdmin || isCoAdmin);

    const statusConfig = {
        'DISPONIBLE': {
            label: 'Disponible',
            className: 'status-disponible',
            bgColor: 'bg-green-500'
        },
        'EN_CONTRATO': {
            label: 'En Contrato',
            className: 'status-en-contrato',
            bgColor: 'bg-orange-500'
        },
        'VENDIDA': {
            label: 'Vendida',
            className: 'status-vendida',
            bgColor: 'bg-red-500'
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

    return (
        <div className="flex items-center gap-2">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white ${currentConfig.bgColor}`}>
                {currentConfig.label}
            </span>
            
            {canChangeStatus && (
                <button
                    onClick={() => setShowModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    Cambiar Estado
                </button>
            )}

            {/* Modal para cambiar estado */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
                        <h3 className="text-lg font-semibold mb-4">Cambiar Estado de Propiedad</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nuevo Estado</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="DISPONIBLE">Disponible</option>
                                    <option value="EN_CONTRATO">En Contrato</option>
                                    <option value="VENDIDA">Vendida</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Motivo del Cambio</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explica el motivo del cambio de estado..."
                                    className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleStatusChange}
                                disabled={!newStatus || !reason.trim() || loading}
                                className="btn-primary disabled:opacity-50"
                            >
                                {loading ? 'Cambiando...' : 'Cambiar Estado'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setNewStatus('');
                                    setReason('');
                                }}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PropertyStatus;