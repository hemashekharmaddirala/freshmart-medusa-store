import crypto from "crypto"

import Razorpay from "razorpay"

const MIN_AMOUNT_PAISE = 100

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID

  if (!keyId) {
    throw new Error("RAZORPAY_KEY_ID is not configured")
  }

  return keyId
}

export function getRazorpayKeySecret(): string {
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured")
  }

  return keySecret
}

export function getRazorpayClient(): Razorpay {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret(),
  })
}

export function toRazorpayAmountPaise(
  amount: number,
  currency: string
): number {
  const normalized = currency.toUpperCase()

  if (normalized === "INR") {
    return Math.round(amount * 100)
  }

  return Math.round(amount)
}

export function validateRazorpayAmountPaise(amountPaise: number) {
  if (!Number.isFinite(amountPaise) || amountPaise < MIN_AMOUNT_PAISE) {
    throw new Error(
      `Amount must be at least ${MIN_AMOUNT_PAISE} paise (${MIN_AMOUNT_PAISE / 100} INR).`
    )
  }
}

export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", getRazorpayKeySecret())
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  return expectedSignature === signature
}

export type CreateRazorpayOrderInput = {
  amount: number
  currency: string
  receipt?: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
  validateRazorpayAmountPaise(input.amount)

  const client = getRazorpayClient()

  try {
    const order = await client.orders.create({
      amount: input.amount,
      currency: input.currency.toUpperCase(),
      receipt: input.receipt,
      notes: input.notes,
    })

    return order
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Razorpay order creation failed"

    if (message.toLowerCase().includes("authentication")) {
      const authError = new Error("Razorpay authentication failed")
      ;(authError as Error & { statusCode?: number }).statusCode = 401
      throw authError
    }

    const apiError = new Error(message)
    ;(apiError as Error & { statusCode?: number }).statusCode = 500
    throw apiError
  }
}
