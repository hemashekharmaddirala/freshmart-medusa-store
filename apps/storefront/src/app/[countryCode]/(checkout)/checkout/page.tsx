import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout | FreshMart",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="bg-[#fbfcf8]">
      <div className="content-container py-10">
        <div className="mb-8">
          <p className="text-small-semi uppercase text-[#5d7f2f]">
            Secure checkout
          </p>
          <h1 className="mt-2 text-3xl-semi text-[#18310f]">
            Complete your FreshMart order
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-8 small:grid-cols-[1fr_416px]">
          <div className="rounded-rounded border border-[#dce8d5] bg-white p-6">
            <PaymentWrapper cart={cart}>
              <CheckoutForm cart={cart} customer={customer} />
            </PaymentWrapper>
          </div>
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
