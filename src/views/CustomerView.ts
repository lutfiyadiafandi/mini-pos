export class CustomerView {
  private tableBody: HTMLTableSectionElement;
  private form: HTMLFormElement;
  private searchInput: HTMLInputElement;
  private messageDiv: HTMLElement;
  private formContainer: HTMLDetailsElement;
  private detailModal: HTMLDialogElement;
  private detailProfileDiv: HTMLElement;
  private detailHistoryBody: HTMLTableSectionElement;
  private closeDetailBtn: HTMLElement;

  private onSave: (data: any) => void;
  private onDelete: (id: number) => void;
  private onEdit: (id: number) => void;
  private onSearch: (keyword: string) => void;
  private onViewDetail: (id: number) => void;

  constructor(
    onSave: (data: any) => void,
    onDelete: (id: number) => void,
    onEdit: (id: number) => void,
    onSearch: (keyword: string) => void,
    onViewDetail: (id: number) => void,
  ) {
    this.onSave = onSave;
    this.onDelete = onDelete;
    this.onEdit = onEdit;
    this.onSearch = onSearch;
    this.onViewDetail = onViewDetail;

    this.tableBody = document.querySelector("#customer-table-body")!;
    this.form = document.querySelector("#customer-form")!;
    this.searchInput = document.querySelector("#customer-search")!;
    this.messageDiv = document.querySelector("#customer-message")!;
    this.formContainer = document.querySelector("#customer-form-container")!;
    this.detailModal = document.querySelector("#customer-detail-modal")!;
    this.detailProfileDiv = document.querySelector("#customer-detail-profile")!;
    this.detailHistoryBody = document.querySelector(
      "#customer-detail-history",
    )!;
    this.closeDetailBtn = document.querySelector("#btn-close-detail")!;

    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.searchInput.addEventListener("input", () => {
      this.onSearch(this.searchInput.value);
    });
    this.closeDetailBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.detailModal.close();
    });
  }

  /**
   * Render daftar member ke tabel.
   */
  renderCustomers(
    customers: {
      id: number;
      name: string;
      phone: string;
      email: string | null;
      tier: string;
      points: number;
      totalSpending: number;
    }[],
  ): void {
    if (customers.length === 0) {
      this.tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center;">
                Tidak ada member ditemukan
            </td>
        </tr>
        `;
      return;
    }

    this.tableBody.innerHTML = customers
      .map(
        (c) => `
        <tr>
            <td>
                <a class="btn-detail-link" data-id="${c.id}" style="text-decoration: none; cursor: pointer; color: var(--color-primary); font-weight: 600;">
                    ${this.escapeHtml(c.name)}
                </a>
            </td>
            <td>${this.escapeHtml(c.phone)}</td>
            <td>${this.renderTierBadge(c.tier)}</td>
            <td>${c.points.toLocaleString("id-ID")}</td>
            <td>Rp ${c.totalSpending.toLocaleString("id-ID")}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon btn-edit outline" data-id="${c.id}" title="Edit" aria-label="Edit">
                        ${this.editIcon()}
                    </button>
                    <button class="btn-icon btn-delete outline" data-id="${c.id}" title="Hapus" aria-label="Hapus">
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

  fillForm(customer: any): void {
    (this.form.elements.namedItem("id") as HTMLInputElement).value = String(
      customer.id,
    );
    (this.form.elements.namedItem("name") as HTMLInputElement).value =
      customer.name;
    (this.form.elements.namedItem("phone") as HTMLInputElement).value =
      customer.phone;
    (this.form.elements.namedItem("email") as HTMLInputElement).value =
      customer.email ?? "";

    window.scrollTo({ top: 0, behavior: "smooth" });
    this.formContainer.open = true;
  }

  /**
   * Tampilkan modal profil member + riwayat belanjanya.
   */
  showDetail(
    customer: {
      id: number;
      name: string;
      phone: string;
      email: string | null;
      tier: string;
      points: number;
      totalSpending: number;
    },
    transactions: {
      code: string;
      transactionDate: string | Date;
      totalAmount: number;
      discountAmount: number;
      pointsEarned: number;
    }[],
  ): void {
    this.detailProfileDiv.innerHTML = `
        <div class="grid">
            <div>
                <strong>Nama</strong>
                <p>${this.escapeHtml(customer.name)}</p>
            </div>
            <div>
                <strong>No. HP</strong>
                <p>${this.escapeHtml(customer.phone)}</p>
            </div>
            <div>
                <strong>Email</strong>
                <p>${customer.email ? this.escapeHtml(customer.email) : "-"}</p>
            </div>
        </div>
        <div class="grid">
            <div>
                <strong>Tier</strong>
                <p>${this.renderTierBadge(customer.tier)}</p>
            </div>
            <div>
                <strong>Poin</strong>
                <p>${customer.points.toLocaleString("id-ID")}</p>
            </div>
            <div>
                <strong>Total Belanja</strong>
                <p>Rp ${customer.totalSpending.toLocaleString("id-ID")}</p>
            </div>
        </div>
        <hr/>
    `;

    if (transactions.length === 0) {
      this.detailHistoryBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center">
                Belum ada riwayat belanja
            </td>
        </tr>
        `;
    } else {
      this.detailHistoryBody.innerHTML = transactions
        .map((t) => {
          const date = new Date(t.transactionDate).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          return `
            <tr>
                <td><code>${this.escapeHtml(t.code)}</code></td>
                <td>${date}</td>
                <td>Rp ${t.totalAmount.toLocaleString("id-ID")}</td>
                <td>Rp ${t.discountAmount.toLocaleString("id-ID")}</td>
                <td>+${t.pointsEarned}</td>
            </tr>
          `;
        })
        .join("");
    }

    this.detailModal.showModal();
  }

  showSuccess(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-green-500, green)";
    this.messageDiv.setAttribute("role", "alert");

    setTimeout(() => {
      this.messageDiv.style.display = "none";
    }, 3_000);
  }

  showError(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-red-500, red)";

    setTimeout(() => {
      this.messageDiv.style.display = "none";
      this.messageDiv.style.color = "";
    }, 5_000);
  }

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
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || null,
    });
  }

  private bindRowEvents(): void {
    this.tableBody.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        if (confirm("Yakin hapus member ini?")) {
          this.onDelete(id);
        }
      });
    });

    this.tableBody.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        this.onEdit(id);
      });
    });

    this.tableBody.querySelectorAll(".btn-detail-link").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number((e.currentTarget as HTMLElement).dataset.id);
        this.onViewDetail(id);
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private renderTierBadge(tier: string): string {
    const classMap: Record<string, string> = {
      REGULAR: "badge-tier-regular",
      GOLD: "badge-tier-gold",
      VIP: "badge-tier-vip",
    };
    const cls = classMap[tier] ?? "badge-tier-regular";
    return `<span class="badge ${cls}">${tier}</span>`;
  }

  private editIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`;
  }

  private deleteIcon(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>`;
  }
}
