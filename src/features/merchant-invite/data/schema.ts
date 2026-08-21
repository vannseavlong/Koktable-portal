import { z } from 'zod'

// Matches `GET /merchant/invite/:token` in Backend (see ADMIN_API.md § 7).
export const merchantInviteInfoSchema = z.object({
  restaurant: z.object({
    name: z.string(),
    description: z.string().optional(),
    logo: z.string().optional(),
  }),
  email: z.string(),
  expires_at: z.string(),
  account_exists: z.boolean(),
})
export type MerchantInviteInfo = z.infer<typeof merchantInviteInfoSchema>

// Client-side rules mirror `validatePasswordStrength` in `longcelot-sheet-db`
// (min 8 chars, upper/lower/digit) so weak-password 422s are rare — the server
// remains the source of truth.
export const merchantInviteAcceptSchema = z
  .object({
    full_name: z.string().min(1, 'Your name is required.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })
export type MerchantInviteAcceptInput = z.infer<
  typeof merchantInviteAcceptSchema
>
