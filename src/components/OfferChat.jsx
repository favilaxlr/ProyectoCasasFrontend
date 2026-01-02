import { useState, useEffect, useRef } from 'react';
import { IoCashOutline, IoSendSharp, IoCloseCircle, IoCheckmarkCircle, IoTimeOutline, IoPersonOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { createOfferRequest, getUserOfferRequest, sendOfferMessageRequest } from '../api/offers';

function OfferChat({ propertyId, propertyTitle, propertyPrice, onClose }) {
    const [offerId, setOfferId] = useState(null);
    const [offer, setOffer] = useState(null);
    const [offerAmount, setOfferAmount] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [offer?.messages]);

    // Polling para obtener nuevos mensajes
    useEffect(() => {
        if (!offerId) return;

        const interval = setInterval(async () => {
            try {
                const res = await getUserOfferRequest(offerId);
                setOffer(res.data);
            } catch (error) {
                console.error('Error refreshing messages:', error);
            }
        }, 5000); // Actualizar cada 5 segundos

        return () => clearInterval(interval);
    }, [offerId]);

    const handleCreateOffer = async (e) => {
        e.preventDefault();

        if (!offerAmount || !message) {
            toast.error('Please enter an offer amount and message');
            return;
        }

        // Validar que la oferta no sea mayor al precio de venta
        if (propertyPrice && Number(offerAmount) > propertyPrice) {
            toast.error(`Your offer cannot be higher than the asking price ($${propertyPrice.toLocaleString()})`);
            return;
        }

        setLoading(true);
        try {
            const res = await createOfferRequest({
                propertyId,
                offerAmount: Number(offerAmount),
                message
            });

            setOffer(res.data);
            setOfferId(res.data._id);
            setOfferAmount('');
            setMessage('');
            toast.success('Offer sent successfully!');
        } catch (error) {
            console.error('Error creating offer:', error);
            toast.error(error.response?.data?.message?.[0] || 'Error sending offer');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim()) return;

        setSending(true);
        try {
            const res = await sendOfferMessageRequest(offerId, message);
            setOffer(res.data);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: <IoTimeOutline />, text: 'Pending' },
            in_progress: { color: 'bg-blue-100 text-blue-800', icon: <IoPersonOutline />, text: 'In Progress' },
            accepted: { color: 'bg-green-100 text-green-800', icon: <IoCheckmarkCircle />, text: 'Accepted' },
            rejected: { color: 'bg-red-100 text-red-800', icon: <IoCloseCircle />, text: 'Rejected' },
            closed: { color: 'bg-gray-100 text-gray-800', icon: <IoCloseCircle />, text: 'Closed' }
        };

        const badge = statuses[status] || statuses.pending;
        return (
            <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                {badge.icon}
                <span className="ml-1">{badge.text}</span>
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center">
                    <IoCashOutline className="mr-2 text-green-600" />
                    Make an Offer
                </h3>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <IoCloseCircle className="text-2xl" />
                    </button>
                )}
            </div>

            <p className="text-gray-600 mb-4">{propertyTitle}</p>

            {!offerId ? (
                // Formulario para crear oferta
                <form onSubmit={handleCreateOffer}>
                    {propertyPrice && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>Asking Price:</strong> ${propertyPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Your offer must be equal to or less than the asking price
                            </p>
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                            Your Offer Amount (USD)
                        </label>
                        <input
                            type="number"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            placeholder="250000"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            min="1"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">
                            Your Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="I'm interested in this property..."
                            rows="4"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Sending...' : 'Send Offer'}
                    </button>
                </form>
            ) : (
                // Chat de la oferta
                <div>
                    <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-600">Your Offer</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${offer?.offerAmount?.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            {getStatusBadge(offer?.status)}
                        </div>
                    </div>

                    {offer?.assignedTo && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                            <p className="text-blue-800">
                                <IoPersonOutline className="inline mr-1" />
                                <strong>Assigned to:</strong> {offer.assignedTo.username}
                            </p>
                        </div>
                    )}

                    {/* Mensajes */}
                    <div className="border-2 border-gray-200 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
                        {offer?.messages?.map((msg, index) => {
                            const isMe = msg.sender._id === offer.user._id || msg.sender._id === offer.user;
                            const senderImage = msg.sender.profileImage?.url || 'https://via.placeholder.com/40';
                            return (
                                <div
                                    key={index}
                                    className={`mb-4 flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isMe && (
                                        <img
                                            src={senderImage}
                                            alt={msg.sender.username}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            isMe
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                    >
                                        <p className="text-xs font-semibold mb-1">
                                            {msg.sender.username}
                                        </p>
                                        <p className="break-words">{msg.content}</p>
                                        <p className="text-xs mt-1 opacity-75">
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    {isMe && (
                                        <img
                                            src={senderImage}
                                            alt={msg.sender.username}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                        />
                                    )}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Enviar mensaje */}
                    {offer?.status !== 'closed' && offer?.status !== 'rejected' && (
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !message.trim()}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center"
                            >
                                <IoSendSharp />
                            </button>
                        </form>
                    )}

                    {(offer?.status === 'closed' || offer?.status === 'rejected') && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center text-gray-600">
                            This offer has been {offer.status}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default OfferChat;
