"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductAnalytics = void 0;
class ProductAnalytics {
    products;
    constructor(products) {
        this.products = products;
    }
    // Product dengan stok rendah
    getLowStockProducts(threshold = 5) {
        return this.products
            .filter((p) => p.stock < threshold && p.isActive)
            .sort((a, b) => a.stock - b.stock);
    }
    // Group berdasarkan kategori
    getByCategory() {
        return this.products.reduce((map, p) => {
            const list = map.get(p.categoryId) ?? [];
            list.push(p);
            map.set(p.categoryId, list);
            return map;
        }, new Map());
    }
    // Search product berdasarkan nama atau SKU
    searchProducts(keyword) {
        const lower = keyword.toLowerCase();
        return this.products.filter((p) => p.name.toLowerCase().includes(lower) ||
            p.sku.toLowerCase().includes(lower));
    }
    // Ringkasan statistik
    getSummary() {
        const active = this.products.filter((p) => p.isActive);
        return {
            totalProducts: this.products.length,
            activeProducts: active.length,
            totalStockValue: active.reduce((sum, p) => sum + p.price * p.stock, 0),
            averagePrice: active.length > 0
                ? active.reduce((sum, p) => sum + p.price, 0) / active.length
                : 0,
            lowStockCount: active.filter((p) => p.isLowStock).length,
        };
    }
    // Top produk termahal
    getMostExpensive(n = 5) {
        return this.products
            .filter((p) => p.isActive)
            .sort((a, b) => b.price - a.price)
            .slice(0, n);
    }
}
exports.ProductAnalytics = ProductAnalytics;
