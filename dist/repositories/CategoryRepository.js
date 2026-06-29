"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const Category_js_1 = require("../models/Category.js");
const connection_js_1 = require("../database/connection.js");
const AppError_js_1 = require("../errors/AppError.js");
class CategoryRepository {
    db;
    constructor() {
        this.db = connection_js_1.DatabaseConnection.getInstance();
    }
    /*
     * Ambil semua category aktif.
     */
    findAll() {
        const rows = this.db
            .prepare("SELECT * FROM categories ORDER BY id")
            .all();
        return rows.map((row) => this.mapToCategory(row));
    }
    /**
     * Cari category berdasarkan ID.
     * @throws NotFoundError jika category tidak ditemukan
     */
    findById(id) {
        const row = this.db
            .prepare("SELECT * FROM categories WHERE id = ?")
            .get(id);
        if (!row) {
            throw new AppError_js_1.NotFoundError(`Category dengan ID ${id} tidak ditemukan`);
        }
        return this.mapToCategory(row);
    }
    /**
     * Buat category baru.
     * @throws DatabaseError jika operasi database gagal
     */
    create(data) {
        try {
            const result = this.db
                .prepare(`INSERT INTO categories (name, description)
               VALUES (?, ?)`)
                .run(data.name, data.description ?? "");
            return this.findById(result.lastInsertRowid);
        }
        catch (err) {
            throw new AppError_js_1.DatabaseError("Gagal menyimpan category", err);
        }
    }
    /**
     * Update data category.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    update(id, data) {
        // Pastikan category ada
        this.findById(id);
        try {
            this.db
                .prepare(`UPDATE categories SET
              name = COALESCE(?, name),              
              description = COALESCE(?, description)
            WHERE id = ?`)
                .run(data.name ?? null, data.description ?? null, id);
            return this.findById(id);
        }
        catch (err) {
            throw new AppError_js_1.DatabaseError(`Gagal update category ID ${id}`, err);
        }
    }
    /**
     * Delete category jika tidak ada produk.
     * @throws ValidationError jika category masih memiliki produk
     * @throws NotFoundError jika produk tidak ditemukan
     */
    delete(id) {
        // Pastikan ada
        this.findById(id);
        const rows = this.db
            .prepare("SELECT * FROM products WHERE category_id = ? AND is_active = 1")
            .all(id);
        if (rows.length > 0) {
            throw new AppError_js_1.ValidationError(`Category dengan ID ${id} masih memiliki produk`);
        }
        this.db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    }
    /**
     * Mapping dari database row ke domain object Category.
     */
    mapToCategory(row) {
        const category = new Category_js_1.Category(row.id, row.name, row.description ?? "");
        return category;
    }
}
exports.CategoryRepository = CategoryRepository;
