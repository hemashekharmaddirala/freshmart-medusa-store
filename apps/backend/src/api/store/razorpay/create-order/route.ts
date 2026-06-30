import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { IPaymentModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

import {
  createRazorpayOrder,
  getRazorpayKeyId,
  toRazorpayAmountPaise,
  validateRazorpayAmountPaise,
} from "../../../../lib/razorpay"

type CreateOrderBody = {
  amount?: number
  currency?: string
  receipt?: string
  payment_session_id?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as CreateOrderBody
  const { amount, currency, receipt, payment_session_id } = body

  let amountPaise = amount
  let orderCurrency = currency?.toUpperCase()
  let orderReceipt = receipt

  if (payment_session_id) {
    const paymentModule = req.scope.resolve<IPaymentModuleService>(
      Modules.PAYMENT
    )

    const paymentSession = await paymentModule.retrievePaymentSession(
      payment_session_id
    )

    amountPaise = toRazorpayAmountPaise(
      Number(paymentSession.amount),
      paymentSession.currency_code
    )
    orderCurrency = paymentSession.currency_code.toUpperCase()
    orderReceipt = orderReceipt ?? paymentSession.id
  }

  if (amountPaise === undefined || !orderCurrency) {
    return res.status(400).json({
      success: false,
      message: "Provide amount and currency, or payment_session_id.",
    })
  }

  try {
    validateRazorpayAmountPaise(amountPaise)
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Invalid amount.",
    })
  }

  try {
    const order = await createRazorpayOrder({
      amount: amountPaise,
      currency: orderCurrency,
      receipt: orderReceipt,
      notes: payment_session_id
        ? { medusa_payment_session_id: payment_session_id }
        : undefined,
    })

    if (payment_session_id) {
      const paymentModule = req.scope.resolve<IPaymentModuleService>(
        Modules.PAYMENT
      )

      const paymentSession = await paymentModule.retrievePaymentSession(
        payment_session_id
      )

      await paymentModule.updatePaymentSession({
        id: paymentSession.id,
        amount: paymentSession.amount,
        currency_code: paymentSession.currency_code,
        data: {
          ...paymentSession.data,
          razorpay_order_id: order.id,
          razorpay_amount: order.amount,
          razorpay_currency: order.currency,
          razorpay_order_status: order.status,
          key_id: getRazorpayKeyId(),
        },
      })
    }

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: getRazorpayKeyId(),
    })
  } catch (error) {
    const statusCode =
      (error as Error & { statusCode?: number }).statusCode ?? 500
    const message =
      error instanceof Error ? error.message : "Failed to create Razorpay order."

    return res.status(statusCode).json({
      success: false,
      message,
    })
  }
}
