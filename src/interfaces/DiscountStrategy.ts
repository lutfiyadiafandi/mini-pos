import { MembershipTierName } from "../models/Customer.js";

/**
 * Kontrak untuk semua strategi diskon membership.
 * Setiap tier harus mengimplementasikan interface ini.
 * Analog dengan PaymentStrategy — service yang memakainya tidak perlu tahu
 * apakah ini RegularDiscount, GoldDiscount, atau VIPDiscount.
 */
export interface DiscountStrategy {
  /**
   * Nama tier (readonly - tidak berubah setelah diinisialisasi)
   */
  readonly tierName: MembershipTierName;

  /**
   * Hitung berapa Rupiah yang dipotong dari subtotal.
   * @param subtotal Jumlah sebelum diskon
   * @returns nominal potongan (bukan subtotal setelah potongan)
   */
  calculateDiscount(subtotal: number): number;

  /**
   * Pengali perolehan poin untuk tier ini.
   */
  pointMultiplier(): number;

  /**
   * Ringkasan informasi terkait strategi diskon tier ini.
   */
  getSummary(): string;
}
