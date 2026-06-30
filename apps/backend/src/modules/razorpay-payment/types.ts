export type RazorpayPaymentOptions = {
  key_id: string
  key_secret: string
  webhook_secret?: string
  auto_capture?: boolean
}

export type RazorpayOrder = {
  id: string
  amount: number
  currency: string
  receipt?: string
  status: string
}

export type RazorpayPayment = {
  id: string
  amount: number
  currency: string
  status: "created" | "authorized" | "captured" | "refunded" | "failed"
  order_id?: string
  method?: string
  captured?: boolean
  error_code?: string | null
  error_description?: string | null
}
