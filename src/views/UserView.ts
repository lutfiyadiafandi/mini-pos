import { User } from "../models/User.js";

/**
 * User View class yang meng-encapsulate semua DOM manipulation
 * untuk halaman manajemen user.
 *
 * Prinsip: View HANYA bertanggung jawab untuk rendering dan event capturing
 * View TIDAK melakukan business logic atau data access.
 */
export class UserView {
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
    this.tableBody = document.querySelector("#user-table-body")!;
    this.form = document.querySelector("#user-form")!;
    this.searchInput = document.querySelector("#user-search")!;
    this.messageDiv = document.querySelector("#user-message")!;
    this.formContainer = document.querySelector("#user-form-container")!;

    // Bind events
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.searchInput.addEventListener("input", () => {
      this.onSearch(this.searchInput.value);
    });
  }

  /**
   * Render daftar user ke tabel.
   */
  renderUsers(
    users: {
      id: number;
      username: string;
      fullName: string;
      role: string;
    }[],
  ): void {
    if (users.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center;">
                Tidak ada user ditemukan
            </td>
        </tr>
        `;
      return;
    }

    this.tableBody.innerHTML = users
      .map(
        (u) => `
        <tr>
            <td><code>${this.escapeHtml(String(u.id))}</code></td>
            <td>${this.escapeHtml(u.username)}</td>
            <td>${this.escapeHtml(u.fullName)}</td>
            <td>
            ${
              u.role === "ADMIN"
                ? '<span class="badge badge-role-admin">ADMIN</span>'
                : '<span class="badge badge-role-cashier">CASHIER</span>'
            }
            </td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon btn-edit outline" data-id="${u.id}" title="Edit" aria-label="Edit">
                        ${this.editIcon()}
                    </button>
                    <button class="btn-icon btn-delete outline" data-id="${u.id}" title="Hapus" aria-label="Hapus">
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

  fillForm(user: any): void {
    (this.form.elements.namedItem("id") as HTMLInputElement).value = String(
      user.id,
    );
    (this.form.elements.namedItem("username") as HTMLInputElement).value =
      user.username;
    const passwordInput = this.form.elements.namedItem(
      "password",
    ) as HTMLInputElement;
    passwordInput.value = "";
    passwordInput.placeholder = "Kosongkan jika tidak ingin mengganti password";
    (this.form.elements.namedItem("full_name") as HTMLInputElement).value =
      user.fullName;
    (this.form.elements.namedItem("role") as HTMLInputElement).value =
      user.role;

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
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      full_name: formData.get("full_name") as string,
      role: formData.get("role") as string,
    });
  }

  private bindRowEvents(): void {
    // Bind delete buttons
    this.tableBody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        if (confirm("Yakin hapus user ini?")) {
          this.onDelete(id);
        }
      });
    });

    // Bind edit buttons
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
