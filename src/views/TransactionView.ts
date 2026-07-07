import { CartItem } from "../controllers/TransactionController.js";
import { Product } from "../models/Product.js";

export class TransactionView {
  private productTableBody: HTMLTableSectionElement;
  private searchInput: HTMLInputElement;
  private cartContainer: HTMLElement;
  private totalItemEl: HTMLElement;
  private totalPriceEl: HTMLElement;
  private processButton: HTMLButtonElement;
  private messageDiv: HTMLElement;

  private onAddToCart: (id: number) => void;
  private onIncreaseQty: (id: number) => void;
  private onDecreaseQty: (id: number) => void;
  private onCheckout: () => void;
  private onSearch: (keyword: string) => void;

  constructor(
    onAddToCart: (id: number) => void,
    onIncreaseQty: (id: number) => void,
    onDecreaseQty: (id: number) => void,
    onCheckout: () => void,
    onSearch: (keyword: string) => void,
  ) {
    this.onAddToCart = onAddToCart;
    this.onIncreaseQty = onIncreaseQty;
    this.onDecreaseQty = onDecreaseQty;
    this.onCheckout = onCheckout;
    this.onSearch = onSearch;

    this.productTableBody = document.querySelector(
      "#transaction-product-table",
    )!;
    this.cartContainer = document.querySelector("#cart-items")!;
    this.searchInput = document.querySelector("#trx-product-search")!;
    this.totalItemEl = document.querySelector("#cart-total-item")!;
    this.totalPriceEl = document.querySelector("#cart-total-price")!;
    this.processButton = document.querySelector("#btn-process-transaction")!;
    this.messageDiv = document.querySelector("#transaction-message")!;

    this.processButton.addEventListener("click", () => {
      this.onCheckout();
    });
    this.searchInput.addEventListener("input", () => {
      this.onSearch(this.searchInput.value);
    });
  }

  /**
   * Render daftar produk.
   */
  renderProducts(products: Product[]): void {
    if (products.length === 0) {
      this.productTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center">
                    Tidak ada produk
                </td>
            </tr>
        `;
      return;
    }

    this.productTableBody.innerHTML = products
      .map(
        (p) => `
        <tr>
            <td><code>${this.escapeHtml(p.sku)}</code></td>
            <td>${this.escapeHtml(p.name)}</td>
            <td>Rp ${p.price.toLocaleString("id-ID")}</td>
            <td>${p.stock}</td>
            <td>
                <button
                    class="btn-add outline"
                    data-id="${p.id}"
                    ${p.stock === 0 ? "disabled" : ""}
                >
                    +
                </button>
            </td>
        </tr>
        `,
      )
      .join("");

    this.bindProductEvents();
  }

  /**
   * Render keranjang.
   */
  renderCart(cart: CartItem[]): void {
    if (cart.length === 0) {
      this.cartContainer.innerHTML = `
            <p style="text-align:center">
                Keranjang kosong
            </p>
        `;

      this.totalItemEl.textContent = "0";
      this.totalPriceEl.textContent = "Rp 0";
      return;
    }

    this.cartContainer.innerHTML = cart
      .map(
        (item) => `
            <article style="margin-bottom:0.75rem">
                <strong>${this.escapeHtml(item.name)}</strong>
                <small>
                    Rp ${item.price.toLocaleString("id-ID")}
                </small>

                <div class="grid">
                    <button
                        class="btn-decrease outline"
                        data-id="${item.productId}">
                        -
                    </button>
                    <span style="text-align:center">
                        ${item.quantity}
                    </span>
                    <button
                        class="btn-increase outline"
                        data-id="${item.productId}"
                        ${item.quantity >= item.stock ? "disabled" : ""}
                    >
                        +
                    </button>
                </div>
            </article>
        `,
      )
      .join("");

    const totalItem = cart.reduce((sum, item) => sum + item.quantity, 0);

    const totalPrice = cart.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    this.totalItemEl.textContent = String(totalItem);
    this.totalPriceEl.textContent = "Rp " + totalPrice.toLocaleString("id-ID");

    this.bindCartEvents();
  }

  /**
   * Success message
   */
  showSuccess(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-green-500, green)";
    this.messageDiv.setAttribute("role", "alert");

    setTimeout(() => {
      this.messageDiv.style.display = "none";
    }, 3000);
  }

  /**
   * Error message
   */
  showError(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-red-500, red)";

    setTimeout(() => {
      this.messageDiv.style.display = "none";
    }, 5000);
  }

  /**
   * Event tombol tambah produk.
   */
  private bindProductEvents(): void {
    this.productTableBody.querySelectorAll(".btn-add").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        this.onAddToCart(id);
      });
    });
  }

  /**
   * Event tombol quantity.
   */
  private bindCartEvents(): void {
    this.cartContainer.querySelectorAll(".btn-increase").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        this.onIncreaseQty(id);
      });
    });

    this.cartContainer.querySelectorAll(".btn-decrease").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        this.onDecreaseQty(id);
      });
    });
  }

  /**
   * Escape HTML untuk mencegah XSS.
   */
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
