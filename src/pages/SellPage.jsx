import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { listingRequestSchema, PROPERTY_TYPES } from '../schemas/listingRequestSchema';
import { createListingRequestRequest } from '../api/listingRequests';
import ImageUploader from '../components/ImageUploader';

const defaultValues = {
    fullName: '',
    phone: '',
    email: '',
    location: '',
    propertyType: '',
    estimatedPrice: '',
    squareFeet: '',
    lotSquareFeet: '',
    description: '',
    aceptaPrivacidad: false
};

export default function SellPage() {
    const { user, isAuthenticated } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [photoKey, setPhotoKey] = useState(0);
    const [submitError, setSubmitError] = useState('');

    const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(listingRequestSchema),
        defaultValues
    });

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        if (user.username) setValue('fullName', user.username);
        if (user.email) setValue('email', user.email);
        if (user.phone) setValue('phone', user.phone);
    }, [isAuthenticated, user, setValue]);

    const onSubmit = async (data) => {
        setSubmitError('');
        const formData = new FormData();
        formData.append('fullName', data.fullName);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('location', data.location);
        formData.append('propertyType', data.propertyType);
        if (data.estimatedPrice) {
            formData.append('estimatedPrice', data.estimatedPrice);
        }
        if (data.squareFeet) {
            formData.append('squareFeet', data.squareFeet);
        }
        if (data.lotSquareFeet) {
            formData.append('lotSquareFeet', data.lotSquareFeet);
        }
        formData.append('description', data.description);
        formData.append('aceptaPrivacidad', 'true');
        photos.forEach((file) => {
            if (file) formData.append('images', file);
        });

        try {
            await createListingRequestRequest(formData);
            setSubmitted(true);
            reset(defaultValues);
            setPhotos([]);
            setPhotoKey((key) => key + 1);
            toast.success('Your request was sent. An advisor will contact you soon.');
        } catch (error) {
            const messages = error.response?.data?.message;
            const text = Array.isArray(messages) ? messages.join(', ') : (messages || 'Error sending your request');
            setSubmitError(text);
            toast.error(text);
        }
    };

    const handleSendAnother = () => {
        setSubmitted(false);
        setSubmitError('');
        reset(defaultValues);
        if (isAuthenticated && user) {
            if (user.username) setValue('fullName', user.username);
            if (user.email) setValue('email', user.email);
            if (user.phone) setValue('phone', user.phone);
        }
    };

    return (
        <div className="w-full">
            <section className="px-6 py-12 md:py-16 bg-gray-50">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[var(--gold-accent)]">
                        Sell with us
                    </p>
                    <h1 className="mt-2 text-3xl md:text-4xl font-bold">Want to sell your property?</h1>
                    <p className="mt-3 text-gray-600">
                        Leave your details and basic information about your home. An advisor will contact you at no cost.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
                <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
                    <div className="space-y-6 text-sm text-gray-600">
                        <h2 className="text-2xl font-bold text-gray-900">How we walk with you</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="mt-0.5 font-semibold text-[var(--gold-accent)]">1.</span>
                                <span>We receive your details and review the information about your property.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-0.5 font-semibold text-[var(--gold-accent)]">2.</span>
                                <span>An advisor contacts you to clarify details and the next step.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-0.5 font-semibold text-[var(--gold-accent)]">3.</span>
                                <span>We guide you through marketing, paperwork, and the sale process.</span>
                            </li>
                        </ul>
                        <p className="rounded-xl bg-[var(--gold-accent)]/10 px-4 py-3 text-gray-800">
                            This is not an automatic listing; we review it with you first.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-lg sm:px-10">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
                                <IoCheckmarkSharp />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Details received!</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                An advisor will review your property information and contact you soon.
                            </p>
                            <button
                                type="button"
                                onClick={handleSendAnother}
                                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--gold-accent)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                            >
                                Submit another request
                            </button>
                        </div>
                    ) : (
                        <form
                            id="formulario-vender"
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6 rounded-2xl bg-white p-6 shadow-lg sm:p-8"
                        >
                            {submitError && (
                                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {submitError}
                                </div>
                            )}

                            <fieldset className="space-y-4">
                                <legend className="text-lg font-semibold text-gray-900">Your contact details</legend>
                                <div>
                                    <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                                        Full name *
                                    </label>
                                    <input
                                        id="fullName"
                                        className={`input-field w-full ${errors.fullName ? 'error' : ''}`}
                                        {...register('fullName')}
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Phone *</label>
                                        <div className="phone-input-wrapper">
                                            <Controller
                                                name="phone"
                                                control={control}
                                                render={({ field: { onChange, value } }) => (
                                                    <PhoneInput
                                                        international
                                                        countryCallingCodeEditable={false}
                                                        defaultCountry="US"
                                                        value={value || ''}
                                                        onChange={onChange}
                                                        className={`phone-input-custom ${errors.phone ? 'phone-input-error' : ''}`}
                                                        placeholder="Select country and number"
                                                    />
                                                )}
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                            Email *
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            className={`input-field w-full ${errors.email ? 'error' : ''}`}
                                            {...register('email')}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                                        )}
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="space-y-4">
                                <legend className="text-lg font-semibold text-gray-900">Property details</legend>
                                <div>
                                    <label htmlFor="location" className="mb-1 block text-sm font-medium text-gray-700">
                                        Location (city / neighborhood) *
                                    </label>
                                    <input
                                        id="location"
                                        className={`input-field w-full ${errors.location ? 'error' : ''}`}
                                        placeholder="e.g. Dallas, TX or your neighborhood"
                                        {...register('location')}
                                    />
                                    {errors.location && (
                                        <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="propertyType" className="mb-1 block text-sm font-medium text-gray-700">
                                            Property type *
                                        </label>
                                        <select
                                            id="propertyType"
                                            className={`input-field w-full ${errors.propertyType ? 'error' : ''}`}
                                            {...register('propertyType')}
                                        >
                                            <option value="">Select…</option>
                                            {PROPERTY_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.propertyType && (
                                            <p className="mt-1 text-sm text-red-500">{errors.propertyType.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="estimatedPrice" className="mb-1 block text-sm font-medium text-gray-700">
                                            Estimated price (optional)
                                        </label>
                                        <input
                                            id="estimatedPrice"
                                            type="number"
                                            min={0}
                                            placeholder="$"
                                            className={`input-field w-full ${errors.estimatedPrice ? 'error' : ''}`}
                                            {...register('estimatedPrice')}
                                        />
                                        {errors.estimatedPrice && (
                                            <p className="mt-1 text-sm text-red-500">{errors.estimatedPrice.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {watch('propertyType') !== 'vacant_land' && (
                                        <div>
                                            <label htmlFor="squareFeet" className="mb-1 block text-sm font-medium text-gray-700">
                                                House size (sq ft)
                                            </label>
                                            <input
                                                id="squareFeet"
                                                type="number"
                                                min={1}
                                                placeholder="e.g. 1800"
                                                className={`input-field w-full ${errors.squareFeet ? 'error' : ''}`}
                                                {...register('squareFeet')}
                                            />
                                            {errors.squareFeet && (
                                                <p className="mt-1 text-sm text-red-500">{errors.squareFeet.message}</p>
                                            )}
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="lotSquareFeet" className="mb-1 block text-sm font-medium text-gray-700">
                                            Lot size (sq ft) {watch('propertyType') === 'vacant_land' ? '*' : ''}
                                        </label>
                                        <input
                                            id="lotSquareFeet"
                                            type="number"
                                            min={1}
                                            placeholder="e.g. 7200"
                                            className={`input-field w-full ${errors.lotSquareFeet ? 'error' : ''}`}
                                            {...register('lotSquareFeet')}
                                        />
                                        {errors.lotSquareFeet && (
                                            <p className="mt-1 text-sm text-red-500">{errors.lotSquareFeet.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                                        Describe your property *
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        className={`input-field w-full ${errors.description ? 'error' : ''}`}
                                        placeholder="Bedrooms, bathrooms, square footage, condition, reason for selling, etc."
                                        {...register('description')}
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="mb-2 text-sm font-medium text-gray-700">Photos (optional)</p>
                                    <p className="mb-3 text-xs text-gray-500">
                                        Add up to 10 photos so we can better evaluate your home.
                                    </p>
                                    <ImageUploader key={photoKey} onChange={setPhotos} maxFiles={10} />
                                </div>
                            </fieldset>

                            <label className="flex items-start gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 rounded accent-[var(--gold-accent)]"
                                    {...register('aceptaPrivacidad')}
                                />
                                <span>
                                    I accept the{' '}
                                    <Link to="/privacy-policy" target="_blank" className="font-medium text-[var(--gold-accent)] hover:underline">
                                        Privacy Policy
                                    </Link>{' '}
                                    *
                                </span>
                            </label>
                            {errors.aceptaPrivacidad && (
                                <p className="text-sm text-red-500">{errors.aceptaPrivacidad.message}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-[var(--gold-accent)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
                            >
                                {isSubmitting ? 'Sending…' : 'Send my details'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
