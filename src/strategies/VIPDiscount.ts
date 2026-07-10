import { DiscountStrategy } from "../interfaces/DiscountStrategy.js";

/**
 * Diskon untuk tier VIP — 10% dari subtotal, pengali poin 2x.
 */
export class VIPDiscount implements DiscountStrategy {
  readonly tierName = "VIP" as const;

  calculateDiscount(subtotal: number): number {
    if (subtotal <= 0) return 0;
    return subtotal * 0.1;
  }

  pointMultiplier(): number {
    return 2;
  }

  getSummary(): string {
    return `Tier ${this.tierName}: diskon 10%, poin 2x`;
  }
}
