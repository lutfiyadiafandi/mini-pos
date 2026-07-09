import { User } from "../models/User.js";
import { ValidationError } from "../errors/AppError.js";
import Database from "better-sqlite3";
import { DatabaseConnection } from "../database/connection.js";
import { createHash } from "crypto";
import { Admin } from "../models/Admin.js";
import { Cashier } from "../models/Cashier.js";

/**
 * Service untuk autentikasi user.
 * Untuk saat ini menggunakan plain text password comparison.
 * Di production, gunakan hashing (SHA-256 atau berypt).
 */
export class AuthService {
  private db: Database.Database;
  private currentUser: User | null = null;
  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Login user dengan username dan password.
   * @throws ValidationError jika credentials tidak valid
   */
  login(username: string, password: string): User {
    if (!username || !password) {
      throw new ValidationError("Username dan password harus diisi");
    }

    const row = this.db
      .prepare("SELECT * FROM users WHERE username = ? AND is_active = 1")
      .get(username.toLowerCase()) as any | undefined;

    if (!row) {
      throw new ValidationError("Username atau password salah");
    }

    // Verifikasi password dengan SHA-256
    const hashedInputPassword = this.hashPassword(password);
    if (row.password !== hashedInputPassword) {
      throw new ValidationError("Username atau password salah");
    }

    // Buat User object sesuai role
    let user: User;

    switch (row.role) {
      case "ADMIN":
        user = new Admin(row.id, row.username, row.password, row.full_name);
        break;

      case "CASHIER":
        user = new Cashier(row.id, row.username, row.password, row.full_name);
        break;

      default:
        throw new Error("Role tidak dikenali");
    }

    this.currentUser = user;
    return user;
  }

  /**
   * Logout reset current user.
   */
  logout(): void {
    this.currentUser = null;
  }

  /**
   * Ambil user yang sedang login.
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Cek apakah sudah ada user yang login.
   */
  isLoggedIn(): boolean {
    return this.currentUser != null;
  }

  /**
   * Hash Password dengan SHA-256
   */
  hashPassword(plain: string): string {
    return createHash("sha256").update(plain).digest("hex");
  }
}
