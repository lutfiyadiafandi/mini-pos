import Database from "better-sqlite3";
import { Customer, MembershipTierName } from "../models/Customer.js";
import { DatabaseConnection } from "../database/connection.js";
import {
  NotFoundError,
  ValidationError,
  DatabaseError,
} from "../errors/AppError.js";

export class CustomerRepository {
  private db: Database.Database;
  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Ambil semua customer aktif.
   */
  findAll(): Customer[] {
    const rows = this.db
      .prepare("SELECT * FROM customers WHERE is_active = 1 ORDER BY name")
      .all() as any[];

    return rows.map((row) => this.mapToCustomer(row));
  }

  /**
   * Cari customer berdasarkan ID.
   * @throws NotFoundError jika customer tidak ditemukan
   */
  findById(id: number): Customer {
    const row = this.db
      .prepare("SELECT * FROM customers WHERE id = ? AND is_active = 1")
      .get(id) as any | undefined;

    if (!row) {
      throw new NotFoundError(`Customer dengan ID ${id} tidak ditemukan`);
    }

    return this.mapToCustomer(row);
  }

  /**
   * Cari customer berdasarkan nomor HP (dipakai untuk cek duplikat).
   * Mengembalikan undefined jika tidak ditemukan (bukan throw),
   * karena "tidak ada" adalah hasil valid untuk pengecekan duplikat.
   */
  findByPhone(phone: string): Customer | undefined {
    const row = this.db
      .prepare("SELECT * FROM customers WHERE phone = ? AND is_active = 1")
      .get(phone) as any | undefined;

    return row ? this.mapToCustomer(row) : undefined;
  }

  /**
   * Buat customer baru.
   * @throws ValidationError jika nomor HP sudah dipakai
   * @throws DatabaseError jika operasi database gagal
   */
  create(data: {
    name: string;
    phone: string;
    email?: string | null;
  }): Customer {
    const existing = this.findByPhone(data.phone);
    if (existing) {
      throw new ValidationError(`Nomor HP ${data.phone} sudah terdaftar`);
    }

    try {
      const result = this.db
        .prepare(
          `INSERT INTO customers (name, phone, email, tier, points, total_spending)
           VALUES (?, ?, ?, 'REGULAR', 0, 0)`,
        )
        .run(data.name, data.phone, data.email ?? null);

      return this.findById(result.lastInsertRowid as number);
    } catch (err: any) {
      throw new DatabaseError("Gagal menyimpan customer", err);
    }
  }

  /**
   * Update data customer (partial update, field yang tidak diisi tidak berubah).
   * @throws NotFoundError jika customer tidak ditemukan
   */
  update(
    id: number,
    data: {
      name?: string;
      phone?: string;
      email?: string | null;
      tier?: MembershipTierName;
      points?: number;
      totalSpending?: number;
    },
  ): Customer {
    // Pastikan customer ada
    this.findById(id);

    try {
      this.db
        .prepare(
          `UPDATE customers SET
              name = COALESCE(?, name),
              phone = COALESCE(?, phone),
              email = COALESCE(?, email),
              tier = COALESCE(?, tier),
              points = COALESCE(?, points),
              total_spending = COALESCE(?, total_spending),
              updated_at = datetime('now')
           WHERE id = ? AND is_active = 1`,
        )
        .run(
          data.name ?? null,
          data.phone ?? null,
          data.email ?? null,
          data.tier ?? null,
          data.points ?? null,
          data.totalSpending ?? null,
          id,
        );

      return this.findById(id);
    } catch (err: any) {
      throw new DatabaseError(`Gagal update customer ID ${id}`, err);
    }
  }

  /**
   * Soft delete set is_active 0.
   * @throws NotFoundError jika customer tidak ditemukan
   */
  delete(id: number): void {
    // Pastikan ada
    this.findById(id);

    this.db
      .prepare(
        "UPDATE customers SET is_active = 0, updated_at = datetime('now') WHERE id = ? AND is_active = 1",
      )
      .run(id);
  }

  /**
   * Cari customer berdasarkan nama atau nomor HP.
   */
  search(keyword: string): Customer[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM customers
         WHERE is_active = 1
         AND (name LIKE ? OR phone LIKE ?)
         ORDER BY name`,
      )
      .all(`%${keyword}%`, `%${keyword}%`) as any[];

    return rows.map((row) => this.mapToCustomer(row));
  }

  /**
   * Mapping dari database row ke domain object Customer.
   */
  private mapToCustomer(row: any): Customer {
    return new Customer(
      row.id,
      row.name,
      row.phone,
      row.email,
      row.tier,
      row.points,
      row.total_spending,
    );
  }
}
