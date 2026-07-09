import { UserView } from "../views/UserView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";
import { navigate } from "../utils/PageLoad.js";

export class UserController {
  private view: UserView;
  private api: BrowserAPI;

  constructor() {
    this.api = new BrowserAPI();

    // Oper Callback dari interaksi HTML (Klik Simpan, Klik Cari, dsb)
    this.view = new UserView(
      (data) => this.handleSave(data),
      (id) => this.handleDelete(id),
      (id) => this.handleEdit(id),
      (keyword) => this.handleSearch(keyword),
      // ... callback lanjutan
    );

    const currentUser = JSON.parse(
      sessionStorage.getItem("currentUser") || "{}",
    );
    if (currentUser.role !== "ADMIN") {
      navigate("dashboard");
      return;
    }

    this.initialize();
  }

  private async initialize() {
    await this.loadUsers();
  }

  /**
   * Tanam data ke backend menggunakan Fetch API
   */
  private async handleSave(data: any): Promise<void> {
    try {
      let result;

      data.id
        ? (result = await this.api.userUpdate(data.id, data))
        : (result = await this.api.userCreate(data));

      if (result.success) {
        this.view.showSuccess(
          data.id ? "User berhasil diupdate!" : "User berhasil disimpan!",
        );
        this.view.resetForm();
        await this.loadUsers(); // Panggil ulang tabel baru dari
      } else {
        this.view.showError("Gagal: " + result.error);
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleDelete(id: number): Promise<void> {
    try {
      const result = await this.api.userDelete(id);
      if (result.success) {
        this.view.showSuccess(`User berhasil dihapus!`);
        await this.loadUsers();
      } else {
        this.view.showError("Gagal hapus: " + result.error);
      }
    } catch (error) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleEdit(id: number): Promise<void> {
    try {
      const result = await this.api.userGetById(id);
      if (result.success && result.data) {
        this.view.fillForm(result.data);
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleSearch(keyword: string): Promise<void> {
    const result = await this.api.userGetAll();
    if (result.success && result.data) {
      const filtered = result.data.filter(
        (u: any) =>
          u.username.toLowerCase().includes(keyword.toLowerCase()) ||
          u.fullName.toLowerCase().includes(keyword.toLowerCase()),
      );
      this.view.renderUsers(filtered);
    }
  }

  async loadUsers(): Promise<void> {
    const result = await this.api.userGetAll();
    try {
      if (result.success && result.data) {
        this.view.renderUsers(result.data); // Oper ke modul Table
      }
    } catch (err) {
      console.error("Gagal load users:", err);
    }
  }
}

// Pasangkan saat memuat halaman HTML
const userTableBody = document.querySelector("#user-table-body");
if (userTableBody) {
  new UserController();
}
