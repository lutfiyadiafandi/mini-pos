import { DiscountStrategy } from "../interfaces/DiscountStrategy.js";

/**
 * Diskon untuk tier GOLD — 5% dari subtotal, pengali poin 1.5x.
 */
export class GoldDiscount implements DiscountStrategy {
  readonly tierName = "GOLD" as const;

  calculateDiscount(subtotal: number): number {
    if (subtotal <= 0) return 0;
    return subtotal * 0.05;
  }

  pointMultiplier(): number {
    return 1.5;
  }

  getSummary(): string {
    return `Tier ${this.tierName}: diskon 5%, poin 1.5x`;
  }
}
