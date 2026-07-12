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

interface SelectedCustomer {
  id: number;
  name: string;
  tier: string;
  points: number;
}

export class TransactionController {
  private api: BrowserAPI;
  private view: TransactionView;
  private receiptView: ReceiptView;
  private paymentModal: PaymentModal;
  private cart: CartItem[] = [];
  private currentUserId = 1;
  private products: any[] = [];
  private selectedCustomer: SelectedCustomer | null = null;

  constructor() {
    this.api = new BrowserAPI();
    this.view = new TransactionView(
      (id: number) => this.handleAddToCart(id),
      (id: number) => this.handleIncreaseQuantity(id),
      (id: number) => this.handleDecreaseQuantity(id),
      () => this.handleCheckout(),
      (keyword: string) => this.handleSearch(keyword),
      (keyword: string) => this.handleMemberSearch(keyword),
      (id: number) => this.handleSelectMember(id),
      () => this.handleClearMember(),
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

  // ===== Member (BARU) =====

  private async handleMemberSearch(keyword: string): Promise<void> {
    if (!keyword || keyword.trim().length === 0) {
      this.view.renderMemberResults([]);
      return;
    }
    try {
      const result = await this.api.customerGetAll();
      if (result.success && result.data) {
        const filtered = result.data
          .map((c: any) => this.mapCustomer(c))
          .filter(
            (c: any) =>
              c.name.toLowerCase().includes(keyword.toLowerCase()) ||
              c.phone.toLowerCase().includes(keyword.toLowerCase()),
          );
        this.view.renderMemberResults(filtered);
      }
    } catch (err) {
      this.view.showError("Gagal mencari member.");
    }
  }

  private handleSelectMember(id: number): void {
    this.selectMemberById(id);
  }

  private async selectMemberById(id: number): Promise<void> {
    try {
      const result = await this.api.customerGetById(id);
      if (result.success && result.data) {
        const customer = this.mapCustomer(result.data);
        this.selectedCustomer = {
          id: customer.id,
          name: customer.name,
          tier: customer.tier,
          points: customer.points,
        };
        this.view.showSelectedMember(this.selectedCustomer);
      }
    } catch (err) {
      this.view.showError("Gagal memuat data member.");
    }
  }

  private handleClearMember(): void {
    this.selectedCustomer = null;
    this.view.clearSelectedMember();
  }

  // ===== Checkout =====

  private handleCheckout(): void {
    if (this.cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    const total = this.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    this.paymentModal.show(total, async (strategy) => {
      try {
        const redeemPoints = this.selectedCustomer
          ? this.view.getRedeemPoints()
          : 0;

        if (
          this.selectedCustomer &&
          redeemPoints > this.selectedCustomer.points
        ) {
          alert(
            `Poin yang di-redeem melebihi saldo (tersedia: ${this.selectedCustomer.points})`,
          );
          return;
        }

        const payload: Record<string, unknown> = {
          userId: this.currentUserId,
          cartItems: this.cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          paymentStrategy: strategy,
        };

        if (this.selectedCustomer) {
          payload.customerId = this.selectedCustomer.id;
          payload.redeemPoints = redeemPoints;
        }

        const result = await this.api.transactionProcess(payload);

        if (result.success) {
          const trx = this.mapTransaction(result.data);
          this.receiptView.show(trx);
          this.cart = [];
          this.loadCart();
          this.selectedCustomer = null;
          this.view.clearSelectedMember();
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
    this.selectedCustomer = null;
    this.view.clearSelectedMember();
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

  private mapCustomer(customer: any) {
    return {
      id: customer._id,
      name: customer._name,
      phone: customer._phone,
      tier: customer._tier,
      points: customer._points,
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
      customerId: trx._customerId,
      discountAmount: trx._discountAmount,
      pointsEarned: trx._pointsEarned,
    };
  }
}
