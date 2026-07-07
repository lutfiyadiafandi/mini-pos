import { TransactionView } from "../views/TransactionView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";
import { ReceiptView } from "../views/ReceiptView.js";
import { PaymentModal } from "../views/PaymentModal.js";

export interface CartItem {
  productId: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  quantity: number;
}

export class TransactionController {
  private api: BrowserAPI;
  private view: TransactionView;
  private receiptView: ReceiptView;
  private paymentModal: PaymentModal;

  private cart: CartItem[] = [];
  private currentUserId = 1;
  private products: any[] = [];

  constructor() {
    this.api = new BrowserAPI();
    this.view = new TransactionView(
      (id: number) => this.handleAddToCart(id),
      (id: number) => this.handleIncreaseQuantity(id),
      (id: number) => this.handleDecreaseQuantity(id),
      () => this.handleCheckout(),
      (keyword: string) => this.handleSearch(keyword),
    );
    this.receiptView = new ReceiptView();
    this.paymentModal = new PaymentModal();

    this.initialize();
  }

  private async initialize() {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    const result = await this.api.productGetAll();

    if (result.success && result.data) {
      this.products = result.data.map((p: any) => this.mapProduct(p));

      this.view.renderProducts(this.products);
    }
  }

  private loadCart(): void {
    this.view.renderCart(this.cart);
  }

  private handleSearch(keyword: string): void {
    const filtered = this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword.toLowerCase()) ||
        p.sku.toLowerCase().includes(keyword.toLowerCase()),
    );

    this.view.renderProducts(filtered);
  }

  private handleAddToCart(id: number): void {
    const product = this.products.find((p) => p.id === id);
    if (!product) return;

    const existing = this.cart.find((c) => c.productId === id);
    if (existing) {
      if (existing.quantity < existing.stock) {
        existing.quantity++;
      } else {
        this.view.showError("Stok tidak mencukupi.");
      }
    } else {
      this.cart.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        stock: product.stock,
        quantity: 1,
      });
    }

    this.loadCart();
  }

  private handleIncreaseQuantity(id: number): void {
    const item = this.cart.find((i) => i.productId === id);
    if (!item) return;

    if (item.quantity >= item.stock) {
      this.view.showError("Quantity melebihi stok.");
      return;
    }
    item.quantity++;

    this.loadCart();
  }

  private handleDecreaseQuantity(id: number): void {
    const item = this.cart.find((i) => i.productId === id);
    if (!item) return;

    item.quantity--;

    if (item.quantity <= 0) {
      this.cart = this.cart.filter((i) => i.productId !== id);
    }

    this.loadCart();
  }

  private handleCheckout(): void {
    if (this.cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    const total = this.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    this.paymentModal.show(total, async (strategy) => {
      try {
        const result = await this.api.transactionProcess({
          userId: this.currentUserId,
          cartItems: this.cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          paymentStrategy: strategy,
        });

        if (result.success) {
          const trx = this.mapTransaction(result.data);
          this.receiptView.show(trx);
          this.cart = [];
          this.loadCart();
          await this.loadProducts();
          window.dispatchEvent(new CustomEvent("transaction-completed"));
        } else {
          alert("Transaksi gagal: " + result.error);
        }
      } catch (err) {
        alert("Tidak bisa terhubung ke server.");
        console.error(err);
      }
    });
  }

  refreshCart(): void {
    this.cart = [];
    this.loadCart();
  }

  private mapProduct(product: any) {
    return {
      id: product._id,
      sku: product._sku,
      name: product._name,
      price: product._price,
      stock: product._stock,
      categoryId: product._categoryId,
      description: product._description,
      isLowStock: product._stock < 5,
    };
  }

  private mapTransaction(trx: any) {
    return {
      id: trx._id,
      code: trx._code,
      userId: trx._userId,
      items: trx._items,
      totalAmount: trx._totalAmount,
      paymentMethod: trx._paymentMethod,
      status: trx._status,
      transactionDate: new Date(trx._transactionDate),
    };
  }
}
