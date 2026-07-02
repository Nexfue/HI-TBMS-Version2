import { z } from 'zod';

export const step1Schema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name'),
    email: z.string().trim().email('Please enter a valid email address'),
    from: z.string().trim().min(2, 'Please enter an origin city'),
    to: z.string().trim().min(2, 'Please enter a destination city'),
    departureDate: z.string().min(1, 'Travel date is required'),
    returnDate: z.string().optional().or(z.literal('')),
    travelers: z.coerce.number().int().min(1, 'At least 1 traveler is required').max(20, 'Max 20 travelers'),
  })
  .refine((data) => data.from.trim().toLowerCase() !== data.to.trim().toLowerCase(), {
    message: 'Origin and destination must be different',
    path: ['to'],
  })
  .refine(
    (data) => {
      if (!data.returnDate) return true;
      return new Date(data.returnDate) >= new Date(data.departureDate);
    },
    {
      message: 'Return date must be on or after the travel date',
      path: ['returnDate'],
    }
  );
