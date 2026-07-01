import { z } from 'zod';

// Mirrors the Angular FormGroup's Validators exactly:
// name: required, min 2 chars
// email: required, valid email
// from/to: required
// departureDate: required
// returnDate: optional
// travelers: required, 1-20
export const step1Schema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name (min 2 characters)'),
    email: z.string().trim().email('Enter a valid email address'),
    from: z.string().trim().min(1, 'Origin is required'),
    to: z.string().trim().min(1, 'Destination is required'),
    departureDate: z.string().min(1, 'Travel date is required'),
    returnDate: z.string().optional().default(''),
    travelers: z.coerce.number().int().min(1).max(20),
  })
  .refine((data) => !data.returnDate || data.returnDate >= data.departureDate, {
    message: 'Return date must be on or after the travel date',
    path: ['returnDate'],
  });
