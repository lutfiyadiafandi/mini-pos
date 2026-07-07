import { ProductView } from "../views/ProductView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";

export class ProductController {
  private view: ProductView;
  private api: BrowserAPI;

  constructor() {
    this.api = new BrowserAPI();

    // Oper Callback dari interaksi HTML (Klik Simpan, Klik Cari, dsb)
    this.view = new ProductView(
      (data) => this.handleSave(data),
      (id) => this.handleDelete(id),
      (id) => this.handleEdit(id),
      (keyword) => this.handleSearch(keyword),
      // ... callback lanjutan
    );
    this.initialize();
  }

  private async initialize() {
    await this.loadProducts();
    await this.loadCategories();
  }

  /**
   * Tanam data ke backend menggunakan Fetch API
   */
  private async handleSave(data: any): Promise<void> {
    try {
      let result;

      data.id
        ? (result = await this.api.productUpdate(data.id, data))
        : (result = await this.api.productCreate(data));

      if (result.success) {
        this.view.showSuccess(
          data.id ? "Produk berhasil diupdate!" : "Produk berhasil disimpan!",
        );
        this.view.resetForm();
        await this.loadProducts(); // Panggil ulang tabel baru dari
      } else {
        this.view.showError("Gagal: " + result.error);
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleDelete(id: number): Promise<void> {
    try {
      const result = await this.api.productDelete(id);
      if (result.success) {
        this.view.showSuccess(`Produk berhasil dihapus!`);
        await this.loadProducts();
      } else {
        this.view.showError("Gagal hapus: " + result.error);
      }
    } catch (error) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleEdit(id: number): Promise<void> {
    try {
      const result = await this.api.productGetById(id);
      if (result.success && result.data) {
        this.view.fillForm(this.mapProduct(result.data));
      }
    } catch (err) {
      this.view.showError("Tidak bisa terhubung ke server.");
    }
  }

  private async handleSearch(keyword: string): Promise<void> {
    const result = await this.api.productGetAll();
    if (result.success && result.data) {
      const filtered = result.data
        .map((p: any) => this.mapProduct(p))
        .filter(
          (p: any) =>
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.sku.toLowerCase().includes(keyword.toLowerCase()),
        );
      this.view.renderProducts(filtered);
    }
  }

  async loadProducts(): Promise<void> {
    const result = await this.api.productGetAll();
    try {
      if (result.success && result.data) {
        this.view.renderProducts(
          result.data.map((product: any) => this.mapProduct(product)),
        ); // Oper ke modul Table
      }
    } catch (err) {
      console.error("Gagal load products:", err);
    }
  }

  async loadCategories(): Promise<void> {
    const result = await this.api.categoryGetAll();
    if (result.success && result.data) {
      const categories = result.data.map((category: any) => ({
        id: category._id,
        name: category._name,
      }));
      this.view.renderCategories(categories);
    }
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
}

// Pasangkan saat memuat halaman HTML
const productTableBody = document.querySelector("#product-table-body");
if (productTableBody) {
  new ProductController();
}
