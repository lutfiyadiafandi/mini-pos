"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class ProductRepository extends BaseRepository_1.BaseRepository {
    /**
     * Search produk berdasarkan nama atau SKU.
     * Implementasi abstract method dari BaseRepository.
     */
    search(keyword) {
        const lower = keyword.toLowerCase();
        return this.items.filter((p) => p.name.toLowerCase().includes(lower) ||
            p.sku.toLowerCase().includes(lower));
    }
    // Cari produk berdasarkan SKU
    findBySku(sku) {
        return this.items.find((p) => p.sku === sku.toUpperCase());
    }
    // Ambil semua produk berdasarkan kategori
    findByCategory(categoryId) {
        return this.items.filter((p) => p.categoryId === categoryId);
    }
    // Ambil semua produk yang aktif
    findActive() {
        return this.items.filter((p) => p.isActive);
    }
    // Ambil produk yang stoknya rendah
    findLowStock(threshold = 5) {
        return this.items.filter((p) => p.stock < threshold && p.isActive);
    }
}
exports.ProductRepository = ProductRepository;
