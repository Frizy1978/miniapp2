import type { CartItem } from "./cart-context";
import type { ProductDto } from "./types";

export function getDefaultQuantity(unitType: ProductDto["unitType"]) {
  return unitType === "weight" ? 0.5 : 1;
}

export function createCartItem(product: ProductDto, quantity = getDefaultQuantity(product.unitType)): CartItem {
  return {
    imageUrl: product.imageUrl,
    name: product.name,
    price: product.price,
    productId: product.id,
    quantity,
    slug: product.slug,
    unitLabel: product.unitLabel,
    unitType: product.unitType
  };
}
