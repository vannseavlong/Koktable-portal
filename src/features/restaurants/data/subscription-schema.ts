import { z } from 'zod'

// Matches the `Subscription` object documented in ADMIN_API.md § 5/"Merchant restaurant
// profile" — shared by the admin Restaurants feature and the merchant Billing page,
// same convention as location-schema.ts/hours-schema.ts living here and being reused
// by my-restaurant.
export const subscriptionTierSchema = z.union([
  z.literal('basic'),
  z.literal('pro'),
])
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>

export const subscriptionStatusSchema = z.union([
  z.literal('trialing'),
  z.literal('active'),
  z.literal('past_due'),
  z.literal('cancelled'),
])
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>

export const subscriptionSchema = z.object({
  subscription_id: z.string(),
  restaurant_id: z.string(),
  tier: subscriptionTierSchema,
  status: subscriptionStatusSchema,
  trial_ends_at: z.string().optional(),
  current_period_start: z.string().optional(),
  current_period_end: z.string().optional(),
  commission_rate: z.number().optional(),
})
export type Subscription = z.infer<typeof subscriptionSchema>

export const tierLabels: Record<SubscriptionTier, string> = {
  basic: 'Basic',
  pro: 'Pro',
}

export const statusLabels: Record<SubscriptionStatus, string> = {
  trialing: 'Trial',
  active: 'Active',
  past_due: 'Past due',
  cancelled: 'Cancelled',
}
