import Database from "better-sqlite3";
import { Category } from "../models/Category.js";
import { DatabaseConnection } from "../database/connection.js";
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "../errors/AppError.js";

export class CategoryRepository {
  private db: Database.Database;
  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /*
   * Ambil semua category aktif.
   */
  findAll(): Category[] {
    const rows = this.db
      .prepare("SELECT * FROM categories ORDER BY id")
      .all() as any[];

    return rows.map((row) => this.mapToCategory(row));
  }

  /**
   * Cari category berdasarkan ID.
   * @throws NotFoundError jika category tidak ditemukan
   */
  findById(id: number): Category {
    const row = this.db
      .prepare("SELECT * FROM categories WHERE id = ?")
      .get(id) as any | undefined;
    if (!row) {
      throw new NotFoundError(`Category dengan ID ${id} tidak ditemukan`);
    }

    return this.mapToCategory(row);
  }

  /**
   * Buat category baru.
   * @throws DatabaseError jika operasi database gagal
   */
  create(data: { name: string; description?: string }): Category {
    try {
      const result = this.db
        .prepare(
          `INSERT INTO categories (name, description)
               VALUES (?, ?)`,
        )
        .run(data.name, data.description ?? "");

      return this.findById(result.lastInsertRowid as number);
    } catch (err: any) {
      throw new DatabaseError("Gagal menyimpan category", err);
    }
  }

  /**
   * Update data category.
   * @throws NotFoundError jika produk tidak ditemukan
   */
  update(
    id: number,
    data: {
      name?: string;
      description?: string;
    },
  ): Category {
    // Pastikan category ada
    this.findById(id);

    try {
      this.db
        .prepare(
          `UPDATE categories SET
              name = COALESCE(?, name),              
              description = COALESCE(?, description)
            WHERE id = ?`,
        )
        .run(data.name ?? null, data.description ?? null, id);

      return this.findById(id);
    } catch (err: any) {
      throw new DatabaseError(`Gagal update category ID ${id}`, err);
    }
  }

  /**
   * Delete category jika tidak ada produk.
   * @throws ValidationError jika category masih memiliki produk
   * @throws NotFoundError jika produk tidak ditemukan
   */
  delete(id: number): void {
    // Pastikan ada
    this.findById(id);

    const rows = this.db
      .prepare("SELECT * FROM products WHERE category_id = ? AND is_active = 1")
      .all(id) as any[];

    if (rows.length > 0) {
      throw new ValidationError(
        `Category dengan ID ${id} masih memiliki produk`,
      );
    }

    this.db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  }

  /**
   * Mapping dari database row ke domain object Category.
   */
  private mapToCategory(row: any): Category {
    const category = new Category(row.id, row.name, row.description ?? "");

    return category;
  }
}
