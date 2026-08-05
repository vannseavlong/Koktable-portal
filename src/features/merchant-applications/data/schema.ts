import { z } from 'zod'

const applicationStatusSchema = z.union([
  z.literal('pending'),
  z.literal('approved'),
  z.literal('rejected'),
])
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>

// Matches `schemas/admin/merchant_applications.ts` / `GET /admin/merchant-applications`
// in Backend (see ADMIN_API.md § 4). `_created_at` comes from the table's
// `timestamps: true` and is returned verbatim on every row.
const _merchantApplicationSchema = z.object({
  application_id: z.string(),
  restaurant_name: z.string(),
  applicant_name: z.string(),
  contact_email: z.string(),
  contact_phone: z.string().optional(),
  description: z.string().optional(),
  status: applicationStatusSchema,
  _created_at: z.string(),
  rejection_reason: z.string().optional(),
})
export type MerchantApplication = z.infer<typeof _merchantApplicationSchema>

export const merchantApplicationsListResponseSchema = z.object({
  applications: z.array(_merchantApplicationSchema),
})
export type MerchantApplicationsListResponse = z.infer<
  typeof merchantApplicationsListResponseSchema
>
