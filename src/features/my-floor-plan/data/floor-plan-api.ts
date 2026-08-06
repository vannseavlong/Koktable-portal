import { sleep } from '@/lib/utils'
import {
  type Floor,
  type Room,
  type RestaurantTable,
  type TableShape,
} from './schema'

// MOCK — Backend has no `/merchant/floors|rooms|tables` routes yet: `floors.ts` /
// `rooms.ts` / `tables.ts` are schema-only (see Portal/TODO.md item 1). This fakes the
// eventual API against an in-memory store (reset on reload) so the Portal UI can be
// built and reviewed ahead of the backend. Function names/shapes match what the real
// `apiClient`-backed module should look like — swapping this out later should only mean
// rewriting these bodies, not touching the components that call them.
//
// Scoped implicitly to the caller's own restaurant/location, same convention as
// `my-catalog`/`my-restaurant` — no restaurant_id/location_id parameter, ever.

const MOCK_RESTAURANT_ID = 'rst_mock_0001'
const MOCK_LOCATION_ID = 'loc_mock_0001'
const LATENCY_MS = 350

let nextSeq = 100
function makeId(prefix: string) {
  return `${prefix}_${String(nextSeq++).padStart(4, '0')}`
}

let floors: Floor[] = [
  {
    floor_id: 'flr_0001',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    name: 'Ground Floor',
    sort_order: 0,
    active: true,
  },
  {
    floor_id: 'flr_0002',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    name: 'Rooftop',
    sort_order: 1,
    active: true,
  },
]

let rooms: Room[] = [
  {
    room_id: 'rm_0001',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    floor_id: 'flr_0001',
    name: 'Main Hall',
    sort_order: 0,
    active: true,
  },
  {
    room_id: 'rm_0002',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    floor_id: 'flr_0001',
    name: 'Private Room A',
    sort_order: 1,
    active: true,
  },
  {
    room_id: 'rm_0003',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    floor_id: 'flr_0002',
    name: 'Patio',
    sort_order: 0,
    active: true,
  },
]

let tables: RestaurantTable[] = [
  {
    table_id: 'tbl_0001',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    room_id: 'rm_0001',
    label: 'T1',
    seats: 2,
    shape: 'round',
    sort_order: 0,
    active: true,
  },
  {
    table_id: 'tbl_0002',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    room_id: 'rm_0001',
    label: 'T2',
    seats: 4,
    shape: 'square',
    sort_order: 1,
    active: true,
  },
  {
    table_id: 'tbl_0003',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    room_id: 'rm_0001',
    label: 'T3',
    seats: 6,
    shape: 'rectangle',
    sort_order: 2,
    active: true,
  },
  {
    table_id: 'tbl_0004',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    room_id: 'rm_0002',
    label: 'P1',
    seats: 8,
    shape: 'rectangle',
    sort_order: 0,
    active: true,
  },
  {
    table_id: 'tbl_0005',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    room_id: 'rm_0003',
    label: 'R1',
    seats: 2,
    shape: 'round',
    sort_order: 0,
    active: true,
  },
  {
    table_id: 'tbl_0006',
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    room_id: 'rm_0003',
    label: 'R2',
    seats: 2,
    shape: 'round',
    sort_order: 1,
    active: true,
  },
]

function byId<T extends { [key: string]: unknown }>(
  list: T[],
  idKey: string,
  id: string
) {
  return list.find((row) => row[idKey] === id)
}

// ---- Floors ----

export type FloorPayload = {
  name: string
  sort_order?: number
  active?: boolean
}

export async function fetchFloors() {
  await sleep(LATENCY_MS)
  return { floors: [...floors].sort((a, b) => a.sort_order - b.sort_order) }
}

export async function createFloor(payload: FloorPayload) {
  await sleep(LATENCY_MS)
  const floor: Floor = {
    floor_id: makeId('flr'),
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    name: payload.name,
    sort_order: payload.sort_order ?? floors.length,
    active: payload.active ?? true,
  }
  floors = [...floors, floor]
  return { floor }
}

export async function updateFloor(
  floorId: string,
  payload: Partial<FloorPayload>
) {
  await sleep(LATENCY_MS)
  if (!byId(floors, 'floor_id', floorId))
    throw new Error(`Floor ${floorId} not found`)
  let updated!: Floor
  floors = floors.map((f) => {
    if (f.floor_id !== floorId) return f
    updated = { ...f, ...payload }
    return updated
  })
  return { floor: updated }
}

// ---- Rooms ----

export type RoomPayload = {
  floor_id: string
  name: string
  sort_order?: number
  active?: boolean
}

export async function fetchRooms(floorId: string) {
  await sleep(LATENCY_MS)
  const filtered = rooms.filter((r) => r.floor_id === floorId)
  return { rooms: filtered.sort((a, b) => a.sort_order - b.sort_order) }
}

export async function createRoom(payload: RoomPayload) {
  await sleep(LATENCY_MS)
  const roomsOnFloor = rooms.filter((r) => r.floor_id === payload.floor_id)
  const room: Room = {
    room_id: makeId('rm'),
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    floor_id: payload.floor_id,
    name: payload.name,
    sort_order: payload.sort_order ?? roomsOnFloor.length,
    active: payload.active ?? true,
  }
  rooms = [...rooms, room]
  return { room }
}

export async function updateRoom(
  roomId: string,
  payload: Partial<Omit<RoomPayload, 'floor_id'>>
) {
  await sleep(LATENCY_MS)
  if (!byId(rooms, 'room_id', roomId))
    throw new Error(`Room ${roomId} not found`)
  let updated!: Room
  rooms = rooms.map((r) => {
    if (r.room_id !== roomId) return r
    updated = { ...r, ...payload }
    return updated
  })
  return { room: updated }
}

// ---- Tables ----

export type TablePayload = {
  room_id: string
  label: string
  seats: number
  shape: TableShape
  sort_order?: number
  active?: boolean
}

export async function fetchTables(roomId: string) {
  await sleep(LATENCY_MS)
  const filtered = tables.filter((t) => t.room_id === roomId)
  return { tables: filtered.sort((a, b) => a.sort_order - b.sort_order) }
}

export async function createTable(payload: TablePayload) {
  await sleep(LATENCY_MS)
  const tablesInRoom = tables.filter((t) => t.room_id === payload.room_id)
  const table: RestaurantTable = {
    table_id: makeId('tbl'),
    restaurant_id: MOCK_RESTAURANT_ID,
    location_id: MOCK_LOCATION_ID,
    room_id: payload.room_id,
    label: payload.label,
    seats: payload.seats,
    shape: payload.shape,
    sort_order: payload.sort_order ?? tablesInRoom.length,
    active: payload.active ?? true,
  }
  tables = [...tables, table]
  return { table }
}

export async function updateTable(
  tableId: string,
  payload: Partial<Omit<TablePayload, 'room_id'>>
) {
  await sleep(LATENCY_MS)
  if (!byId(tables, 'table_id', tableId))
    throw new Error(`Table ${tableId} not found`)
  let updated!: RestaurantTable
  tables = tables.map((t) => {
    if (t.table_id !== tableId) return t
    updated = { ...t, ...payload }
    return updated
  })
  return { table: updated }
}
