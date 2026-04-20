export class User {
  private _id: number;
  private _username: string;
  private _password: string;
  private _fullname: string;
  private _role: string;
  private _isActive: boolean = true;
  private _createdAt: Date;

  // Role yang valid - bisa diperluas nanti
  private static VALID_ROLES = ["ADMIN", "CASHIER"];

  constructor(
    id: number,
    username: string,
    password: string,
    fullname: string,
    role: string,
  ) {
    if (id < 0) throw new Error("ID tidak boleh negatif");
    if (!username || username.trim().length === 0) {
      throw new Error("Username tidak boleh kosong");
    }
    if (username.trim().length < 3) {
      throw new Error("Username minimal 3 karakter");
    }
    if (!password || password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }
    if (!fullname || fullname.trim().length === 0) {
      throw new Error("Nama lengkap tidak boleh kosong");
    }
    if (!User.VALID_ROLES.includes(role.toUpperCase())) {
      throw new Error(
        `Role tidak valid. Pilihan: ${User.VALID_ROLES.join(", ")}`,
      );
    }

    this._id = id;
    this._username = username.trim().toLowerCase();
    this._password = password;
    this._fullname = fullname.trim();
    this._role = role.toUpperCase();
    this._createdAt = new Date();
  }

  // Getter
  get id(): number {
    return this._id;
  }
  get username(): string {
    return this._username;
  }
  get fullname(): string {
    return this._fullname;
  }
  get role(): string {
    return this._role;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get createdAt(): Date {
    return this._createdAt;
  }

  // Setter
  set fullname(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Nama lengkap tidak boleh kosong");
    }
  }

  // Business Method
  /**
   * Verifikasi password - satu satunya cara mengecek password dari luar
   */
  verifyPassword(inputPassword: string): boolean {
    return this._password === inputPassword;
  }

  /**
   * Ganti password dengan validasi password lama
   */
  changePassword(oldPassword: string, newPassword: string): void {
    if (!this.verifyPassword(oldPassword)) {
      throw new Error("Password lama salah");
    }
    if (newPassword.length < 6) {
      throw new Error("Password baru minimal 6 karakter");
    }
    if (oldPassword === newPassword) {
      throw new Error("Password baru harus berbeda dari password lama");
    }
    this._password = newPassword;
  }

  /**
   * Deactivate user (soft delete)
   */
  deactivate(): void {
    this._isActive = false;
  }

  /**
   * Cek apakah user punya akses ke fitur tertentu.
   * Untuk saat ini, sederhana Admin bisa semua, Cashier terbatas.
   */
  hasAccess(feature: string): boolean {
    if (this._role === "ADMIN") return true;
    const cashierFeatures = ["transaction", "view_products"];
    return cashierFeatures.includes(feature);
  }

  toString(): string {
    const status = this._isActive ? "Active" : "Inactive";
    return (
      `[User#${this._id}] ${this._username} (${this._fullname}) | ` +
      `Role: ${this._role} | ${status}`
    );
  }
}
