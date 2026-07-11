import { BaseModel } from "./BaseModel.js";

export type MembershipTierName = "REGULAR" | "GOLD" | "VIP";

export class Customer extends BaseModel {
  private _name: string;
  private _phone: string;
  private _email: string | null;
  private _tier: MembershipTierName;
  private _points: number;
  private _totalSpending: number;
  private _isActive: boolean = true;

  constructor(
    id: number,
    name: string,
    phone: string,
    email: string | null = null,
    tier: MembershipTierName = "REGULAR",
    points: number = 0,
    totalSpending: number = 0,
  ) {
    super(id);

    if (!name || name.trim().length < 3) {
      throw new Error("Nama pelanggan minimal 3 karakter");
    }
    if (!phone || !/^\d{10,13}$/.test(phone)) {
      throw new Error("Nomor HP harus berupa angka 10-13 digit");
    }
    if (email && !email.includes("@")) {
      throw new Error("Format email tidak valid");
    }
    if (points < 0) {
      throw new Error("Poin tidak boleh negatif");
    }
    if (totalSpending < 0) {
      throw new Error("Total belanja tidak boleh negatif");
    }

    this._name = name.trim();
    this._phone = phone.trim();
    this._email = email ? email.trim() : null;
    this._tier = tier;
    this._points = points;
    this._totalSpending = totalSpending;
  }

  // Getter
  get name(): string {
    return this._name;
  }
  get phone(): string {
    return this._phone;
  }
  get email(): string | null {
    return this._email;
  }
  get tier(): MembershipTierName {
    return this._tier;
  }
  get points(): number {
    return this._points;
  }
  get totalSpending(): number {
    return this._totalSpending;
  }
  get isActive(): boolean {
    return this._isActive;
  }

  get formattedTotalSpending(): string {
    return `Rp ${this._totalSpending.toLocaleString("id-ID")}`;
  }

  // Setter — hanya untuk field yang memang bisa diedit bebas lewat form CRUD
  set name(value: string) {
    if (!value || value.trim().length < 3) {
      throw new Error("Nama pelanggan minimal 3 karakter");
    }
    this._name = value.trim();
  }

  set email(value: string | null) {
    if (value && !value.includes("@")) {
      throw new Error("Format email tidak valid");
    }
    this._email = value ? value.trim() : null;
  }

  // Invariant-level methods (bukan business rule "kapan"/"berapa" — itu di LoyaltyService)
  /**
   * Menambah poin. Validasi murni: poin tambahan tidak boleh negatif.
   */
  addPoints(amount: number): void {
    if (amount < 0)
      throw new Error("Poin yang ditambahkan tidak boleh negatif");
    this._points += amount;
  }

  /**
   * Mengurangi poin (redeem). Validasi murni: tidak boleh melebihi saldo poin.
   */
  deductPoints(amount: number): void {
    if (amount < 0) throw new Error("Poin yang dikurangi tidak boleh negatif");
    if (amount > this._points) {
      throw new Error(
        `Poin tidak cukup: diminta ${amount}, tersedia ${this._points}`,
      );
    }
    this._points -= amount;
  }

  /**
   * Menambah total belanja. Validasi murni: nilai tidak boleh negatif.
   */
  addSpending(amount: number): void {
    if (amount < 0) throw new Error("Nilai belanja tidak boleh negatif");
    this._totalSpending += amount;
  }

  /**
   * Mengganti tier. Validasi murni: tier tidak boleh turun (invariant entity).
   * Keputusan KAPAN naik tier & KE tier mana tetap ditentukan LoyaltyService.
   */
  upgradeTier(newTier: MembershipTierName): void {
    const order: MembershipTierName[] = ["REGULAR", "GOLD", "VIP"];
    if (order.indexOf(newTier) < order.indexOf(this._tier)) {
      throw new Error(
        `Tier tidak bisa diturunkan dari ${this._tier} ke ${newTier}`,
      );
    }
    this._tier = newTier;
  }

  /**
   * Deactivate customer (soft delete)
   */
  deactivate(): void {
    this._isActive = false;
  }

  override toString(): string {
    return (
      `[Customer#${this._id}] ${this._name} (${this._phone}) | ` +
      `Tier: ${this._tier} | Poin: ${this._points} | ${this.formattedTotalSpending}`
    );
  }
}
