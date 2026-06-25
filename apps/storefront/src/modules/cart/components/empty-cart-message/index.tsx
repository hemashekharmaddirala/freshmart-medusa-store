import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="flex flex-col items-start justify-center rounded-rounded border border-dashed border-[#c8d9bd] bg-white px-8 py-28"
      data-testid="empty-cart-message"
    >
      <Heading
        level="h1"
        className="flex flex-row items-baseline gap-x-2 text-3xl-semi text-[#18310f]"
      >
        Your FreshMart cart is empty
      </Heading>
      <Text className="mb-6 mt-4 max-w-[32rem] text-base-regular text-[#65715f]">
        Fill your basket with fresh produce, pantry staples, organic picks, and
        weekly grocery offers.
      </Text>
      <div>
        <InteractiveLink href="/store">Explore products</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
