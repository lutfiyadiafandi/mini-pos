import Database from "better-sqlite3";
import { User } from "../models/User.js";
import { DatabaseConnection } from "../database/connection.js";
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "../errors/AppError.js";
import { Admin } from "../models/Admin.js";
import { Cashier } from "../models/Cashier.js";

export class UserRepository {
  private db: Database.Database;
  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /*
   * Ambil semua user aktif.
   */
  findAll(): User[] {
    const rows = this.db
      .prepare("SELECT * FROM users WHERE is_active = 1 ORDER BY username")
      .all() as any[];

    return rows.map((row) => this.mapToUser(row));
  }

  /**
   * Cari user berdasarkan ID.
   * @throws NotFoundError jika user tidak ditemukan
   */
  findById(id: number): User {
    const row = this.db
      .prepare("SELECT * FROM users WHERE id = ? AND is_active = 1")
      .get(id) as any | undefined;
    if (!row) {
      throw new NotFoundError(`User dengan ID ${id} tidak ditemukan`);
    }

    return this.mapToUser(row);
  }

  /**
   * Cari user berdasarkan username.
   * @throws NotFoundError jika user tidak ditemukan
   */
  findByUsername(username: string): User | undefined {
    const row = this.db
      .prepare("SELECT * FROM users WHERE username = ? AND is_active = 1")
      .get(username) as any | undefined;

    return row ? this.mapToUser(row) : undefined;
  }

  /**
   * Buat user baru.
   * @throws DatabaseError jika operasi database gagal
   */
  create(data: {
    username: string;
    password: string;
    full_name: string;
    role: string;
  }): User {
    try {
      const result = this.db
        .prepare(
          `INSERT INTO users (username, password, full_name, role)
                 VALUES (?, ?, ?, ?)`,
        )
        .run(data.username, data.password, data.full_name, data.role);

      return this.findById(result.lastInsertRowid as number);
    } catch (err: any) {
      throw new DatabaseError("Gagal menyimpan user", err);
    }
  }

  /**
   * Update data user.
   * @throws NotFoundError jika produk tidak ditemukan
   */
  update(
    id: number,
    data: {
      username?: string;
      password?: string;
      full_name?: string;
      role?: string;
    },
  ): User {
    // Pastikan user ada
    this.findById(id);

    try {
      this.db
        .prepare(
          `UPDATE users SET
                username = COALESCE(?, username),              
                password = COALESCE(?, password),              
                full_name = COALESCE(?, full_name),              
                role = COALESCE(?, role)
              WHERE id = ? AND is_active = 1`,
        )
        .run(
          data.username ?? null,
          data.password ?? null,
          data.full_name ?? null,
          data.role ?? null,
          id,
        );

      return this.findById(id);
    } catch (err: any) {
      throw new DatabaseError(`Gagal update user ID ${id}`, err);
    }
  }

  /**
   * Soft delete set is active 0.
   * @throws NotFoundError jika user tidak ditemukan
   */
  delete(id: number): void {
    // Pastikan ada
    this.findById(id);

    this.db
      .prepare(
        "UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND is_active = 1",
      )
      .run(id);
  }

  /**
   * Search username berdasarkan nama dan fullname
   */
  search(keyword: string): User[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM users
             WHERE is_active = 1 
             AND (username LIKE ? OR full_name LIKE ?)
             ORDER BY username`,
      )
      .all(`%${keyword}%`, `%${keyword}%`) as any[];

    return rows.map((row) => this.mapToUser(row));
  }

  /**
   * Mapping dari database row ke domain object User.
   */
  private mapToUser(row: any): User {
    switch (row.role) {
      case "ADMIN":
        return new Admin(row.id, row.username, row.password, row.full_name);

      case "CASHIER":
        return new Cashier(row.id, row.username, row.password, row.full_name);

      default:
        throw new Error("Role tidak valid");
    }
  }
}
