import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getPendingOffersRequest, getMyAssignedOffersRequest, takeOfferRequest, updateOfferStatusRequest } from '../api/offers';
import { IoCashOutline, IoTimeOutline, IoPersonOutline, IoCheckmarkCircle, IoCloseCircle, IoChatbubbleEllipsesOutline, IoHomeOutline, IoHandRightOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

function AdminOffersPage() {
    const [pendingOffers, setPendingOffers] = useState([]);
    const [assignedOffers, setAssignedOffers] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'assigned'
    const [loading, setLoading] = useState(true);
    const [takingOffer, setTakingOffer] = useState(null);
    const [cancellingOffer, setCancellingOffer] = useState(null);

    useEffect(() => {
        loadOffers();
    }, []);

    // Auto-refresh cada 10 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            loadOffers(true);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const loadOffers = async (silent = false) => {
        try {
            const [pendingRes, assignedRes] = await Promise.all([
                getPendingOffersRequest(),
                getMyAssignedOffersRequest()
            ]);

            setPendingOffers(pendingRes.data);
            setAssignedOffers(assignedRes.data);
        } catch (error) {
            console.error('Error loading offers:', error);
            if (!silent) {
                toast.error('Error loading offers');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handleTakeOffer = async (offerId) => {
        setTakingOffer(offerId);
        try {
            await takeOfferRequest(offerId);
            toast.success('Offer assigned to you!');
            await loadOffers();
            setActiveTab('assigned'); // Switch to assigned tab
        } catch (error) {
            console.error('Error taking offer:', error);
            toast.error(error.response?.data?.message?.[0] || 'Error taking offer');
        } finally {
            setTakingOffer(null);
        }
    };

    const handleCancelOffer = async (offerId) => {
        const confirmed = window.confirm('Cancel this offer? The conversation will be archived but kept for reference.');
        if (!confirmed) return;

        setCancellingOffer(offerId);
        try {
            await updateOfferStatusRequest(offerId, 'closed');
            toast.info('Offer cancelled and archived.');
            await loadOffers();
        } catch (error) {
            console.error('Error cancelling offer:', error);
            toast.error(error.response?.data?.message?.[0] || 'Error cancelling offer');
        } finally {
            setCancellingOffer(null);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <IoTimeOutline />, text: 'Pending' },
            in_progress: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <IoPersonOutline />, text: 'In Progress' },
            accepted: { color: 'bg-green-100 text-green-800 border-green-300', icon: <IoCheckmarkCircle />, text: 'Accepted' },
            rejected: { color: 'bg-red-100 text-red-800 border-red-300', icon: <IoCloseCircle />, text: 'Rejected' },
            closed: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <IoCloseCircle />, text: 'Closed' }
        };

        const badge = statuses[status] || statuses.pending;
        return (
            <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${badge.color}`}>
                {badge.icon}
                <span className="ml-1">{badge.text}</span>
            </span>
        );
    };

    const renderOfferCard = (offer, showTakeButton = false) => {
        const property = offer.property || null;
        const buyer = offer.user || {};
        const propertyId = property?._id;
        const propertyTitle = property?.title || 'Property unavailable';
        const propertyImages = property?.images || [];
        const mainImage = propertyImages.find(img => img.isMain)?.url || propertyImages[0]?.url;
        const propertyAddress = property?.address;
        const askingPrice = property?.price?.sale;
        const propertyLink = propertyId ? `/properties/${propertyId}` : null;

        const canCancel = !showTakeButton && ['pending', 'in_progress'].includes(offer.status);

        return (
            <div
                key={offer._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Property Image */}
                    <div className="md:w-1/3">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={propertyTitle}
                                className="w-full h-48 md:h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                                <IoHomeOutline className="text-6xl text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Offer Details */}
                    <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                {propertyLink ? (
                                    <Link
                                        to={propertyLink}
                                        className="text-xl font-bold text-gray-800 hover:text-[var(--gold-accent)] transition-colors"
                                    >
                                        {propertyTitle}
                                    </Link>
                                ) : (
                                    <p className="text-xl font-bold text-gray-500">{propertyTitle}</p>
                                )}
                                <p className="text-gray-600 text-sm mt-1">
                                    {propertyAddress?.street && propertyAddress?.city
                                        ? `${propertyAddress.street}, ${propertyAddress.city}`
                                        : 'Address unavailable'}
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Offered by: <strong>{buyer.username || 'Unknown buyer'}</strong>
                                    {buyer.email ? ` (${buyer.email})` : ''}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                {getStatusBadge(offer.status)}
                                {canCancel && (
                                    <button
                                        onClick={() => handleCancelOffer(offer._id)}
                                        disabled={cancellingOffer === offer._id}
                                        className="text-sm font-semibold px-3 py-1 border-2 border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-60"
                                    >
                                        {cancellingOffer === offer._id ? 'Cancelling…' : 'Cancel Offer'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {!property && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 text-sm text-red-700">
                                This property was removed, but the offer history remains for reference.
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-600">Offer Amount</p>
                                <p className="text-2xl font-bold text-[var(--gold-accent)]">
                                    ${offer.offerAmount?.toLocaleString()}
                                </p>
                            </div>
                            {askingPrice && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">Asking Price</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${askingPrice?.toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                            <IoChatbubbleEllipsesOutline className="mr-2" />
                            <span>{offer.messages?.length || 0} messages</span>
                            {offer.unreadCount?.admin > 0 && (
                                <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                    {offer.unreadCount.admin} new
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {showTakeButton ? (
                                <button
                                    onClick={() => handleTakeOffer(offer._id)}
                                    disabled={takingOffer === offer._id}
                                    className="flex-1 bg-[var(--gold-accent)] text-white py-2 rounded-lg hover:bg-[#145a75] transition-colors disabled:bg-gray-400 flex items-center justify-center"
                                >
                                    {takingOffer === offer._id ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Taking...
                                        </>
                                    ) : (
                                        <>
                                            <IoHandRightOutline className="mr-2" />
                                            Take This Offer
                                        </>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    to={`/admin/offers/${offer._id}`}
                                    className="flex-1 bg-[var(--gold-accent)] text-white text-center py-2 rounded-lg hover:bg-[#145a75] transition-colors flex items-center justify-center"
                                >
                                    <IoChatbubbleEllipsesOutline className="mr-2" />
                                    View Conversation
                                </Link>
                            )}
                            {propertyLink ? (
                                <Link
                                    to={propertyLink}
                                    className="flex-1 bg-gray-200 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                                >
                                    <IoHomeOutline className="mr-2" />
                                    View Property
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="flex-1 bg-gray-100 text-gray-400 text-center py-2 rounded-lg flex items-center justify-center cursor-not-allowed"
                                >
                                    <IoHomeOutline className="mr-2" />
                                    Property Unavailable
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                    <IoCashOutline className="mr-3 text-[var(--gold-accent)]" />
                    Manage Offers
                </h1>
                <p className="text-gray-400 mt-2">Review and respond to property offers</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-semibold transition-all ${
                        activeTab === 'pending'
                            ? 'text-[var(--gold-accent)] border-b-4 border-[var(--gold-accent)] -mb-0.5'
                            : 'text-gray-600 hover:text-[var(--gold-accent)]'
                    }`}
                >
                    Pending Offers
                    {pendingOffers.length > 0 && (
                        <span className="ml-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                            {pendingOffers.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('assigned')}
                    className={`px-6 py-3 font-semibold transition-all ${
                        activeTab === 'assigned'
                            ? 'text-[var(--gold-accent)] border-b-4 border-[var(--gold-accent)] -mb-0.5'
                            : 'text-gray-600 hover:text-[var(--gold-accent)]'
                    }`}
                >
                    My Assigned Offers
                    {assignedOffers.length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                            {assignedOffers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'pending' ? (
                pendingOffers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <IoTimeOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">No pending offers</h2>
                        <p className="text-gray-500">All offers have been assigned or there are no new offers</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {pendingOffers.map((offer) => renderOfferCard(offer, true))}
                    </div>
                )
            ) : (
                assignedOffers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <IoChatbubbleEllipsesOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">No assigned offers</h2>
                        <p className="text-gray-500">Take pending offers to start conversations</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {assignedOffers.map((offer) => renderOfferCard(offer, false))}
                    </div>
                )
            )}
        </div>
    );
}

export default AdminOffersPage;
