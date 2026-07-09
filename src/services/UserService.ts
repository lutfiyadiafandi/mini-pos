import { User } from "../models/User.js";
import { UserRepository } from "../repositories/UserRepository.js";
import { ValidationError } from "../errors/AppError.js";
import { createHash } from "crypto";

/**
 * Service layer untuk User.
 * Business rules divalidasi di sini, BUKAN di repository.
 *
 * Repository bertanggung jawab: "bagaimana menyimpan/mengambil data?"
 * Service bertanggung jawab: "apakah operasi ini valid secara bisnis?"
 */
export class UserService {
  /**
   * Constructor Injection repository diberikan dari luar.
   * Ini memudahkan testing (bisa inject mock repository).
   */
  constructor(private userRepo: UserRepository) {}

  getAllUsers(): User[] {
    return this.userRepo.findAll();
  }

  getUserById(id: number): User {
    return this.userRepo.findById(id);
  }

  searchUser(keyword: string): User[] {
    if (keyword || keyword.trim().length === 0) {
      return this.userRepo.findAll();
    }
    return this.userRepo.search(keyword.trim());
  }

  createUser(data: {
    username: string;
    password: string;
    full_name: string;
    role: string;
  }): User {
    // Business validation #2: Cek apakah username sudah dipakai
    const existing = this.userRepo.findByUsername(data.username);
    if (existing) {
      throw new ValidationError(
        `Username ${data.username} sudah digunakan oleh user lain`,
      );
    }

    // Business validation #3: Validasi data
    if (!data.username || data.username.trim().length === 0)
      throw new ValidationError("Nama username tidak boleh kosong");
    if (!data.full_name || data.full_name.trim().length === 0)
      throw new ValidationError("Nama lengkap tidak boleh kosong");
    if (!data.password || data.password.length < 6)
      throw new ValidationError("Password minimal 6 karakter");
    if (!data.role || (data.role !== "ADMIN" && data.role !== "CASHIER")) {
      throw new ValidationError("Role harus antara Admin dan Kasir");
    }

    data.password = this.hashPassword(data.password);

    return this.userRepo.create(data);
  }

  updateUser(
    id: number,
    data: {
      username?: string;
      password?: string;
      full_name?: string;
      role?: string;
    },
  ): User {
    // Business validation #2: Cek apakah username sudah dipakai
    if (data.username) {
      const existing = this.userRepo.findByUsername(data.username);

      if (existing && existing.id !== id) {
        throw new ValidationError(
          `Username ${data.username} sudah digunakan oleh user lain`,
        );
      }
    }

    // Business validation #3: Validasi data
    if (data.full_name && data.full_name.trim() === "") {
      throw new ValidationError("Nama lengkap tidak boleh kosong");
    }
    // Password bersifat opsional saat edit
    if (data.password !== undefined) {
      if (data.password.trim() === "") {
        delete data.password;
      } else {
        if (data.password.length < 6) {
          throw new ValidationError("Password minimal 6 karakter");
        }

        data.password = this.hashPassword(data.password);
      }
    }
    if (data.role && data.role !== "ADMIN" && data.role !== "CASHIER") {
      throw new ValidationError("Role tidak valid");
    }

    return this.userRepo.update(id, data);
  }

  deleteUser(id: number): void {
    this.userRepo.delete(id);
  }

  /**
   * Hash Password dengan SHA-256
   */
  hashPassword(plain: string): string {
    return createHash("sha256").update(plain).digest("hex");
  }
}
