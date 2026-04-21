import { BaseModel } from "./BaseModel";

export class Product extends BaseModel {
  private _sku: string;
  private _name: string;
  private _price: number;
  private _stock: number;
  private _categoryId: number;
  private _description: string;
  private _isActive: boolean = true;

  constructor(
    id: number,
    sku: string,
    name: string,
    price: number,
    stock: number,
    categoryId: number,
    description: string = "",
  ) {
    super(id);

    if (!sku || sku.trim().length === 0)
      throw new Error("SKU tidak boleh kosong");
    const skuRegex = /^[A-Za-z]{2}\d{3}$/;
    if (!skuRegex.test(sku.trim())) {
      throw new Error(
        "Format SKU tidak valid. Contoh yang benar: FD001, BV002",
      );
    }
    if (!name || name.trim().length === 0)
      throw new Error("Nama produk tidak boleh kosong");
    if (price <= 0) throw new Error("Harga harus lebih dari 0");
    if (stock < 0) throw new Error("Stok tidak boleh negatif");
    if (categoryId <= 0) throw new Error("Category ID harus lebih dari 0");

    this._sku = sku.trim().toUpperCase();
    this._name = name.trim();
    this._price = price;
    this._stock = stock;
    this._categoryId = categoryId;
    this._description = description.trim();
  }

  // Getter
  get sku(): string {
    return this._sku;
  }
  get name(): string {
    return this._name;
  }
  get price(): number {
    return this._price;
  }
  get stock(): number {
    return this._stock;
  }
  get categoryId(): number {
    return this._categoryId;
  }
  get description(): string {
    return this._description;
  }
  get isActive(): boolean {
    return this._isActive;
  }

  // Computed property - bukan stored, dihitung dari data lain
  get formattedPrice(): string {
    return `Rp ${this._price.toLocaleString("id-ID")}`;
  }

  get isLowStock(): boolean {
    return this._stock < 5;
  }

  // Setter
  set name(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Nama produk tidak boleh kosong");
    }
    if (value.trim().length > 100) {
      throw new Error("Nama produk maksimal 100 karakter");
    }
    this._name = value.trim();
  }

  set price(value: number) {
    if (value <= 0) throw new Error("Harga harus lebih dari 0");
    this._price = value;
  }

  set description(value: string) {
    this._description = value.trim();
  }

  set categoryId(value: number) {
    if (value <= 0) throw new Error("Category ID harus lebih dari 0");
    this._categoryId = value;
  }

  // Business methods
  /**
   * Mengurangi stok produk
   * Validasi: quantity harus positif dan tidak melebih stok tersedia
   */
  reduceStock(qty: number) {
    if (qty <= 0) throw new Error("Quantity harus positif");
    if (qty > this._stock) {
      throw new Error(
        `Stok tidak cukup: diminta ${qty}, tersedia ${this._stock}`,
      );
    }
    this._stock -= qty;
  }

  /**
   * Menambah stok produk (restock)
   */
  addStock(qty: number) {
    if (qty <= 0) throw new Error("Quantity harus positif");
    this._stock += qty;
  }

  /**
   * Soft delete - set product menjadi tidak aktif.
   */
  deactivate(): void {
    this._isActive = false;
  }

  /**
   * Mengaktifkan kembali produk yang sudah di-deactive.
   */
  activate(): void {
    this._isActive = true;
  }

  /**
   * Representasi string untuk logging/debugging.
   */
  // Override toString dari BaseModel
  override toString(): string {
    const status = this._isActive ? "Active" : "Inactive";
    const stockWarning = this.isLowStock ? " _ LOW STOCK" : "";
    return (
      `[Product#${this._id}] ${this._sku} - ${this._name} | ` +
      `${this.formattedPrice} | ` +
      `Stok: ${this._stock}${stockWarning} | ${status}`
    );
  }
}
