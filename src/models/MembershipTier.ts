import { MembershipTierName } from "./Customer.js";

/**
 * Abstract class — metadata tiap tier membership.
 * Berisi data ambang batas & urutan tier, BUKAN kalkulasi diskon
 * (kalkulasi diskon ada di DiscountStrategy, layer Strategy — Tahap 3).
 */
export abstract class MembershipTier {
  abstract get tierName(): MembershipTierName;
  abstract get minSpending(): number;
  abstract get nextTier(): MembershipTier | null;
}

export class RegularTier extends MembershipTier {
  get tierName(): MembershipTierName {
    return "REGULAR";
  }
  get minSpending(): number {
    return 0;
  }
  get nextTier(): MembershipTier | null {
    return new GoldTier();
  }
}

export class GoldTier extends MembershipTier {
  get tierName(): MembershipTierName {
    return "GOLD";
  }
  get minSpending(): number {
    return 1_000_000;
  }
  get nextTier(): MembershipTier | null {
    return new VIPTier();
  }
}

export class VIPTier extends MembershipTier {
  get tierName(): MembershipTierName {
    return "VIP";
  }
  get minSpending(): number {
    return 5_000_000;
  }
  get nextTier(): MembershipTier | null {
    return null; // tier tertinggi
  }
}
