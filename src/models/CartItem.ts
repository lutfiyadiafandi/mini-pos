import { Product } from "./Product";

export class CartItem {
  private _product: Product;
  private _quantity: number;

  constructor(product: Product, quantity: number) {
    if (!product) throw new Error("Product tidak boleh null");
    if (!product.isActive)
      throw new Error("Produk tidak aktif, tidak bisa ditambah ke cart");
    if (quantity <= 0) throw new Error("Quantity harus positif");
    if (quantity > product.stock) {
      throw new Error(
        `Stok tidak cukup: diminta ${quantity}, tersedia ${product.stock}`,
      );
    }

    this._product = product;
    this._quantity = quantity;
  }

  // Getter
  get product(): Product {
    return this._product;
  }

  get quantity(): number {
    return this._quantity;
  }

  // Computed property — dihitung langsung, tidak disimpan
  get subtotal(): number {
    return this._product.price * this._quantity;
  }

  get formattedSubtotal(): string {
    return `Rp ${this.subtotal.toLocaleString("id-ID")}`;
  }

  // Method updateQuantity dengan validasi
  updateQuantity(newQty: number): void {
    if (newQty <= 0) throw new Error("Quantity harus positif");
    if (newQty > this._product.stock) {
      throw new Error(
        `Stok tidak cukup: diminta ${newQty}, tersedia ${this._product.stock}`,
      );
    }
    this._quantity = newQty;
  }

  toString(): string {
    return (
      `[Product#${this._product.id}] ${this._product.sku} - ${this._product.name} | ` +
      `${this._product.formattedPrice} x ${this._quantity} = ` +
      `${this.formattedSubtotal}`
    );
  }
}
