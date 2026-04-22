import { Product } from "../models/Product";
import { BaseRepository } from "./BaseRepository";

export class ProductRepository extends BaseRepository<Product> {
  /**
   * Search produk berdasarkan nama atau SKU.
   * Implementasi abstract method dari BaseRepository.
   */
  search(keyword: string): Product[] {
    const lower = keyword.toLowerCase();
    return this.items.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.sku.toLowerCase().includes(lower),
    );
  }

  // Cari produk berdasarkan SKU
  findBySku(sku: string): Product | undefined {
    return this.items.find((p) => p.sku === sku.toUpperCase());
  }

  // Ambil semua produk berdasarkan kategori
  findByCategory(categoryId: number): Product[] {
    return this.items.filter((p) => p.categoryId === categoryId);
  }

  // Ambil semua produk yang aktif
  findActive(): Product[] {
    return this.items.filter((p) => p.isActive);
  }

  // Ambil produk yang stoknya rendah
  findLowStock(threshold: number = 5): Product[] {
    return this.items.filter((p) => p.stock < threshold && p.isActive);
  }
}
