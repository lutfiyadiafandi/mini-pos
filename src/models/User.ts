import { BaseModel } from "./BaseModel";

export class User extends BaseModel {
  private _username: string;
  private _password: string;
  private _fullName: string;
  private _isActive: boolean = true;

  constructor(
    id: number,
    username: string,
    password: string,
    fullName: string,
  ) {
    super(id);

    if (!username || username.trim().length < 3) {
      throw new Error("Username tidak boleh kosong dan minimal 3 karakter");
    }
    if (!password || password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }
    if (!fullName || fullName.trim().length === 0) {
      throw new Error("Nama lengkap tidak boleh kosong");
    }

    this._username = username.trim().toLowerCase();
    this._password = password;
    this._fullName = fullName.trim();
  }

  // Getter
  get username(): string {
    return this._username;
  }
  get fullName(): string {
    return this._fullName;
  }
  get isActive(): boolean {
    return this._isActive;
  }

  // Setter
  set fullName(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Nama lengkap tidak boleh kosong");
    }
    this._fullName = value.trim();
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
   * Method yang akan di override oleh subclass.
   * Base User tidak punya role spesifik.
   */
  getRole(): string {
    return "USER";
  }

  /**
   * Method yang akan di override oleh subclass.
   * Base User tidak punya akses ke fitur apapun.
   */
  hasAccess(feature: string): boolean {
    return false;
  }

  override toString(): string {
    const status = this._isActive ? "Active" : "Inactive";
    return `[${this.getRole()}#${this._id}] ${this._username} (${this._fullName}) | ${status}`;
  }
}
