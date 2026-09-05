import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getListingRequestsRequest } from '../api/listingRequests';
import { PROPERTY_TYPES } from '../schemas/listingRequestSchema';
import { IoHomeOutline, IoTimeOutline, IoCheckmarkCircle, IoCloseCircle, IoPricetagOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

const STATUS_TABS = [
    { id: 'pending', label: 'Pending' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'closed', label: 'Closed' }
];

const typeLabel = (value) => PROPERTY_TYPES.find((type) => type.value === value)?.label || value;

function getStatusBadge(status) {
    const statuses = {
        pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <IoTimeOutline />, text: 'Pending' },
        contacted: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <IoCheckmarkCircle />, text: 'Contacted' },
        closed: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <IoCloseCircle />, text: 'Closed' }
    };
    const badge = statuses[status] || statuses.pending;
    return (
        <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${badge.color}`}>
            {badge.icon}
            <span className="ml-1">{badge.text}</span>
        </span>
    );
}

function AdminListingRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);

    const loadRequests = async (silent = false) => {
        try {
            const res = await getListingRequestsRequest();
            setRequests(res.data || []);
        } catch (error) {
            console.error('Error loading listing requests:', error);
            if (!silent) {
                toast.error('Error loading seller requests');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
        const interval = setInterval(() => loadRequests(true), 15000);
        return () => clearInterval(interval);
    }, []);

    const filtered = requests.filter((request) => request.status === activeTab);
    const counts = STATUS_TABS.reduce((acc, tab) => {
        acc[tab.id] = requests.filter((request) => request.status === tab.id).length;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gold-accent)]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-[var(--soft-black)] px-6 py-4 -mx-6 -mt-6 mb-6">
                <h1 className="text-3xl font-bold flex items-center text-white">
                    <IoPricetagOutline className="mr-3 text-[var(--gold-accent)]" />
                    Seller Requests
                </h1>
                <p className="text-gray-400 mt-2">Review homes clients offered for sale</p>
            </div>

            <div className="flex gap-4 mb-6 border-b-2 border-gray-200 overflow-x-auto">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'text-[var(--gold-accent)] border-b-4 border-[var(--gold-accent)] -mb-0.5'
                                : 'text-gray-600 hover:text-[var(--gold-accent)]'
                        }`}
                    >
                        {tab.label}
                        {counts[tab.id] > 0 && (
                            <span className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                                {counts[tab.id]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <IoTimeOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">No {activeTab} requests</h2>
                    <p className="text-gray-500">Seller submissions from /sell will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map((request) => {
                        const mainImage = request.images?.[0]?.url;
                        return (
                            <div key={request._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/3">
                                        {mainImage ? (
                                            <img
                                                src={mainImage}
                                                alt={request.location}
                                                className="w-full h-48 md:h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                                                <IoHomeOutline className="text-6xl text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:w-2/3 p-6">
                                        <div className="flex justify-between items-start mb-4 gap-3">
                                            <div>
                                                <p className="text-xl font-bold text-gray-800">{request.fullName}</p>
                                                <p className="text-gray-600 text-sm mt-1">{request.location}</p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {typeLabel(request.propertyType)}
                                                    {request.squareFeet ? ` · ${Number(request.squareFeet).toLocaleString()} house sq ft` : ''}
                                                    {request.lotSquareFeet ? ` · ${Number(request.lotSquareFeet).toLocaleString()} lot sq ft` : ''}
                                                    {request.images?.length ? ` · ${request.images.length} photo${request.images.length === 1 ? '' : 's'}` : ''}
                                                </p>
                                            </div>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        {request.estimatedPrice && (
                                            <div className="bg-blue-50 p-3 rounded-lg mb-4 inline-block">
                                                <p className="text-sm text-gray-600">Estimated price</p>
                                                <p className="text-2xl font-bold text-[var(--gold-accent)]">
                                                    ${Number(request.estimatedPrice).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{request.description}</p>
                                        <Link
                                            to={`/admin/listing-requests/${request._id}`}
                                            className="inline-flex items-center justify-center bg-[var(--gold-accent)] text-white px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            View request
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AdminListingRequestsPage;
