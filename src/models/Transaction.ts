import { BaseModel } from "./BaseModel.js";
import { Product } from "./Product.js";

export interface TransactionDetail {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}
type PaymentMethod = "CASH" | "QRIS" | "TRANSFER" | "CREDIT_CARD";
type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export class Transaction extends BaseModel {
  private _code: string;
  private _userId: number;
  private _items: TransactionDetail[] = [];
  private _totalAmount: number = 0;
  private _paymentMethod: PaymentMethod;
  private _status: TransactionStatus = "PENDING";
  private _transactionDate: Date;
  private _customerId: number | null;
  private _discountAmount: number;
  private _pointsEarned: number;

  constructor(
    id: number,
    code: string,
    userId: number,
    items: TransactionDetail[],
    totalAmount: number,
    paymentMethod: PaymentMethod,
    status: TransactionStatus = "PENDING",
    transactionDate: Date = new Date(),
    customerId: number | null = null,
    discountAmount: number = 0,
    pointsEarned: number = 0,
  ) {
    super(id);
    this._code = code;
    this._userId = userId;
    this._items = [...items];
    this._totalAmount = totalAmount;
    this._paymentMethod = paymentMethod;
    this._status = status;
    this._transactionDate = transactionDate;
    this._customerId = customerId;
    this._discountAmount = discountAmount;
    this._pointsEarned = pointsEarned;
  }

  // Getter
  get code(): string {
    return this._code;
  }
  get userId(): number {
    return this._userId;
  }
  get items(): TransactionDetail[] {
    return [...this._items];
  }
  get totalAmount(): number {
    return this._totalAmount;
  }
  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }
  get status(): TransactionStatus {
    return this._status;
  }
  get transactionDate(): Date {
    return this._transactionDate;
  }
  get customerId(): number | null {
    return this._customerId;
  }
  get discountAmount(): number {
    return this._discountAmount;
  }
  get pointsEarned(): number {
    return this._pointsEarned;
  }

  get formattedDate(): string {
    return this._transactionDate.toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  get formattedTotal(): string {
    return `Rp ${this._totalAmount.toLocaleString("id-ID")}`;
  }

  // Business Method
  /**
   * Menambahkan item ke transaksi. Jika produk sudah ada di daftar item, maka quantity akan ditambahkan.
   * Setelah menambahkan item, mengurangi stok dan menghitung total amount.
   */
  addItem(product: Product, qty: number): void {
    if (qty <= 0) throw new Error("Quantity harus lebih dari 0");
    if (qty > product.stock)
      throw new Error(
        `Stok tidak cukup: diminta ${qty}, tersedia ${product.stock}`,
      );
    if (!product.isActive)
      throw new Error(`Produk ${product.name} tidak tersedia`);
    if (this._status !== "PENDING")
      throw new Error(
        `Transaksi sudah ${this._status}, tidak bisa ditambahkan item`,
      );

    // Cek apakah produk sudah ada di items — jika ada, update quantity-nya
    const existingIndex = this._items.findIndex(
      (item) => item.productId === product.id,
    );

    if (existingIndex !== -1) {
      const existing = this._items[existingIndex];
      const newQty = existing.quantity + qty;
      if (newQty > product.stock)
        throw new Error(
          `Stok tidak cukup: diminta ${newQty}, tersedia ${product.stock}`,
        );

      // Tambahkan item baru
      this._items[existingIndex] = {
        ...existing,
        quantity: newQty,
        subtotal: newQty * product.price,
      };
    } else {
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
  calculateTotal(): void {
    this._totalAmount = this._items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
  }

  /**
   * Mengubah status transaksi menjadi SUCCESS.
   * Validasi: harus ada minimal 1 item.
   */
  complete(): void {
    if (this._status !== "PENDING") {
      throw new Error(`Transaksi sudah berstatus ${this._status}`);
    }
    if (this._items.length === 0) {
      throw new Error("Tidak bisa menyelesaikan transaksi tanpa item");
    }

    this._status = "SUCCESS";
  }

  override toString(): string {
    const itemLines = this._items
      .map(
        (item) =>
          `  - ${item.productName} x${item.quantity} | Rp ${item.price.toLocaleString("id-ID")} = Rp ${item.subtotal.toLocaleString("id-ID")}`,
      )
      .join("\n");

    const loyaltyLine = this._customerId
      ? `  Member ID : ${this._customerId} | Diskon: Rp ${this._discountAmount.toLocaleString("id-ID")} | Poin: +${this._pointsEarned}\n`
      : "";

    return (
      `[Transaction] ${this._code}\n` +
      `  Tanggal   : ${this.formattedDate}\n` +
      `  Kasir ID  : ${this._userId}\n` +
      `  Status    : ${this._status}\n` +
      `  Pembayaran: ${this._paymentMethod}\n` +
      loyaltyLine +
      `  Items:\n${itemLines}\n` +
      `  Total     : ${this.formattedTotal}`
    );
  }
}
