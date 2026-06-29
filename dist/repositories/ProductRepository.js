"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const Product_js_1 = require("../models/Product.js");
const connection_js_1 = require("../database/connection.js");
const AppError_js_1 = require("../errors/AppError.js");
/**
 * Product Repository akses data produk melalui SQLite.
 * Semua query menggunakan prepared statements untuk mencegah SQL injection.
 */
class ProductRepository {
    db;
    constructor() {
        this.db = connection_js_1.DatabaseConnection.getInstance();
    }
    /*
     * Ambil semua produk aktif.
     */
    findAll(page = 1, limit = 10) {
        const rows = this.db
            // Belom selesai
            .prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY name")
            .all();
        return rows.map((row) => this.mapToProduct(row));
    }
    /**
     * Cari produk berdasarkan ID.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    findById(id) {
        const row = this.db
            .prepare("SELECT * FROM products WHERE id = ? AND is_active = 1")
            .get(id);
        if (!row) {
            throw new AppError_js_1.NotFoundError(`Product dengan ID ${id} tidak ditemukan`);
        }
        return this.mapToProduct(row);
    }
    /**
     * Cari produk berdasarkan SKU.
     */
    findBySku(sku) {
        const row = this.db
            .prepare("SELECT * FROM products WHERE sku = ? AND is_active = 1")
            .get(sku.toUpperCase());
        return row ? this.mapToProduct(row) : undefined;
    }
    /**
     * Buat produk baru.
     * @throws ValidationError jika SKU sudah digunakan
     * @throws DatabaseError jika operasi database gagal
     */
    create(data) {
        try {
            const result = this.db
                .prepare(`INSERT INTO products (sku, name, category_id, price, stock, description)
           VALUES (?, ?, ?, ?, ?, ?)`)
                .run(data.sku.toUpperCase(), data.name, data.categoryId, data.price, data.stock, data.description ?? "");
            return this.findById(result.lastInsertRowid);
        }
        catch (err) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                throw new AppError_js_1.ValidationError(`SKU ${data.sku} sudah digunakan`);
            }
            if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
                // Belum selesai
                throw new AppError_js_1.ValidationError(`Category ID ${data.categoryId} tidak ditemukan`);
            }
            throw new AppError_js_1.DatabaseError("Gagal menyimpan produk", err);
        }
    }
    /**
     * Update data produk.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    update(id, data) {
        // Pastikan produk ada
        this.findById(id);
        try {
            this.db
                .prepare(`UPDATE products SET
            name = COALESCE(?, name),
            price = COALESCE(?, price),
            stock = COALESCE(?, stock),
            category_id = COALESCE(?, category_id),
            description = COALESCE(?, description),
            updated_at = datetime('now')
          WHERE id = ?`)
                .run(data.name ?? null, data.price ?? null, data.stock ?? null, data.categoryId ?? null, data.description ?? null, id);
            return this.findById(id);
        }
        catch (err) {
            throw new AppError_js_1.DatabaseError(`Gagal update produk ID ${id}`, err);
        }
    }
    /**
     * Soft delete set is active 0.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    delete(id) {
        // Pastikan ada
        this.findById(id);
        this.db
            // Belum selesai
            .prepare("UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND is_active = 1")
            .run(id);
    }
    /**
     * Search produk berdasarkan nama atau SKU.
     */
    search(keyword) {
        const rows = this.db
            .prepare(`SELECT * FROM products
         WHERE is_active = 1
         AND (name LIKE ? OR sku LIKE ?)
         ORDER BY name`)
            .all(`%${keyword}%`, `%${keyword}%`);
        return rows.map((row) => this.mapToProduct(row));
    }
    /**
     * Ambil produk berdasarkan kategori.
     */
    findByCategory(categoryId) {
        const rows = this.db
            // Belum selesai
            .prepare("SELECT * FROM products WHERE category_id = ? AND is_active = 1")
            .all(categoryId);
        return rows.map((row) => this.mapToProduct(row));
    }
    /**
     * Ambil produk dengan stok rendah.
     */
    findLowStock(threshold = 5) {
        const rows = this.db
            // belum selesai
            .prepare("SELECT * FROM products WHERE stock < ? AND is_active = 1 ORDER BY stock")
            .all(threshold);
        return rows.map((row) => this.mapToProduct(row));
    }
    /**
     * Update stok produk (increment/decrement).
     * @throws NotFoundError jika produk tidak ditemukan
     * @throws ValidationError jika stok akan menjadi negatif
     */
    updateStock(id, quantityChange) {
        const product = this.findById(id);
        const newStock = product.stock + quantityChange;
        if (newStock < 0) {
            throw new AppError_js_1.ValidationError(`Stok ${product.name} tidak cukup: tersedia ${product.stock}`);
        }
        this.db
            // belum selesai
            .prepare("UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?")
            .run(newStock, id);
    }
    /**
     * Mapping dari database row ke domain object Product.
     */
    mapToProduct(row) {
        const product = new Product_js_1.Product(row.id, row.sku, row.name, row.price, row.stock, row.category_id, row.description ?? "");
        if (row.is_active === 0) {
            product.deactivate();
        }
        return product;
    }
}
exports.ProductRepository = ProductRepository;
