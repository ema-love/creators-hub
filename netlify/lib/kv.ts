import { randomUUID } from 'node:crypto'
import { getStore } from '@netlify/blobs'

/**
 * JSON key-value store. Concurrency safety rests on one primitive only:
 * `create`, which writes a key only if it does not exist yet (Netlify Blobs
 * `onlyIfNew`). The first writer wins; everyone else gets `false`.
 */
export type Kv = {
  get<T>(key: string): Promise<T | null>
  /** Writes only if the key does not exist yet. Returns false if it did. */
  create<T>(key: string, value: T): Promise<boolean>
  put<T>(key: string, value: T): Promise<void>
}

/**
 * Claims a key for one caller only: create-if-new, then read back after a
 * short settle and check our own owner ID is the one stored. This holds even
 * if the store's create-if-new were not perfectly atomic under load.
 */
export async function claim<T extends object>(kv: Kv, key: string, value: T, settleMs = SETTLE_MS): Promise<boolean> {
  const owner = randomUUID()
  if (!(await kv.create(key, { ...value, owner }))) return false
  if (settleMs > 0) await new Promise((r) => setTimeout(r, settleMs))
  return (await kv.get<{ owner?: string }>(key))?.owner === owner
}

const SETTLE_MS = Number(process.env.KV_CLAIM_SETTLE_MS ?? 120)

export function blobKv(name: string): Kv {
  const store = getStore({ name, consistency: 'strong' })
  return {
    get: async <T>(key: string) => ((await store.get(key, { type: 'json' })) as T | null) ?? null,
    create: async (key, value) => (await store.setJSON(key, value, { onlyIfNew: true })).modified,
    put: async (key, value) => {
      await store.setJSON(key, value)
    },
  }
}

/** In-memory Kv with the same semantics, for tests. */
export function memoryKv(): Kv & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>()
  const tick = () => new Promise((r) => setTimeout(r, 0)) // let concurrent callers interleave
  return {
    data,
    async get<T>(key: string) {
      await tick()
      return data.has(key) ? (structuredClone(data.get(key)) as T) : null
    },
    async create(key, value) {
      await tick()
      if (data.has(key)) return false
      data.set(key, structuredClone(value))
      return true
    },
    async put(key, value) {
      await tick()
      data.set(key, structuredClone(value))
    },
  }
}
