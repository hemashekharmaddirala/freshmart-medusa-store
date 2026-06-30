import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

import { verifyRazorpayPaymentSignature } from "../../../../lib/razorpay"

type RazorpayVerifyBody = {
  payment_session_id?: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const {
    payment_session_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body as RazorpayVerifyBody

  if (
    !payment_session_id ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing Razorpay verification fields.",
    })
  }

  try {
    const isValid = verifyRazorpayPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature.",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "RAZORPAY_KEY_SECRET is not configured.",
    })
  }

  const paymentModule = req.scope.resolve<IPaymentModuleService>(
    Modules.PAYMENT
  )

  const paymentSession = await paymentModule.retrievePaymentSession(
    payment_session_id
  )

  const updated = await paymentModule.updatePaymentSession({
    id: paymentSession.id,
    amount: paymentSession.amount,
    currency_code: paymentSession.currency_code,
    data: {
      ...paymentSession.data,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_verified: true,
      razorpay_verified_at: new Date().toISOString(),
    },
  })

  res.json({
    success: true,
    payment_session: updated,
  })
}
