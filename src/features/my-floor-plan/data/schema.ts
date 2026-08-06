import { z } from 'zod'

// Matches `floors`/`rooms`/`tables` (Backend/schemas/admin/{floors,rooms,tables}.ts) —
// schema-only on the backend today, no services/routes yet (Portal/TODO.md item 1).
// Field shapes here are kept in lockstep with those tables so that swapping
// `floor-plan-api.ts`'s mock bodies for real `apiClient` calls later shouldn't need
// changes here. Always scoped to the caller's own restaurant/location, same as
// `my-catalog`/`my-restaurant` — never sent by the client.

export const tableShapeSchema = z.union([
  z.literal('round'),
  z.literal('square'),
  z.literal('rectangle'),
])
export type TableShape = z.infer<typeof tableShapeSchema>
export const TABLE_SHAPES: TableShape[] = ['round', 'square', 'rectangle']

const _floorSchema = z.object({
  floor_id: z.string(),
  restaurant_id: z.string(),
  location_id: z.string(),
  name: z.string(),
  sort_order: z.number(),
  active: z.boolean(),
})
export type Floor = z.infer<typeof _floorSchema>

const _roomSchema = z.object({
  room_id: z.string(),
  restaurant_id: z.string(),
  location_id: z.string(),
  floor_id: z.string(),
  name: z.string(),
  sort_order: z.number(),
  active: z.boolean(),
})
export type Room = z.infer<typeof _roomSchema>

// Named `RestaurantTable`, not `Table` — `Table` collides with `@/components/ui/table`,
// which every list in this feature also imports.
const _tableSchema = z.object({
  table_id: z.string(),
  restaurant_id: z.string(),
  location_id: z.string(),
  room_id: z.string(),
  label: z.string(),
  seats: z.number(),
  shape: tableShapeSchema,
  // Floor-plan coordinates — unused until a drag-and-drop canvas (v2, see TODO.md)
  // reads/writes them; the mock never sets them.
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  sort_order: z.number(),
  active: z.boolean(),
})
export type RestaurantTable = z.infer<typeof _tableSchema>
