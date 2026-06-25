import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="bg-[#fbfcf8] py-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div>
            <div className="mb-8">
              <p className="text-small-semi uppercase text-[#5d7f2f]">
                FreshMart basket
              </p>
              <h1 className="mt-2 text-3xl-semi text-[#18310f]">Your cart</h1>
            </div>
            <div className="grid grid-cols-1 gap-8 small:grid-cols-[1fr_380px]">
              <div className="flex flex-col gap-y-6 rounded-rounded border border-[#dce8d5] bg-white p-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative">
              <div className="sticky top-24 flex flex-col gap-y-8">
                {cart && cart.region && (
                  <>
                    <div className="rounded-rounded border border-[#dce8d5] bg-white p-6">
                      <Summary cart={cart} />
                    </div>
                  </>
                )}
              </div>
            </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
