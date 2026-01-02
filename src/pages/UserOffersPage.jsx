import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getUserOffersRequest } from '../api/offers';
import { IoCashOutline, IoTimeOutline, IoPersonOutline, IoCheckmarkCircle, IoCloseCircle, IoChatbubbleEllipsesOutline, IoHomeOutline } from 'react-icons/io5';

function UserOffersPage() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <IoCashOutline className="mr-3 text-green-600" />
                    My Offers
                </h1>
                <p className="text-gray-600 mt-2">Track your property offers and conversations</p>
            </div>

            {offers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <IoCashOutline className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">No offers yet</h2>
                    <p className="text-gray-500 mb-6">Start making offers on properties you're interested in</p>
                    <Link
                        to="/properties"
                        className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <IoHomeOutline className="mr-2" />
                        Browse Properties
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {offers.map((offer) => (
                        <div
                            key={offer._id}
                            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Property Image */}
                                <div className="md:w-1/3">
                                    {offer.property?.images?.[0] ? (
                                        <img
                                            src={offer.property.images.find(img => img.isMain)?.url || offer.property.images[0].url}
                                            alt={offer.property.title}
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
                                            <Link
                                                to={`/properties/${offer.property._id}`}
                                                className="text-xl font-bold text-gray-800 hover:text-green-600 transition-colors"
                                            >
                                                {offer.property.title}
                                            </Link>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {offer.property.address?.street}, {offer.property.address?.city}
                                            </p>
                                        </div>
                                        {getStatusBadge(offer.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-sm text-gray-600">Your Offer</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                ${offer.offerAmount?.toLocaleString()}
                                            </p>
                                        </div>
                                        {offer.property.price?.sale && (
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-sm text-gray-600">Asking Price</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    ${offer.property.price.sale?.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {offer.assignedTo && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center">
                                            <IoPersonOutline className="text-blue-600 mr-2" />
                                            <span className="text-sm text-blue-800">
                                                <strong>Assigned to:</strong> {offer.assignedTo.username}
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
                                            className="flex-1 bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                                        >
                                            <IoChatbubbleEllipsesOutline className="mr-2" />
                                            View Conversation
                                        </Link>
                                        <Link
                                            to={`/properties/${offer.property._id}`}
                                            className="flex-1 bg-gray-200 text-gray-800 text-center py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                                        >
                                            <IoHomeOutline className="mr-2" />
                                            View Property
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserOffersPage;
