import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

/**
 * Category View class yang meng-encapsulate semua DOM manipulation
 * untuk halaman manajemen kategori.
 *
 * Prinsip: View HANYA bertanggung jawab untuk rendering dan event capturing
 * View TIDAK melakukan business logic atau data access.
 */
export class CategoryView {
  private tableBody: HTMLTableSectionElement;
  private form: HTMLFormElement;
  private searchInput: HTMLInputElement;
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
    this.tableBody = document.querySelector("#category-table-body")!;
    this.form = document.querySelector("#category-form")!;
    this.searchInput = document.querySelector("#category-search")!;
    this.messageDiv = document.querySelector("#category-message")!;
    this.formContainer = document.querySelector("#category-form-container")!;

    // Bind events
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.searchInput.addEventListener("input", () => {
      this.onSearch(this.searchInput.value);
    });
  }

  /**
   * Render daftar kategori ke tabel.
   */
  renderCategories(categories: Category[], products: Product[]): void {
    if (categories.length === 0) {
      this.tableBody.innerHTML = `
          <tr>
                <td colspan="6" style="text-align: center;">
                    Tidak ada produk ditemukan
                </td>
          </tr>
          `;
      return;
    }

    this.tableBody.innerHTML = categories
      .map((c) => {
        const productCount = products.filter(
          (product) => product.categoryId === c.id,
        ).length;

        return `
            <tr>
                <td><code>${this.escapeHtml(String(c.id))}</code></td>
                <td>${this.escapeHtml(c.name)}</td>
                <td>${this.escapeHtml(
                  c.description !== "" ? c.description : "-",
                )}</td>
                <td><strong>${productCount}</strong></td>
                <td>
                <div class="grid" style="gap: 0.5rem; ">
                    <button class="btn-edit outline pico-background-green-500 pico-color-green-600" data-id="${c.id}">
                        Edit
                    </button>
                    <button class="btn-delete outline pico-background-red-500 pico-color-red-600" data-id="${c.id}">
                        Hapus
                    </button>
                </div>
            </td>
            </tr>`;
      })
      .join("");

    this.bindRowEvents();
  }

  fillForm(category: any): void {
    (this.form.elements.namedItem("id") as HTMLInputElement).value = String(
      category.id,
    );
    (this.form.elements.namedItem("name") as HTMLInputElement).value =
      category.name;
    (this.form.elements.namedItem("description") as HTMLTextAreaElement).value =
      category.description;

    window.scrollTo({ top: 0, behavior: "smooth" });
    this.formContainer.open = true;
  }

  /**
   * Tampilkan pesan success
   */
  showSuccess(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.className = "";
    this.messageDiv.setAttribute("role", "alert");

    // Auto-hide setelah 3 detik
    setTimeout(() => {
      this.messageDiv.style.display = "none";
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
      name: formData.get("name") as string,
      description: (formData.get("description") as string) ?? "",
    });
  }

  private bindRowEvents(): void {
    // Bind delete buttons
    this.tableBody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.target as HTMLElement).dataset.id);
        if (confirm("Yakin hapus kategori ini?")) {
          this.onDelete(id);
        }
      });
    });

    // Bind edit buttons (placeholder full implementation di P09)
    this.tableBody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.target as HTMLElement).dataset.id);
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
}
