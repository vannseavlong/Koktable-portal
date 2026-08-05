import { z } from 'zod'

export const orderStatusSchema = z.union([
  z.literal('pending'),
  z.literal('confirmed'),
  z.literal('active'),
  z.literal('completed'),
  z.literal('cancelled'),
])
export type OrderStatus = z.infer<typeof orderStatusSchema>

// Matches the merchant-scoped reservation object returned by `/merchant/orders` —
// same shape as the admin `/admin/reservations` view, just pre-filtered to the
// caller's own restaurant_id server-side.
const _orderSchema = z.object({
  reservation_id: z.string(),
  guest_name: z.string(),
  party_size: z.number(),
  service_id: z.string(),
  service_name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  daily_rate: z.number(),
  notes: z.string().optional(),
  status: orderStatusSchema,
  nights: z.number(),
  total: z.number(),
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
})
export type Order = z.infer<typeof _orderSchema>

export const ordersListResponseSchema = z.object({
  orders: z.array(_orderSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

// Same status state machine merchants share with admin:
//   pending -> confirmed -> active -> completed
//      \-------\----------\----------> cancelled (from any non-terminal state)
export const nextStatusOptions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}
