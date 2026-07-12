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
  private memberSearchInput: HTMLInputElement;
  private memberSearchResults: HTMLElement;
  private memberSearchArea: HTMLElement;
  private memberSelectedArea: HTMLElement;
  private memberSelectedName: HTMLElement;
  private memberSelectedInfo: HTMLElement;
  private memberRedeemInput: HTMLInputElement;
  private btnClearMember: HTMLButtonElement;

  private onAddToCart: (id: number) => void;
  private onIncreaseQty: (id: number) => void;
  private onDecreaseQty: (id: number) => void;
  private onCheckout: () => void;
  private onSearch: (keyword: string) => void;
  private onMemberSearch: (keyword: string) => void;
  private onSelectMember: (id: number) => void;
  private onClearMember: () => void;

  constructor(
    onAddToCart: (id: number) => void,
    onIncreaseQty: (id: number) => void,
    onDecreaseQty: (id: number) => void,
    onCheckout: () => void,
    onSearch: (keyword: string) => void,
    onMemberSearch: (keyword: string) => void,
    onSelectMember: (id: number) => void,
    onClearMember: () => void,
  ) {
    this.onAddToCart = onAddToCart;
    this.onIncreaseQty = onIncreaseQty;
    this.onDecreaseQty = onDecreaseQty;
    this.onCheckout = onCheckout;
    this.onSearch = onSearch;
    this.onMemberSearch = onMemberSearch;
    this.onSelectMember = onSelectMember;
    this.onClearMember = onClearMember;

    this.productTableBody = document.querySelector(
      "#transaction-product-table",
    )!;
    this.cartContainer = document.querySelector("#cart-items")!;
    this.searchInput = document.querySelector("#trx-product-search")!;
    this.totalItemEl = document.querySelector("#cart-total-item")!;
    this.totalPriceEl = document.querySelector("#cart-total-price")!;
    this.processButton = document.querySelector("#btn-process-transaction")!;
    this.messageDiv = document.querySelector("#transaction-message")!;

    this.memberSearchInput = document.querySelector("#member-search-input")!;
    this.memberSearchResults = document.querySelector(
      "#member-search-results",
    )!;
    this.memberSearchArea = document.querySelector("#member-search-area")!;
    this.memberSelectedArea = document.querySelector("#member-selected-area")!;
    this.memberSelectedName = document.querySelector("#member-selected-name")!;
    this.memberSelectedInfo = document.querySelector("#member-selected-info")!;
    this.memberRedeemInput = document.querySelector("#member-redeem-input")!;
    this.btnClearMember = document.querySelector("#btn-clear-member")!;

    this.processButton.addEventListener("click", () => {
      this.onCheckout();
    });
    this.searchInput.addEventListener("input", () => {
      this.onSearch(this.searchInput.value);
    });
    this.memberSearchInput.addEventListener("input", () => {
      this.onMemberSearch(this.memberSearchInput.value);
    });
    this.btnClearMember.addEventListener("click", () => {
      this.onClearMember();
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
   * Render hasil pencarian member sebagai daftar pilihan.
   */
  renderMemberResults(
    customers: { id: number; name: string; phone: string; tier: string }[],
  ): void {
    if (customers.length === 0) {
      this.memberSearchResults.innerHTML = `<small>Tidak ada member ditemukan</small>`;
      return;
    }

    this.memberSearchResults.innerHTML = customers
      .map(
        (c) => `
        <button
            type="button"
            class="btn-select-member outline"
            data-id="${c.id}"
            style="display:block; width:100%; text-align:left; margin-bottom:0.25rem;"
        >
            ${this.escapeHtml(c.name)} — ${this.escapeHtml(c.phone)} <mark>${c.tier}</mark>
        </button>
        `,
      )
      .join("");

    this.memberSearchResults
      .querySelectorAll(".btn-select-member")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = Number((e.currentTarget as HTMLElement).dataset.id);
          this.onSelectMember(id);
        });
      });
  }

  /**
   * Tampilkan member yang sudah dipilih, sembunyikan area pencarian.
   */
  showSelectedMember(customer: {
    name: string;
    tier: string;
    points: number;
  }): void {
    this.memberSelectedName.textContent = customer.name;
    this.memberSelectedInfo.textContent = `Tier ${customer.tier} — Poin: ${customer.points.toLocaleString("id-ID")}`;
    this.memberRedeemInput.max = String(customer.points);
    this.memberRedeemInput.value = "0";

    this.memberSearchArea.style.display = "none";
    this.memberSelectedArea.style.display = "block";
  }

  /**
   * Reset panel member ke kondisi awal (belum ada member dipilih).
   */
  clearSelectedMember(): void {
    this.memberSearchInput.value = "";
    this.memberSearchResults.innerHTML = "";
    this.memberRedeemInput.value = "0";

    this.memberSearchArea.style.display = "block";
    this.memberSelectedArea.style.display = "none";
  }

  /**
   * Ambil jumlah poin yang ingin di-redeem dari input.
   */
  getRedeemPoints(): number {
    const value = Number(this.memberRedeemInput.value);
    return isNaN(value) || value < 0 ? 0 : value;
  }

  // ===== Message =====
  showSuccess(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-green-500, green)";
    this.messageDiv.setAttribute("role", "alert");

    setTimeout(() => {
      this.messageDiv.style.display = "none";
    }, 3000);
  }

  showError(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-red-500, red)";

    setTimeout(() => {
      this.messageDiv.style.display = "none";
    }, 5000);
  }

  // =========================== PRIVATE METHODS ===========================

  private bindProductEvents(): void {
    this.productTableBody.querySelectorAll(".btn-add").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        this.onAddToCart(id);
      });
    });
  }

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

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
