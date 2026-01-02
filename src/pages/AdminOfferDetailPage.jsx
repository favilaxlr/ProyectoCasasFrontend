import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { getAssignedOfferRequest, sendAdminMessageRequest, updateOfferStatusRequest } from '../api/offers';
import { IoArrowBackSharp, IoCashOutline, IoSendSharp, IoHomeOutline, IoPersonOutline, IoTimeOutline, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { toast } from 'react-toastify';

function AdminOfferDetailPage() {
    const { id } = useParams();
    const [offer, setOffer] = useState(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        loadOffer();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [offer?.messages]);

    // Polling para actualizar mensajes
    useEffect(() => {
        const interval = setInterval(() => {
            loadOffer(true); // Silent reload
        }, 5000);

        return () => clearInterval(interval);
    }, [id]);

    const loadOffer = async (silent = false) => {
        try {
            const res = await getAssignedOfferRequest(id);
            setOffer(res.data);
        } catch (error) {
            console.error('Error loading offer:', error);
            if (!silent) {
                toast.error('Error loading offer');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        setSending(true);
        try {
            const res = await sendAdminMessageRequest(id, message);
            setOffer(res.data);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
            return;
        }

        setUpdatingStatus(true);
        try {
            await updateOfferStatusRequest(id, newStatus);
            toast.success('Status updated successfully');
            await loadOffer();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
        } finally {
            setUpdatingStatus(false);
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
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-400">Offer not found or not assigned to you</h2>
                    <Link to="/admin/offers" className="text-green-600 hover:underline mt-4 inline-block">
                        Back to Offers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    to="/admin/offers"
                    className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
                >
                    <IoArrowBackSharp className="mr-2" />
                    Back to Offers
                </Link>
                <h1 className="text-3xl font-bold flex items-center">
                    <IoCashOutline className="mr-3 text-green-600" />
                    Offer Management
                </h1>
            </div>

            {/* Property & User Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {offer.property?.images?.[0] && (
                        <div className="md:w-1/3">
                            <img
                                src={offer.property.images.find(img => img.isMain)?.url || offer.property.images[0].url}
                                alt={offer.property.title}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <Link
                            to={`/properties/${offer.property._id}`}
                            className="text-2xl font-bold text-gray-800 hover:text-green-600 transition-colors flex items-center"
                        >
                            {offer.property.title}
                            <IoHomeOutline className="ml-2" />
                        </Link>
                        <p className="text-gray-600 mt-2">
                            {offer.property.address?.street}, {offer.property.address?.city}, {offer.property.address?.state}
                        </p>

                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={offer.user.profileImage?.url || 'https://via.placeholder.com/60'}
                                    alt={offer.user.username}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-300"
                                />
                                <div>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">Offered by</p>
                                    <p className="font-bold text-lg">{offer.user.username}</p>
                                </div>
                            </div>
                            <div className="space-y-2 pl-2 border-l-2 border-blue-300">
                                <div className="flex items-center gap-2">
                                    <IoPersonOutline className="text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">{offer.user.email}</span>
                                </div>
                                {offer.user.phone && (
                                    <div className="flex items-center gap-2">
                                        <IoPersonOutline className="text-blue-600" />
                                        <a href={`tel:${offer.user.phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                                            {offer.user.phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <div className="bg-green-50 p-3 rounded-lg flex-1">
                                <p className="text-sm text-gray-600">Offer Amount</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${offer.offerAmount?.toLocaleString()}
                                </p>
                            </div>
                            {offer.property.price?.sale && (
                                <div className="bg-blue-50 p-3 rounded-lg flex-1">
                                    <p className="text-sm text-gray-600">Asking Price</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${offer.property.price.sale?.toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Status Control */}
                        <div className="mt-4">
                            <label className="block text-sm font-semibold mb-2">Offer Status</label>
                            <div className="flex gap-2">
                                <select
                                    value={offer.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updatingStatus}
                                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                                >
                                    <option value="in_progress">In Progress</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="closed">Closed</option>
                                </select>
                                {getStatusBadge(offer.status)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Conversation</h2>

                {/* Messages */}
                <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 h-96 overflow-y-auto bg-gray-50">
                    {offer.messages?.map((msg, index) => {
                        const isAdmin = msg.sender._id === offer.assignedTo._id || msg.sender._id === offer.assignedTo;
                        const senderImage = msg.sender.profileImage?.url || 'https://via.placeholder.com/40';
                        return (
                            <div
                                key={index}
                                className={`mb-4 flex gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isAdmin && (
                                    <img
                                        src={senderImage}
                                        alt={msg.sender.username}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gray-300"
                                    />
                                )}
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        isAdmin
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-800 shadow-md'
                                    }`}
                                >
                                    <p className="text-xs font-semibold mb-1">
                                        {msg.sender.username}
                                    </p>
                                    <p className="break-words">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isAdmin ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <img
                                        src={senderImage}
                                        alt={msg.sender.username}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-blue-300"
                                    />
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Send Message */}
                {offer.status !== 'closed' && offer.status !== 'rejected' ? (
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={sending || !message.trim()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center"
                        >
                            <IoSendSharp className="text-xl" />
                        </button>
                    </form>
                ) : (
                    <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
                        This offer has been {offer.status}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminOfferDetailPage;
