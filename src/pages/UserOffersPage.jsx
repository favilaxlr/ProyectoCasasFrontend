import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import { getUserOffersRequest, cancelUserOfferRequest } from '../api/offers';
import { IoCashOutline, IoTimeOutline, IoPersonOutline, IoCheckmarkCircle, IoCloseCircle, IoChatbubbleEllipsesOutline, IoHomeOutline } from 'react-icons/io5';

function UserOffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingOffer, setCancellingOffer] = useState(null);

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        try {
            const res = await getUserOffersRequest();
            setOffers(res.data);
        } catch (error) {
            console.error('Error loading offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOffer = async (offerId) => {
        const confirmed = window.confirm('Do you want to cancel this offer? The conversation will remain for reference.');
        if (!confirmed) return;

        setCancellingOffer(offerId);
        try {
            await cancelUserOfferRequest(offerId);
            toast.info('Offer cancelled successfully.');
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
                    My Offers
                </h1>
                <p className="text-gray-400 mt-2">Track your property offers and conversations</p>
            </div>

            {offers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <IoCashOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">No offers yet</h2>
                    <p className="text-gray-500 mb-6">Start making offers on properties you're interested in</p>
                    <Link
                        to="/properties"
                        className="inline-flex items-center bg-[var(--gold-accent)] text-white px-6 py-3 rounded-lg hover:bg-[#145a75] transition-colors"
                    >
                        <IoHomeOutline className="mr-2" />
                        Browse Properties
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {offers.map((offer) => {
                        const property = offer.property || null;
                        const propertyId = property?._id;
                        const propertyTitle = property?.title || 'Property unavailable';
                        const propertyAddress = property?.address;
                        const propertyImages = property?.images || [];
                        const mainImage = propertyImages.find(img => img.isMain)?.url || propertyImages[0]?.url;
                        const askingPrice = property?.price?.sale;
                        const propertyLink = propertyId ? `/properties/${propertyId}` : null;

                        const assigned = offer.assignedTo;
                        const assignedName = typeof assigned === 'object' ? assigned?.username : assigned ? 'Team Member' : null;
                        const canCancel = ['pending', 'in_progress'].includes(offer.status);

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
                                            </div>
                                            <div className="flex flex-col gap-2 items-start sm:flex-row sm:items-center">
                                                {getStatusBadge(offer.status)}
                                                {canCancel && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelOffer(offer._id)}
                                                        disabled={cancellingOffer === offer._id}
                                                        className="text-xs sm:text-sm font-semibold px-4 py-1.5 border-2 border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-60"
                                                    >
                                                        {cancellingOffer === offer._id ? 'Cancelling…' : 'Cancel Offer'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {!property && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                                This property was removed, but your offer history is saved for reference.
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">Your Offer</p>
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

                                        {assigned && (
                                            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center">
                                                <IoPersonOutline className="text-blue-600 mr-2" />
                                                <span className="text-sm text-blue-800">
                                                    <strong>Assigned to:</strong> {assignedName}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm text-gray-500 mb-4">
                                            <IoChatbubbleEllipsesOutline className="mr-2" />
                                            <span>{offer.messages?.length || 0} messages</span>
                                            {offer.unreadCount?.user > 0 && (
                                                <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                                    {offer.unreadCount.user} new
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <Link
                                                to={`/my-offers/${offer._id}`}
                                                className="flex-1 bg-[var(--gold-accent)] text-white text-center py-2 rounded-lg hover:bg-[#145a75] transition-colors flex items-center justify-center"
                                            >
                                                <IoChatbubbleEllipsesOutline className="mr-2" />
                                                View Conversation
                                            </Link>
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
                    })}
                </div>
            )}
        </div>
    );
}

export default UserOffersPage;
