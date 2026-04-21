"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const BaseModel_1 = require("./BaseModel");
class Transaction extends BaseModel_1.BaseModel {
    _code;
    _userId;
    _items = [];
    _totalAmount = 0;
    _paymentMethod;
    _status = "PENDING";
    _transactionDate;
    constructor(userId, paymentMethod) {
        super(0);
        if (userId <= 0)
            throw new Error("User ID tidak boleh negatif");
        if (!["CASH", "QRIS", "TRANSFER"].includes(paymentMethod))
            throw new Error("Payment method tidak valid. Pilihan: CASH, QRIS, TRANSFER");
        this._userId = userId;
        this._paymentMethod = paymentMethod;
        this._transactionDate = new Date();
        this._code = `TRX-${this._transactionDate.getTime()}`;
    }
    // Getter
    get code() {
        return this._code;
    }
    get userId() {
        return this._userId;
    }
    get items() {
        return [...this._items];
    }
    get totalAmount() {
        return this._totalAmount;
    }
    get paymentMethod() {
        return this._paymentMethod;
    }
    get status() {
        return this._status;
    }
    get transactionDate() {
        return this._transactionDate;
    }
    get formattedDate() {
        return this._transactionDate.toLocaleString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }
    get formattedTotal() {
        return `Rp ${this._totalAmount.toLocaleString("id-ID")}`;
    }
    // Business Method
    /**
     * Menambahkan item ke transaksi. Jika produk sudah ada di daftar item, maka quantity akan ditambahkan.
     * Setelah menambahkan item, mengurangi stok dan menghitung total amount.
     */
    addItem(product, qty) {
        if (qty <= 0)
            throw new Error("Quantity harus lebih dari 0");
        if (qty > product.stock)
            throw new Error(`Stok tidak cukup: diminta ${qty}, tersedia ${product.stock}`);
        if (!product.isActive)
            throw new Error(`Produk ${product.name} tidak tersedia`);
        if (this._status !== "PENDING")
            throw new Error(`Transaksi sudah ${this._status}, tidak bisa ditambahkan item`);
        // Cek apakah produk sudah ada di items — jika ada, update quantity-nya
        const existingIndex = this._items.findIndex((item) => item.productId === product.id);
        if (existingIndex !== -1) {
            const existing = this._items[existingIndex];
            const newQty = existing.quantity + qty;
            if (newQty > product.stock)
                throw new Error(`Stok tidak cukup: diminta ${newQty}, tersedia ${product.stock}`);
            // Tambahkan item baru
            this._items[existingIndex] = {
                ...existing,
                quantity: newQty,
                subtotal: newQty * product.price,
            };
        }
        else {
            this._items.push({
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: qty,
                subtotal: qty * product.price,
            });
        }
        // Kurangi stok produk
        product.reduceStock(qty);
        // Hitung ulang total
        this.calculateTotal();
    }
    /**
     * Menghitung ulang totalAmount dari semua items.
     */
    calculateTotal() {
        this._totalAmount = this._items.reduce((sum, item) => sum + item.subtotal, 0);
    }
    /**
     * Mengubah status transaksi menjadi SUCCESS.
     * Validasi: harus ada minimal 1 item.
     */
    complete() {
        if (this._status !== "PENDING") {
            throw new Error(`Transaksi sudah berstatus ${this._status}`);
        }
        if (this._items.length === 0) {
            throw new Error("Tidak bisa menyelesaikan transaksi tanpa item");
        }
        this._status = "SUCCESS";
    }
    toString() {
        const itemLines = this._items
            .map((item) => `  - ${item.productName} x${item.quantity} | Rp ${item.price.toLocaleString("id-ID")} = Rp ${item.subtotal.toLocaleString("id-ID")}`)
            .join("\n");
        return (`[Transaction] ${this._code}\n` +
            `  Tanggal   : ${this.formattedDate}\n` +
            `  Kasir ID  : ${this._userId}\n` +
            `  Status    : ${this._status}\n` +
            `  Pembayaran: ${this._paymentMethod}\n` +
            `  Items:\n${itemLines}\n` +
            `  Total     : ${this.formattedTotal}`);
    }
}
exports.Transaction = Transaction;
