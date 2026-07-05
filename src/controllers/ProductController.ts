import { ProductView } from "../views/ProductView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";
import { Category } from "../models/Category.js";

export class ProductController {
  private view: ProductView;
  private api: BrowserAPI;

  constructor() {
    this.api = new BrowserAPI();

    // Oper Callback dari interaksi HTML (Klik Simpan, Klik Cari, dsb)
    this.view = new ProductView(
      (data) => this.handleSave(data),
      (id) => this.handleDelete(id),
      (keyword) => this.handleSearch(keyword),
      // ... callback lanjutan
    );
    this.initialize();
  }

  private async initialize() {
    await this.loadProducts();
  }

  /**
   * Tanam data ke backend menggunakan Fetch API
   */
  private async handleSave(data: any): Promise<void> {
    try {
      const result = await this.api.productCreate(data); // Call Backend

      if (result.success) {
        this.view.showSuccess(`Produk disimpan ke dalam Sever!`);
        this.view.resetForm();
        await this.loadProducts(); // Panggil ulang tabel baru dari
      } else {
        this.view.showError("Peladen Merespon Gagal: " + result.error);
      }
    } catch (err) {
      this.view.showError("Komputer Putus Koneksi Server.");
    }
  }

  private async handleDelete(id: number): Promise<void> {
    // Akan diimplementasikan di Praktikum 10
  }

  private async handleEdit(id: number): Promise<void> {
    // Akan diimplementasikan di Praktikum 10
  }

  private async handleSearch(keyword: string): Promise<void> {
    // Akan diimplementasikan di Praktikum 10
  }

  public renderCategories(categories: Category[]): void {
    this.view.renderCategories(categories);
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
