import Database from "better-sqlite3";
import { User } from "../models/User.js";
import { DatabaseConnection } from "../database/connection.js";
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "../errors/AppError.js";

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
      .prepare("SELECT * FROM users ORDER BY username")
      .all() as any[];

    return rows.map((row) => this.mapToUser(row));
  }

  /**
   * Cari user berdasarkan ID.
   * @throws NotFoundError jika user tidak ditemukan
   */
  findById(id: number): User {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | any
      | undefined;
    if (!row) {
      throw new NotFoundError(`User dengan ID ${id} tidak ditemukan`);
    }

    return this.mapToUser(row);
  }

  /**
   * Cari user berdasarkan username.
   * @throws NotFoundError jika user tidak ditemukan
   */
  findByUsername(username: string): User {
    const row = this.db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as any | undefined;
    if (!row) {
      throw new NotFoundError(
        `User dengan username ${username} tidak ditemukan`,
      );
    }
    return this.mapToUser(row);
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
              WHERE id = ?`,
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
   * Mapping dari database row ke domain object User.
   */
  private mapToUser(row: any): User {
    return new User(row.id, row.username, row.password, row.full_name);
  }
}
