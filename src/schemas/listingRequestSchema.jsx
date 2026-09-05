import { z } from 'zod';

export const PROPERTY_TYPES = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'vacant_land', label: 'Vacant Land' }
];

export const listingRequestSchema = z.object({
    fullName: z
        .string('Full name is required')
        .trim()
        .min(3, 'Full name must be at least 3 characters')
        .max(80, 'Full name must be at most 80 characters'),
    phone: z.preprocess(
        (val) => val ?? '',
        z.string('Phone is required')
            .min(1, 'Phone is required')
            .refine((value) => /^\+[1-9]\d{1,14}$/.test(value), 'Please select a country and enter a valid number')
    ),
    email: z.email({
        error: (email) => email.input === undefined ? 'Email is required' : 'Invalid email format'
    }),
    location: z
        .string('Location is required')
        .trim()
        .min(2, 'Enter the city or neighborhood')
        .max(120, 'Location must be at most 120 characters'),
    propertyType: z.enum(
        ['house', 'apartment', 'condo', 'townhouse', 'vacant_land'],
        { error: 'Select a property type' }
    ),
    estimatedPrice: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
        z.number({ error: 'Estimated price must be a number' })
            .positive('Estimated price must be positive')
            .optional()
    ),
    description: z
        .string('Description is required')
        .trim()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be at most 2000 characters'),
    aceptaPrivacidad: z.boolean().refine((value) => value === true, {
        message: 'You must accept the Privacy Policy'
    })
});
