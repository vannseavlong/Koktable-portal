import { z } from 'zod'

export const reservationStatusSchema = z.union([
  z.literal('pending'),
  z.literal('confirmed'),
  z.literal('active'),
  z.literal('completed'),
  z.literal('cancelled'),
])
export type ReservationStatus = z.infer<typeof reservationStatusSchema>

// Matches the `AdminReservation` object documented in ADMIN_API.md
// (`/admin/reservations`) — a cross-user view of every reservation, fanned out from
// each user's own per-user sheet and merged by the backend.
const _reservationSchema = z.object({
  reservation_id: z.string(),
  guest_name: z.string(),
  party_size: z.number(),
  service_id: z.string(),
  service_name: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  daily_rate: z.number(),
  notes: z.string().optional(),
  status: reservationStatusSchema,
  nights: z.number(),
  total: z.number(),
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
  // Blank unless the reservation was created via `item_id` against a restaurant-scoped
  // catalog_items row — see ADMIN_API.md § "Reservations (orders)".
  restaurant_id: z.string().optional(),
})
export type Reservation = z.infer<typeof _reservationSchema>

export const reservationsListResponseSchema = z.object({
  reservations: z.array(_reservationSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

// The admin-only status state machine documented in ADMIN_API.md:
//   pending -> confirmed -> active -> completed
//      \-------\----------\----------> cancelled (from any non-terminal state)
// `completed` and `cancelled` are terminal.
export const nextStatusOptions: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}
