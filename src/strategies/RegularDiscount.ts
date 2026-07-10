import { DiscountStrategy } from "../interfaces/DiscountStrategy.js";

/**
 * Diskon untuk tier REGULAR — tidak ada diskon, pengali poin normal (1x).
 */
export class RegularDiscount implements DiscountStrategy {
  readonly tierName = "REGULAR" as const;

  calculateDiscount(subtotal: number): number {
    return 0;
  }

  pointMultiplier(): number {
    return 1;
  }

  getSummary(): string {
    return `Tier ${this.tierName}: tanpa diskon, poin 1x`;
  }
}
