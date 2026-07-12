import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

/**
 * Product View class yang meng-encapsulate semua DOM manipulation
 * untuk halaman manajemen produk.
 *
 * Prinsip: View HANYA bertanggung jawab untuk rendering dan event capturing
 * View TIDAK melakukan business logic atau data access.
 */
export class ProductView {
  private tableBody: HTMLTableSectionElement;
  private form: HTMLFormElement;
  private searchInput: HTMLInputElement;
  private categorySelect: HTMLSelectElement;
  private messageDiv: HTMLElement;
  private formContainer: HTMLDetailsElement;

  // Callback functions diberikan oleh Controller (akan dibuat di P09)
  private onSave: (data: any) => void;
  private onDelete: (id: number) => void;
  private onEdit: (id: number) => void;
  private onSearch: (keyword: string) => void;

  constructor(
    onSave: (data: any) => void,
    onDelete: (id: number) => void,
    onEdit: (id: number) => void,
    onSearch: (keyword: string) => void,
  ) {
    this.onSave = onSave;
    this.onDelete = onDelete;
    this.onEdit = onEdit;
    this.onSearch = onSearch;

    // Ambil referensi ke DOM elements
    this.tableBody = document.querySelector("#product-table-body")!;
    this.form = document.querySelector("#product-form")!;
    this.searchInput = document.querySelector("#product-search")!;
    this.categorySelect = document.querySelector("#category-select")!;
    this.messageDiv = document.querySelector("#product-message")!;
    this.formContainer = document.querySelector("#product-form-container")!;

    // Bind events
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.searchInput.addEventListener("input", () => {
      this.onSearch(this.searchInput.value);
    });
  }

  /**
   * Render daftar produk ke tabel.
   */
  renderProducts(products: Product[]): void {
    if (products.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center;">
                Tidak ada produk ditemukan
            </td>
        </tr>
        `;
      return;
    }

    this.tableBody.innerHTML = products
      .map(
        (p) => `
        <tr>
            <td><code>${this.escapeHtml(p.sku)}</code></td>
            <td>${this.escapeHtml(p.name)}</td>
            <td>#${p.categoryId}</td>
            <td>Rp ${p.price.toLocaleString("id-ID")}</td>
            <td>
                ${p.stock}
                ${p.isLowStock ? '<span class="badge badge-lowstock">LOW</span>' : ""}
            </td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon btn-edit outline" data-id="${p.id}" title="Edit" aria-label="Edit">
                        ${this.editIcon()}
                    </button>
                    <button class="btn-icon btn-delete outline" data-id="${p.id}" title="Hapus" aria-label="Hapus">
                        ${this.deleteIcon()}
                    </button>
                </div>
            </td>
        </tr>
        `,
      )
      .join("");

    this.bindRowEvents();
  }

  /**
   * Render options kategori di dropdown form.
   */
  renderCategories(categories: Category[]): void {
    const options = categories.map(
      (c) => `
        <option value="${c.id}">${this.escapeHtml(c.name)}</option>
        `,
    );

    this.categorySelect.innerHTML =
      `<option value="">-- Pilih Kategori --</option>` + options.join("");
  }

  fillForm(product: any): void {
    (this.form.elements.namedItem("id") as HTMLInputElement).value = String(
      product.id,
    );
    (this.form.elements.namedItem("sku") as HTMLInputElement).value =
      product.sku;
    (this.form.elements.namedItem("name") as HTMLInputElement).value =
      product.name;
    (this.form.elements.namedItem("categoryId") as HTMLSelectElement).value =
      String(product.categoryId);
    (this.form.elements.namedItem("price") as HTMLInputElement).value = String(
      product.price,
    );
    (this.form.elements.namedItem("stock") as HTMLInputElement).value = String(
      product.stock,
    );
    (this.form.elements.namedItem("description") as HTMLTextAreaElement).value =
      product.description;

    window.scrollTo({ top: 0, behavior: "smooth" });
    this.formContainer.open = true;
  }

  /**
   * Tampilkan pesan success
   */
  showSuccess(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-green-500, green)";
    this.messageDiv.setAttribute("role", "alert");

    // Auto-hide setelah 3 detik
    setTimeout(() => {
      this.messageDiv.style.display = "none";
      this.messageDiv.className = "";
    }, 3_000);
  }

  /**
   * Tampilkan pesan error
   */
  showError(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-red-500, red)";

    // Auto-hide setelah 5 detik
    setTimeout(() => {
      this.messageDiv.style.display = "none";
      this.messageDiv.style.color = "";
    }, 5_000);
  }

  /**
   * Reset form setelah submit
   */
  resetForm(): void {
    this.form.reset();
  }

  // =========================== PRIVATE METHODS ===========================

  private handleSubmit(e: Event): void {
    e.preventDefault();
    const formData = new FormData(this.form);

    this.onSave({
      id: Number(formData.get("id")) || undefined,
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      categoryId: Number(formData.get("categoryId")),
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      description: (formData.get("description") as string) ?? "",
    });
  }

  private bindRowEvents(): void {
    // Bind delete buttons
    this.tableBody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        if (confirm("Yakin hapus produk ini?")) {
          this.onDelete(id);
        }
      });
    });

    // Bind edit buttons (placeholder full implementation di P09)
    this.tableBody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        this.onEdit(id);
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

  private editIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`;
  }

  private deleteIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>`;
  }
}
