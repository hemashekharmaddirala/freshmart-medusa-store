import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  batchLinkProductsToCollectionWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  deleteCollectionsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
} from "@medusajs/medusa/core-flows";

const categoryNames = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
  "Rice & Grains",
  "Cooking Oil",
  "Household Essentials",
  "Personal Care",
];

const collectionTitles = [
  "Fresh Today",
  "Organic Products",
  "Best Sellers",
  "Weekly Offers",
  "New Arrivals",
];

const products = [
  ["Apple", "Fruits", "Fresh Today", 3, 500],
  ["Banana", "Fruits", "Best Sellers", 2, 600],
  ["Mango", "Fruits", "Organic Products", 5, 350],
  ["Orange", "Fruits", "Weekly Offers", 4, 450],
  ["Tomato", "Vegetables", "Fresh Today", 3, 500],
  ["Potato", "Vegetables", "Best Sellers", 2, 700],
  ["Onion", "Vegetables", "Weekly Offers", 2, 650],
  ["Carrot", "Vegetables", "Organic Products", 3, 420],
  ["Milk", "Dairy", "Fresh Today", 4, 400],
  ["Butter", "Dairy", "Best Sellers", 5, 300],
  ["Cheese", "Dairy", "New Arrivals", 6, 260],
  ["Yogurt", "Dairy", "Organic Products", 4, 320],
  ["Bread", "Bakery", "Fresh Today", 3, 280],
  ["Cake", "Bakery", "New Arrivals", 12, 120],
  ["Orange Juice", "Beverages", "Weekly Offers", 5, 240],
  ["Tea", "Beverages", "Best Sellers", 4, 360],
  ["Basmati Rice", "Rice & Grains", "Best Sellers", 9, 300],
  ["Sunflower Oil", "Cooking Oil", "Weekly Offers", 8, 220],
  ["Biscuits", "Snacks", "New Arrivals", 3, 420],
  ["Chips", "Snacks", "Weekly Offers", 3, 380],
  ["Dishwashing Liquid", "Household Essentials", "New Arrivals", 5, 180],
  ["Shampoo", "Personal Care", "Organic Products", 7, 160],
] as const;

const demoCategoryNames = ["Shirts", "Sweatshirts", "Pants", "Merch"];

const handleize = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const groceryImageByTitle: Record<string, string> = {
  apple: "apple.png",
  banana: "banana.png",
  mango: "mango.png",
  orange: "orange.png",
  tomato: "tomato.png",
  potato: "potato.png",
  onion: "onion.png",
  carrot: "carrot.png",
  milk: "milk.png",
  butter: "butter.png",
  cheese: "cheese.png",
  yogurt: "yogurt.png",
  bread: "bread.png",
  cake: "bread.png",
  "orange juice": "orange.png",
  tea: "tea.png",
  "basmati rice": "rice.png",
  "sunflower oil": "sunflower-oil.png",
  biscuits: "biscuits.png",
  chips: "chips.png",
  "dishwashing liquid": "dishwashing-liquid.png",
  shampoo: "shampoo.png",
};

const getProductImageUrl = (title: string) => {
  const imageName = groceryImageByTitle[title.trim().toLowerCase()];
  const imagePath = `/images/grocery/${imageName || "apple.png"}`;
  const baseUrl = process.env.FRESHMART_IMAGE_BASE_URL;

  return baseUrl ? `${baseUrl.replace(/\/$/, "")}${imagePath}` : imagePath;
};

export default async function seedFreshMartCatalog({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });

  if (existingProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: {
        ids: existingProducts.map((product) => product.id),
      },
    });
  }

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
    filters: {
      name: [...demoCategoryNames, ...categoryNames],
    },
  });

  const categoriesToDelete = existingCategories.filter((category) =>
    demoCategoryNames.includes(category.name)
  );

  if (categoriesToDelete.length) {
    await deleteProductCategoriesWorkflow(container).run({
      input: categoriesToDelete.map((category) => category.id),
    });
  }

  const activeCategories = existingCategories.filter((category) =>
    categoryNames.includes(category.name)
  );
  const missingCategories = categoryNames.filter(
    (name) => !activeCategories.some((category) => category.name === name)
  );

  const { result: createdCategories } = missingCategories.length
    ? await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: missingCategories.map((name) => ({
            name,
            handle: handleize(name),
            is_active: true,
          })),
        },
      })
    : { result: [] };

  const categoryByName = new Map(
    [...activeCategories, ...createdCategories].map((category) => [
      category.name,
      category,
    ])
  );

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "title"],
    filters: {
      title: collectionTitles,
    },
  });

  if (existingCollections.length) {
    await deleteCollectionsWorkflow(container).run({
      input: {
        ids: existingCollections.map((collection) => collection.id),
      },
    });
  }

  const { result: createdCollections } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: collectionTitles.map((title) => ({
        title,
        handle: handleize(title),
      })),
    },
  });

  const collectionByTitle = new Map(
    createdCollections.map((collection) => [collection.title, collection])
  );

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  });
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });

  const shippingProfile = shippingProfiles[0];
  const salesChannel = salesChannels[0];
  const stockLocation = stockLocations[0];
  const { result: createdProducts } = await createProductsWorkflow(
    container
  ).run({
    input: {
      products: products.map(([title, category, , price, inventory]) => ({
        title,
        category_ids: [categoryByName.get(category)!.id],
        description: `${title} selected for FreshMart grocery shoppers.`,
        handle: handleize(title),
        weight: 500,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        images: [{ url: getProductImageUrl(title) }],
        options: [{ title: "Pack", values: ["Standard"] }],
        variants: [
          {
            title: "Standard",
            sku: `FM-${handleize(title).toUpperCase()}`,
            options: { Pack: "Standard" },
            manage_inventory: true,
            prices: [
              { amount: price, currency_code: "eur" },
              { amount: price + 1, currency_code: "usd" },
            ],
          },
        ],
        sales_channels: [{ id: salesChannel.id }],
        metadata: {
          freshmart_seed: true,
          initial_stock: inventory,
        },
      })),
    },
  });

  const productByTitle = new Map(
    createdProducts.map((product) => [product.title, product])
  );

  for (const collection of collectionTitles) {
    await batchLinkProductsToCollectionWorkflow(container).run({
      input: {
        id: collectionByTitle.get(collection)!.id,
        add: products
          .filter(([, , productCollection]) => productCollection === collection)
          .map(([title]) => productByTitle.get(title)!.id),
      },
    });
  }

  const { data: variants } = await query.graph({
    entity: "product",
    fields: ["title", "variants.inventory_items.inventory_item_id"],
    filters: {
      id: createdProducts.map((product) => product.id),
    },
  });

  const stockByTitle = new Map<string, number>(
    products.map(([title, , , , inventory]) => [title, inventory])
  );
  const inventoryLevels = variants.flatMap((product) =>
    (product.variants || []).flatMap((variant) =>
      (variant.inventory_items || [])
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => ({
          inventory_item_id: item.inventory_item_id,
          location_id: stockLocation.id,
          stocked_quantity: stockByTitle.get(product.title) || 100,
        }))
    )
  );

  if (inventoryLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
  }

  logger.info(
    `FreshMart catalog ready: ${categoryNames.length} categories, ${collectionTitles.length} collections, ${products.length} products.`
  );
}
