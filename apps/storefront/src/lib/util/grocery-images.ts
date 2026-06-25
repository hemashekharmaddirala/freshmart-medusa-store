export const groceryImages: Record<string, string> = {
  apple: "/images/grocery/apple.png",
  banana: "/images/grocery/banana.png",
  orange: "/images/grocery/orange.png",
  "orange juice": "/images/grocery/orange.png",
  mango: "/images/grocery/mango.png",
  pomegranate: "/images/grocery/pomegranate.png",
  tomato: "/images/grocery/tomato.png",
  potato: "/images/grocery/potato.png",
  onion: "/images/grocery/onion.png",
  carrot: "/images/grocery/carrot.png",
  milk: "/images/grocery/milk.png",
  cheese: "/images/grocery/cheese.png",
  butter: "/images/grocery/butter.png",
  yogurt: "/images/grocery/yogurt.png",
  bread: "/images/grocery/bread.png",
  rice: "/images/grocery/rice.png",
  "basmati rice": "/images/grocery/rice.png",
  "sunflower oil": "/images/grocery/sunflower-oil.png",
  shampoo: "/images/grocery/shampoo.png",
  soap: "/images/grocery/soap.png",
  "dishwashing liquid": "/images/grocery/dishwashing-liquid.png",
  chips: "/images/grocery/chips.png",
  biscuits: "/images/grocery/biscuits.png",
  tea: "/images/grocery/tea.png",
  coffee: "/images/grocery/coffee.png",
}

export const getGroceryImage = (title?: string | null) => {
  if (!title) {
    return undefined
  }

  return groceryImages[title.trim().toLowerCase()]
}
