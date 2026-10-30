import { timingSafeEqual } from 'node:crypto'

/**
 * Minimal Flutterwave v3 client: hosted checkout + transaction verification.
 * https://developer.flutterwave.com/v3.0/docs/flutterwave-standard-1
 */
const API = 'https://api.flutterwave.com/v3'

export type FlwTransaction = {
  id: number
  tx_ref: string
  status: string
  amount: number
  currency: string
}

export type PaymentRequest = {
  tx_ref: string
  amount: number
  currency: string
  redirect_url: string
  customer: { email: string; name: string; phonenumber?: string }
  customizations: { title: string; description: string }
  meta?: Record<string, string | number>
}

export type Flutterwave = {
  /** Creates a hosted payment and returns the checkout link. */
  createPayment(request: PaymentRequest): Promise<string>
  verifyTransaction(id: string): Promise<FlwTransaction>
  verifyByReference(txRef: string): Promise<FlwTransaction>
}

export class FlutterwaveError extends Error {}

export function createFlutterwave(secretKey: string, fetchImpl: typeof fetch = fetch): Flutterwave {
  async function call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetchImpl(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    })
    const body = (await res.json().catch(() => null)) as { status?: string; message?: string; data?: T } | null
    if (!res.ok || body?.status !== 'success' || !body.data) {
      throw new FlutterwaveError(body?.message ?? `Flutterwave request failed (${res.status})`)
    }
    return body.data
  }

  return {
    async createPayment(request) {
      const data = await call<{ link: string }>('/payments', { method: 'POST', body: JSON.stringify(request) })
      return data.link
    },
    verifyTransaction: (id) => call<FlwTransaction>(`/transactions/${encodeURIComponent(id)}/verify`),
    verifyByReference: (txRef) =>
      call<FlwTransaction>(`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`),
  }
}

/** Webhooks carry a `verif-hash` header equal to the secret hash set in the Flutterwave dashboard. */
export function isAuthenticWebhook(received: string | null, secretHash: string): boolean {
  if (!received || !secretHash) return false
  const a = Buffer.from(received)
  const b = Buffer.from(secretHash)
  return a.length === b.length && timingSafeEqual(a, b)
}
