import { MembershipTierName } from "../models/Customer.js";
import { DiscountStrategy } from "../interfaces/DiscountStrategy.js";
import { RegularDiscount } from "./RegularDiscount.js";
import { GoldDiscount } from "./GoldDiscount.js";
import { VIPDiscount } from "./VIPDiscount.js";

export class DiscountFactory {
  static create(tier: MembershipTierName): DiscountStrategy {
    switch (tier) {
      case "REGULAR":
        return new RegularDiscount();
      case "GOLD":
        return new GoldDiscount();
      case "VIP":
        return new VIPDiscount();
    }
  }

  static getAvailableTiers(): string[] {
    return ["REGULAR", "GOLD", "VIP"];
  }
}
