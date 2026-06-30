import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  AbstractPaymentProvider,
  PaymentActions,
  PaymentSessionStatus,
} from "@medusajs/framework/utils"

import {
  createRazorpayOrder,
  toRazorpayAmountPaise,
} from "../../../lib/razorpay"
import {
  RazorpayPayment,
  RazorpayPaymentOptions,
} from "../types"

const RAZORPAY_API_URL = "https://api.razorpay.com/v1"

class RazorpayProviderService extends AbstractPaymentProvider<RazorpayPaymentOptions> {
  static identifier = "razorpay"

  protected readonly options_: RazorpayPaymentOptions

  static validateOptions(options: RazorpayPaymentOptions) {
    if (!options.key_id) {
      throw new Error("Required option `key_id` is missing in Razorpay provider")
    }

    if (!options.key_secret) {
      throw new Error(
        "Required option `key_secret` is missing in Razorpay provider"
      )
    }
  }

  constructor(_: Record<string, unknown>, options: RazorpayPaymentOptions) {
    // @ts-expect-error Medusa provider base constructor accepts variadic args.
    super(...arguments)
    this.options_ = options
  }

  async initiatePayment({
    amount,
    currency_code,
    data,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const currency = currency_code.toUpperCase()
    const razorpayAmount = toRazorpayAmountPaise(Number(amount), currency)
    const order = await createRazorpayOrder({
      amount: razorpayAmount,
      currency,
      receipt: data?.session_id as string | undefined,
      notes: {
        medusa_payment_session_id: String(data?.session_id ?? ""),
      },
    })

    return {
      id: order.id,
      status: PaymentSessionStatus.PENDING,
      data: {
        ...data,
        razorpay_order_id: order.id,
        razorpay_amount: order.amount,
        razorpay_currency: order.currency,
        razorpay_order_status: order.status,
        key_id: this.options_.key_id,
      },
    }
  }

  async updatePayment({
    data,
  }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      status: data?.razorpay_verified
        ? PaymentSessionStatus.CAPTURED
        : PaymentSessionStatus.PENDING,
      data,
    }
  }

  async authorizePayment({
    data,
  }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const paymentId = data?.razorpay_payment_id as string | undefined

    if (!data?.razorpay_verified || !paymentId) {
      return {
        status: PaymentSessionStatus.PENDING,
        data,
      }
    }

    let payment = await this.request<RazorpayPayment>(`/payments/${paymentId}`)

    if (
      payment.status === "authorized" &&
      this.options_.auto_capture !== false
    ) {
      payment = await this.request<RazorpayPayment>(
        `/payments/${paymentId}/capture`,
        {
          method: "POST",
          body: {
            amount: payment.amount,
            currency: payment.currency,
          },
        }
      )
    }

    const status =
      payment.status === "captured"
        ? PaymentSessionStatus.CAPTURED
        : payment.status === "authorized"
          ? PaymentSessionStatus.AUTHORIZED
          : PaymentSessionStatus.PENDING

    return {
      status,
      data: {
        ...data,
        razorpay_payment_status: payment.status,
        razorpay_payment_method: payment.method,
        razorpay_payment: payment as unknown as Record<string, unknown>,
      },
    }
  }

  async getPaymentStatus({
    data,
  }: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const paymentId = data?.razorpay_payment_id as string | undefined

    if (!paymentId) {
      return {
        status: PaymentSessionStatus.PENDING,
        data,
      }
    }

    const payment = await this.request<RazorpayPayment>(`/payments/${paymentId}`)

    if (payment.status === "captured") {
      return { status: PaymentSessionStatus.CAPTURED, data: payment as any }
    }

    if (payment.status === "authorized") {
      return { status: PaymentSessionStatus.AUTHORIZED, data: payment as any }
    }

    if (payment.status === "failed") {
      return { status: PaymentSessionStatus.ERROR, data: payment as any }
    }

    return { status: PaymentSessionStatus.PENDING, data: payment as any }
  }

  async capturePayment({
    data,
  }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const paymentId = data?.razorpay_payment_id as string | undefined

    if (!paymentId) {
      return { data }
    }

    const existing = await this.request<RazorpayPayment>(
      `/payments/${paymentId}`
    )

    if (existing.status === "captured") {
      return { data: existing as any }
    }

    const payment = await this.request<RazorpayPayment>(
      `/payments/${paymentId}/capture`,
      {
        method: "POST",
        body: {
          amount: existing.amount,
          currency: existing.currency,
        },
      }
    )

    return { data: payment as any }
  }

  async retrievePayment({
    data,
  }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const paymentId = data?.razorpay_payment_id as string | undefined

    if (!paymentId) {
      return { data }
    }

    const payment = await this.request<RazorpayPayment>(`/payments/${paymentId}`)

    return { data: payment as any }
  }

  async refundPayment({
    amount,
    data,
  }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const paymentId = data?.razorpay_payment_id as string | undefined

    if (!paymentId) {
      throw new Error("Missing Razorpay payment id while refunding payment")
    }

    const payment = await this.request<RazorpayPayment>(`/payments/${paymentId}`)

    const refund = await this.request<Record<string, unknown>>(
      `/payments/${paymentId}/refund`,
      {
        method: "POST",
        body: {
          amount: toRazorpayAmountPaise(Number(amount), payment.currency),
        },
      }
    )

    return { data: { ...data, razorpay_refund: refund } }
  }

  async cancelPayment({
    data,
  }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return this.cancelPayment(input)
  }

  async getWebhookActionAndData(
    _data: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }

  protected async request<T>(
    path: string,
    options: {
      method?: "GET" | "POST"
      body?: Record<string, unknown>
    } = {}
  ): Promise<T> {
    const auth = Buffer.from(
      `${this.options_.key_id}:${this.options_.key_secret}`
    ).toString("base64")

    const response = await fetch(`${RAZORPAY_API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const payload = (await response.json().catch(() => ({}))) as {
      error?: { description?: string }
    }

    if (!response.ok) {
      throw new Error(
        payload.error?.description ||
          `Razorpay request failed with status ${response.status}`
      )
    }

    return payload as T
  }
}

export default RazorpayProviderService
