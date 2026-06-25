import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  batchLinkProductsToCollectionWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Default Store",
          supported_currencies: [
            {
              currency_code: "eur",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: [
          {
            country_code: "gb",
            type: "country",
          },
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "se",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 10,
          },
          {
            currency_code: "eur",
            amount: 10,
          },
          {
            region_id: region.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

  const freshMartCategories = [
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

  const freshMartCollections = [
    "Fresh Today",
    "Organic Products",
    "Best Sellers",
    "Weekly Offers",
    "New Arrivals",
  ];

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

  const freshMartProducts = [
    {
      title: "Apple",
      category: "Fruits",
      collection: "Fresh Today",
      price: 3,
      inventory: 500,
      description: "Crisp apples selected for everyday freshness.",
    },
    {
      title: "Banana",
      category: "Fruits",
      collection: "Best Sellers",
      price: 2,
      inventory: 600,
      description: "Naturally sweet bananas for breakfast and snacking.",
    },
    {
      title: "Mango",
      category: "Fruits",
      collection: "Organic Products",
      price: 5,
      inventory: 350,
      description: "Juicy mangoes with rich seasonal flavor.",
    },
    {
      title: "Orange",
      category: "Fruits",
      collection: "Weekly Offers",
      price: 4,
      inventory: 450,
      description: "Bright oranges packed with refreshing citrus taste.",
    },
    {
      title: "Tomato",
      category: "Vegetables",
      collection: "Fresh Today",
      price: 3,
      inventory: 500,
      description: "Fresh tomatoes for salads, sauces, and daily cooking.",
    },
    {
      title: "Potato",
      category: "Vegetables",
      collection: "Best Sellers",
      price: 2,
      inventory: 700,
      description: "Kitchen-staple potatoes for versatile meals.",
    },
    {
      title: "Onion",
      category: "Vegetables",
      collection: "Weekly Offers",
      price: 2,
      inventory: 650,
      description: "Essential onions for flavorful home cooking.",
    },
    {
      title: "Carrot",
      category: "Vegetables",
      collection: "Organic Products",
      price: 3,
      inventory: 420,
      description: "Crunchy carrots for cooking, juicing, and snacking.",
    },
    {
      title: "Milk",
      category: "Dairy",
      collection: "Fresh Today",
      price: 4,
      inventory: 400,
      description: "Fresh milk for the daily fridge.",
    },
    {
      title: "Butter",
      category: "Dairy",
      collection: "Best Sellers",
      price: 5,
      inventory: 300,
      description: "Creamy butter for baking, toast, and cooking.",
    },
    {
      title: "Cheese",
      category: "Dairy",
      collection: "New Arrivals",
      price: 6,
      inventory: 260,
      description: "Rich cheese for sandwiches, snacks, and recipes.",
    },
    {
      title: "Yogurt",
      category: "Dairy",
      collection: "Organic Products",
      price: 4,
      inventory: 320,
      description: "Smooth yogurt for breakfast bowls and quick snacks.",
    },
    {
      title: "Bread",
      category: "Bakery",
      collection: "Fresh Today",
      price: 3,
      inventory: 280,
      description: "Soft bakery bread for fresh sandwiches and toast.",
    },
    {
      title: "Cake",
      category: "Bakery",
      collection: "New Arrivals",
      price: 12,
      inventory: 120,
      description: "Fresh cake for celebrations and weekend treats.",
    },
    {
      title: "Orange Juice",
      category: "Beverages",
      collection: "Weekly Offers",
      price: 5,
      inventory: 240,
      description: "Refreshing orange juice for any time of day.",
    },
    {
      title: "Tea",
      category: "Beverages",
      collection: "Best Sellers",
      price: 4,
      inventory: 360,
      description: "Everyday tea for a comforting cup.",
    },
    {
      title: "Basmati Rice",
      category: "Rice & Grains",
      collection: "Best Sellers",
      price: 9,
      inventory: 300,
      description: "Aromatic basmati rice for daily meals and special dishes.",
    },
    {
      title: "Sunflower Oil",
      category: "Cooking Oil",
      collection: "Weekly Offers",
      price: 8,
      inventory: 220,
      description: "Light sunflower oil for everyday cooking.",
    },
    {
      title: "Biscuits",
      category: "Snacks",
      collection: "New Arrivals",
      price: 3,
      inventory: 420,
      description: "Crisp biscuits for tea time and quick bites.",
    },
    {
      title: "Chips",
      category: "Snacks",
      collection: "Weekly Offers",
      price: 3,
      inventory: 380,
      description: "Crunchy chips for snacking and sharing.",
    },
    {
      title: "Dishwashing Liquid",
      category: "Household Essentials",
      collection: "New Arrivals",
      price: 5,
      inventory: 180,
      description: "Effective dishwashing liquid for everyday cleanup.",
    },
    {
      title: "Shampoo",
      category: "Personal Care",
      collection: "Organic Products",
      price: 7,
      inventory: 160,
      description: "Gentle shampoo for daily personal care.",
    },
  ];

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: freshMartCategories.map((name) => ({
        name,
        handle: handleize(name),
        is_active: true,
      })),
    },
  });

  const { result: collectionResult } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: freshMartCollections.map((title) => ({
        title,
        handle: handleize(title),
      })),
    },
  });

  const categoryByName = new Map(categoryResult.map((cat) => [cat.name, cat]));
  const collectionByTitle = new Map(
    collectionResult.map((collection) => [collection.title, collection])
  );
  const { result: productResult } = await createProductsWorkflow(container).run({
    input: {
      products: freshMartProducts.map((product) => ({
        title: product.title,
        category_ids: [categoryByName.get(product.category)!.id],
        description: product.description,
        handle: handleize(product.title),
        weight: 500,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile.id,
        images: [
          {
            url: getProductImageUrl(product.title),
          },
        ],
        options: [
          {
            title: "Pack",
            values: ["Standard"],
          },
        ],
        variants: [
          {
            title: "Standard",
            sku: `FM-${handleize(product.title).toUpperCase()}`,
            options: {
              Pack: "Standard",
            },
            manage_inventory: true,
            prices: [
              {
                amount: product.price,
                currency_code: "eur",
              },
              {
                amount: product.price + 1,
                currency_code: "usd",
              },
            ],
          },
        ],
        sales_channels: [
          {
            id: defaultSalesChannel.id,
          },
        ],
        metadata: {
          freshmart_seed: true,
          initial_stock: product.inventory,
        },
      })),
    },
  });

  const productByTitle = new Map(
    productResult.map((product) => [product.title, product])
  );

  for (const collection of freshMartCollections) {
    const productIds = freshMartProducts
      .filter((product) => product.collection === collection)
      .map((product) => productByTitle.get(product.title)!.id);

    await batchLinkProductsToCollectionWorkflow(container).run({
      input: {
        id: collectionByTitle.get(collection)!.id,
        add: productIds,
      },
    });
  }
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
