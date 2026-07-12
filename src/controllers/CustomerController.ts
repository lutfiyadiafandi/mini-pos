import { CustomerView } from "../views/CustomerView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";

export class CustomerController {
  private view: CustomerView;
  private api: BrowserAPI;

  constructor() {
    this.api = new BrowserAPI();

    this.view = new CustomerView(
      (data) => this.handleSave(data),
      (id) => this.handleDelete(id),
      (id) => this.handleEdit(id),
      (keyword) => this.handleSearch(keyword),
      (id) => this.handleViewDetail(id),
    );

    this.initialize();
  }

  private async initialize() {
    await this.loadCustomers();
  }

  private async handleSave(data: any): Promise<void> {
    try {
      let result;

      data.id
        ? (result = await this.api.customerUpdate(data.id, data))
        : (result = await this.api.customerCreate(data));

      if (result.success) {
        this.view.showSuccess(
          data.id
            ? "Member berhasil diupdate!"
            : "Member berhasil didaftarkan!",
        );
        this.view.resetForm();
        await this.loadCustomers();
      } else {
        this.view.showError("Gagal: " + result.error);
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleDelete(id: number): Promise<void> {
    try {
      const result = await this.api.customerDelete(id);
      if (result.success) {
        this.view.showSuccess(`Member berhasil dihapus!`);
        await this.loadCustomers();
      } else {
        this.view.showError("Gagal hapus: " + result.error);
      }
    } catch (error) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleEdit(id: number): Promise<void> {
    try {
      const result = await this.api.customerGetById(id);
      if (result.success && result.data) {
        this.view.fillForm(this.mapCustomer(result.data));
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  /**
   * Ambil profil member + riwayat belanja sekaligus, lalu tampilkan di modal.
   */
  private async handleViewDetail(id: number): Promise<void> {
    try {
      const [customerResult, historyResult] = await Promise.all([
        this.api.customerGetById(id),
        this.api.customerTransactions(id),
      ]);

      if (customerResult.success && customerResult.data) {
        const customer = this.mapCustomer(customerResult.data);
        const history = historyResult.success
          ? historyResult.data.map((t: any) => this.mapTransaction(t))
          : [];

        this.view.showDetail(customer, history);
      } else {
        this.view.showError("Gagal memuat detail member.");
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleSearch(keyword: string): Promise<void> {
    const result = await this.api.customerGetAll();
    if (result.success && result.data) {
      const filtered = result.data
        .map((c: any) => this.mapCustomer(c))
        .filter(
          (c: any) =>
            c.name.toLowerCase().includes(keyword.toLowerCase()) ||
            c.phone.toLowerCase().includes(keyword.toLowerCase()),
        );
      this.view.renderCustomers(filtered);
    }
  }

  async loadCustomers(): Promise<void> {
    const result = await this.api.customerGetAll();
    try {
      if (result.success && result.data) {
        this.view.renderCustomers(
          result.data.map((c: any) => this.mapCustomer(c)),
        );
      }
    } catch (err) {
      console.error("Gagal load customers:", err);
    }
  }

  private mapCustomer(customer: any) {
    return {
      id: customer._id,
      name: customer._name,
      phone: customer._phone,
      email: customer._email,
      tier: customer._tier,
      points: customer._points,
      totalSpending: customer._totalSpending,
    };
  }

  private mapTransaction(trx: any) {
    return {
      code: trx._code,
      transactionDate: trx._transactionDate,
      totalAmount: trx._totalAmount,
      discountAmount: trx._discountAmount,
      pointsEarned: trx._pointsEarned,
    };
  }
}

// Pasangkan saat memuat halaman HTML
const customerTableBody = document.querySelector("#customer-table-body");
if (customerTableBody) {
  new CustomerController();
}
