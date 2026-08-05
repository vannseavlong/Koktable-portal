import { z } from 'zod'

// Matches `POST /merchant/apply` in Backend (see ADMIN_API.md § 7) — public,
// unauthenticated restaurant-owner application submission.
export const merchantApplySchema = z.object({
  restaurant_name: z.string().min(1, 'Restaurant name is required.'),
  applicant_name: z.string().min(1, 'Your name is required.'),
  contact_email: z.email('Enter a valid email.'),
  contact_phone: z.string().optional(),
  description: z.string().optional(),
})
export type MerchantApplyInput = z.infer<typeof merchantApplySchema>
