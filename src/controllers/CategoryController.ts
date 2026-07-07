import { CategoryView } from "../views/CategoryView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";

export class CategoryController {
  private view: CategoryView;
  private api: BrowserAPI;

  constructor() {
    this.api = new BrowserAPI();

    // Oper Callback dari interaksi HTML (Klik Simpan, Klik Cari, dsb)
    this.view = new CategoryView(
      (data) => this.handleSave(data),
      (id) => this.handleDelete(id),
      (id) => this.handleEdit(id),
      (keyword) => this.handleSearch(keyword),
      // ... callback lanjutan
    );
    this.initialize();
  }

  private async initialize() {
    await this.loadCategories();
  }

  /**
   * Tanam data ke backend menggunakan Fetch API
   */
  private async handleSave(data: any): Promise<void> {
    try {
      let result;

      data.id
        ? (result = await this.api.categoryUpdate(data.id, data))
        : (result = await this.api.categoryCreate(data));

      if (result.success) {
        this.view.showSuccess(
          data.id
            ? "Kategori berhasil diupdate!"
            : "Kategori berhasil disimpan!",
        );
        this.view.resetForm();
        await this.loadCategories(); // Panggil ulang tabel baru dari
      } else {
        this.view.showError("Gagal: " + result.error);
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleDelete(id: number): Promise<void> {
    try {
      const result = await this.api.categoriesDelete(id);
      if (result.success) {
        this.view.showSuccess(`Kategori berhasil dihapus!`);
        await this.loadCategories();
      } else {
        this.view.showError("Gagal hapus: " + result.error);
      }
    } catch (error) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleEdit(id: number): Promise<void> {
    try {
      const result = await this.api.categoryGetById(id);
      if (result.success && result.data) {
        this.view.fillForm(this.mapCategory(result.data));
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleSearch(keyword: string): Promise<void> {
    const result = await this.api.categoryGetAll();
    const productResult = await this.api.productGetAll();

    if (result.success && result.data) {
      const filtered = result.data
        .map((c: any) => this.mapCategory(c))
        .filter((c: any) =>
          c.name.toLowerCase().includes(keyword.toLowerCase()),
        );
      this.view.renderCategories(filtered, productResult.data);
    }
  }

  async loadCategories(): Promise<void> {
    const result = await this.api.categoryGetAll();
    const productResult = await this.api.productGetAll();
    const products = productResult.data.map((p: any) => ({
      id: p._id,
      categoryId: p._categoryId,
    }));

    if (result.success && result.data) {
      const categories = result.data.map((c: any) => this.mapCategory(c));
      this.view.renderCategories(categories, products);
    }
  }

  private mapCategory(category: any) {
    return {
      id: category._id,
      name: category._name,
      description: category._description,
    };
  }
}

// Pasangkan saat memuat halaman HTML
const categoryTableBody = document.querySelector("#category-table-body");
if (categoryTableBody) {
  new CategoryController();
}
