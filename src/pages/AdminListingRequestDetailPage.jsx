import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getListingRequestRequest, updateListingRequestStatusRequest } from '../api/listingRequests';
import { PROPERTY_TYPES } from '../schemas/listingRequestSchema';
import { IoArrowBackSharp, IoPricetagOutline, IoHomeOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

const typeLabel = (value) => PROPERTY_TYPES.find((type) => type.value === value)?.label || value;

function AdminListingRequestDetailPage() {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    const loadRequest = async (silent = false) => {
        try {
            const res = await getListingRequestRequest(id);
            setRequest(res.data);
        } catch (error) {
            console.error('Error loading listing request:', error);
            if (!silent) toast.error('Error loading seller request');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadRequest();
    }, [id]);

    const handleStatusChange = async (status) => {
        if (!window.confirm(`Change status to "${status}"?`)) return;
        setUpdating(true);
        try {
            const res = await updateListingRequestStatusRequest(id, status);
            setRequest(res.data);
            toast.success('Status updated');
        } catch (error) {
            toast.error(error.response?.data?.message?.[0] || 'Error updating status');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gold-accent)]"></div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <p className="text-gray-600">Seller request not found.</p>
                <Link to="/admin/listing-requests" className="text-[var(--gold-accent)] font-semibold mt-4 inline-block">
                    Back to requests
                </Link>
            </div>
        );
    }

    const images = request.images || [];
    const currentImage = images[activeImage];

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Link
                to="/admin/listing-requests"
                className="inline-flex items-center text-gray-600 hover:text-[var(--gold-accent)] mb-6"
            >
                <IoArrowBackSharp className="mr-2" />
                Back to seller requests
            </Link>

            <div className="bg-[var(--soft-black)] px-6 py-4 rounded-t-lg">
                <h1 className="text-2xl font-bold text-white flex items-center">
                    <IoPricetagOutline className="mr-3 text-[var(--gold-accent)]" />
                    {request.fullName}
                </h1>
                <p className="text-gray-400 mt-1">{request.location} · {typeLabel(request.propertyType)}</p>
            </div>

            <div className="bg-white rounded-b-lg shadow-lg p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                    {['pending', 'contacted', 'closed'].map((status) => (
                        <button
                            key={status}
                            disabled={updating || request.status === status}
                            onClick={() => handleStatusChange(status)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border-2 transition-colors ${
                                request.status === status
                                    ? 'bg-[var(--gold-accent)] text-white border-[var(--gold-accent)]'
                                    : 'border-gray-200 text-gray-700 hover:border-[var(--gold-accent)]'
                            } disabled:opacity-60`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-sm">
                        <p><strong>Phone:</strong> <a href={`tel:${request.phone}`} className="text-[var(--gold-accent)]">{request.phone}</a></p>
                        <p><strong>Email:</strong> <a href={`mailto:${request.email}`} className="text-[var(--gold-accent)]">{request.email}</a></p>
                        {request.estimatedPrice && (
                            <p><strong>Estimated price:</strong> ${Number(request.estimatedPrice).toLocaleString()}</p>
                        )}
                        <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                        {request.user?.username && (
                            <p><strong>Account:</strong> {request.user.username}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-semibold mb-2">Description</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-semibold mb-3">Photos</p>
                    {images.length === 0 ? (
                        <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-400">
                            <IoHomeOutline className="text-5xl" />
                            <span className="ml-2">No photos submitted</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <img
                                src={currentImage.url}
                                alt={`Property photo ${activeImage + 1}`}
                                className="w-full max-h-[480px] object-contain rounded-lg bg-gray-100"
                            />
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.publicId || index}
                                            type="button"
                                            onClick={() => setActiveImage(index)}
                                            className={`rounded-lg overflow-hidden border-2 ${
                                                index === activeImage ? 'border-[var(--gold-accent)]' : 'border-transparent'
                                            }`}
                                        >
                                            <img src={image.url} alt="" className="h-16 w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Link
                    to="/admin/add-property"
                    className="inline-flex items-center text-sm font-semibold text-[var(--gold-accent)] hover:underline"
                >
                    Create a listing from Add Property if you decide to publish this home
                </Link>
            </div>
        </div>
    );
}

export default AdminListingRequestDetailPage;
