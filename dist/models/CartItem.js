"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartItem = void 0;
class CartItem {
    _product;
    _quantity;
    constructor(product, quantity) {
        if (!product)
            throw new Error("Product tidak boleh null");
        if (!product.isActive)
            throw new Error("Produk tidak aktif, tidak bisa ditambah ke cart");
        if (quantity <= 0)
            throw new Error("Quantity harus positif");
        if (quantity > product.stock) {
            throw new Error(`Stok tidak cukup: diminta ${quantity}, tersedia ${product.stock}`);
        }
        this._product = product;
        this._quantity = quantity;
    }
    // Getter
    get product() {
        return this._product;
    }
    get quantity() {
        return this._quantity;
    }
    // Computed property — dihitung langsung, tidak disimpan
    get subtotal() {
        return this._product.price * this._quantity;
    }
    get formattedSubtotal() {
        return `Rp ${this.subtotal.toLocaleString("id-ID")}`;
    }
    // Method updateQuantity dengan validasi
    updateQuantity(newQty) {
        if (newQty <= 0)
            throw new Error("Quantity harus positif");
        if (newQty > this._product.stock) {
            throw new Error(`Stok tidak cukup: diminta ${newQty}, tersedia ${this._product.stock}`);
        }
        this._quantity = newQty;
    }
    toString() {
        return (`[Product#${this._product.id}] ${this._product.sku} - ${this._product.name} | ` +
            `${this._product.formattedPrice} x ${this._quantity} = ` +
            `${this.formattedSubtotal}`);
    }
}
exports.CartItem = CartItem;
