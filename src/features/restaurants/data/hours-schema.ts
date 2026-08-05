import { z } from 'zod'

// Matches `restaurant_hours` (Backend/schemas/admin/restaurant_hours.ts) — one row per
// day, embedded as `hours: DayHours[]` on the `Restaurant` object returned by
// `/admin/restaurants`, `/user/restaurants`, and `/merchant/restaurant` (ADMIN_API.md § 5).
export const dayOfWeekSchema = z.union([
  z.literal('monday'),
  z.literal('tuesday'),
  z.literal('wednesday'),
  z.literal('thursday'),
  z.literal('friday'),
  z.literal('saturday'),
  z.literal('sunday'),
])
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]

export const hoursPeriodSchema = z.object({
  open: z.string(),  // 24h "HH:mm"
  close: z.string(), // 24h "HH:mm"; close < open means the period crosses midnight
})
export type HoursPeriod = z.infer<typeof hoursPeriodSchema>

export const dayHoursSchema = z.object({
  day_of_week: dayOfWeekSchema,
  closed: z.boolean(),
  open_24h: z.boolean(),
  periods: z.array(hoursPeriodSchema),
})
export type DayHours = z.infer<typeof dayHoursSchema>

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export function formatDayHours(day: DayHours): string {
  if (day.closed) return 'Closed'
  if (day.open_24h) return 'Open 24 hours'
  return day.periods.map((p) => `${formatTime(p.open)} – ${formatTime(p.close)}`).join(', ')
}

const dayLabels: Record<DayOfWeek, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}
export function dayLabel(day: DayOfWeek): string {
  return dayLabels[day]
}
