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
    const [cancellingOffer, setCancellingOffer] = useState(false);
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

    const handleCancelOffer = async () => {
        const confirmed = window.confirm('Cancel this offer? The chat will be archived so you can reference it later.');
        if (!confirmed) return;

        setCancellingOffer(true);
        try {
            await updateOfferStatusRequest(id, 'closed');
            toast.info('Offer cancelled and archived.');
            await loadOffer();
        } catch (error) {
            console.error('Error cancelling offer:', error);
            toast.error('Error cancelling offer');
        } finally {
            setCancellingOffer(false);
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

    const normalizeSender = (sender) => {
        if (!sender) {
            return { id: null, username: '', profileImage: null };
        }

        if (typeof sender === 'string') {
            return { id: sender, username: '', profileImage: null };
        }

        return {
            id: sender._id || sender.id || null,
            username: sender.username || '',
            profileImage: sender.profileImage || null
        };
    };

    const getEntityId = (entity) => {
        if (!entity) return null;
        if (typeof entity === 'string') return entity;
        return entity._id || entity.id || null;
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gold-accent)]"></div>
                </div>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-400">Offer not found or not assigned to you</h2>
                    <Link to="/admin/offers" className="text-[var(--gold-accent)] hover:underline mt-4 inline-block">
                        Back to Offers
                    </Link>
                </div>
            </div>
        );
    }

    const property = offer.property || null;
    const propertyId = property?._id;
    const propertyTitle = property?.title || 'Property unavailable';
    const propertyImages = property?.images || [];
    const mainImage = propertyImages.find(img => img.isMain)?.url || propertyImages[0]?.url;
    const propertyAddress = property?.address;
    const askingPrice = property?.price?.sale;

    const assignedId = getEntityId(offer.assignedTo);

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="bg-[var(--soft-black)] px-6 py-4 -mx-6 -mt-6 mb-6">
                <Link
                    to="/admin/offers"
                    className="inline-flex items-center text-[var(--gold-accent)] hover:text-[#145a75] mb-4"
                >
                    <IoArrowBackSharp className="mr-2" />
                    Back to Offers
                </Link>
                <h1 className="text-3xl font-bold flex items-center text-white">
                    <IoCashOutline className="mr-3 text-[var(--gold-accent)]" />
                    Offer Management
                </h1>
            </div>

            {/* Property & User Info */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={propertyTitle}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-48 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                <IoHomeOutline className="text-4xl" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        {propertyId ? (
                            <Link
                                to={`/properties/${propertyId}`}
                                className="text-2xl font-bold text-gray-800 hover:text-[var(--gold-accent)] transition-colors flex items-center"
                            >
                                {propertyTitle}
                                <IoHomeOutline className="ml-2" />
                            </Link>
                        ) : (
                            <p className="text-2xl font-bold text-gray-500 flex items-center">
                                {propertyTitle}
                                <IoHomeOutline className="ml-2 text-gray-400" />
                            </p>
                        )}
                        <p className="text-gray-600 mt-2">
                            {propertyAddress?.street && propertyAddress?.city
                                ? `${propertyAddress.street}, ${propertyAddress.city}${propertyAddress?.state ? `, ${propertyAddress.state}` : ''}`
                                : 'Address unavailable'}
                        </p>

                        {!property && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                This property was removed, but you can still review or close the offer history.
                            </div>
                        )}

                        <div className="mt-3 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={offer.user.profileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.user.username)}&background=random&color=fff&size=128`}
                                    alt={offer.user.username}
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.user.username)}&background=random&color=fff&size=128`;
                                    }}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
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
                            {askingPrice && (
                                <div className="bg-blue-50 p-3 rounded-lg flex-1">
                                    <p className="text-sm text-gray-600">Asking Price</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${askingPrice?.toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Status Control */}
                        <div className="mt-4">
                            <label className="block text-sm font-semibold mb-2">Offer Status</label>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <select
                                    value={offer.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updatingStatus}
                                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--gold-accent)] focus:border-[var(--gold-accent)] disabled:bg-gray-100"
                                >
                                    <option value="in_progress">In Progress</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <div className="flex gap-2 items-center">
                                    {getStatusBadge(offer.status)}
                                    {offer.status !== 'closed' && offer.status !== 'rejected' && (
                                        <button
                                            type="button"
                                            onClick={handleCancelOffer}
                                            disabled={cancellingOffer}
                                            className="text-sm font-semibold px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                                        >
                                            {cancellingOffer ? 'Cancelling…' : 'Cancel Offer'}
                                        </button>
                                    )}
                                </div>
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
                        const senderInfo = normalizeSender(msg.sender);
                        const senderId = senderInfo.id;
                        const isAdmin = assignedId && senderId && senderId === assignedId;
                        const displayName = senderInfo.username || (isAdmin ? 'Team Member' : 'Guest');
                        const senderImage = senderInfo.profileImage?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`;
                        return (
                            <div
                                key={index}
                                className={`mb-4 flex gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isAdmin && (
                                    <img
                                        src={senderImage}
                                        alt={displayName}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gray-300"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`;
                                        }}
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
                                        {displayName}
                                    </p>
                                    <p className="break-words">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isAdmin ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {new Date(msg.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <img
                                        src={senderImage}
                                        alt={displayName}
                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-blue-300"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128`;
                                        }}
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
