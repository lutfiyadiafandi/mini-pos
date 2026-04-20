"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    _id;
    _username;
    _password;
    _fullname;
    _role;
    _isActive = true;
    _createdAt;
    // Role yang valid - bisa diperluas nanti
    static VALID_ROLES = ["ADMIN", "CASHIER"];
    constructor(id, username, password, fullname, role) {
        if (id < 0)
            throw new Error("ID tidak boleh negatif");
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
            throw new Error(`Role tidak valid. Pilihan: ${User.VALID_ROLES.join(", ")}`);
        }
        this._id = id;
        this._username = username.trim().toLowerCase();
        this._password = password;
        this._fullname = fullname.trim();
        this._role = role.toUpperCase();
        this._createdAt = new Date();
    }
    // Getter
    get id() {
        return this._id;
    }
    get username() {
        return this._username;
    }
    get fullname() {
        return this._fullname;
    }
    get role() {
        return this._role;
    }
    get isActive() {
        return this._isActive;
    }
    get createdAt() {
        return this._createdAt;
    }
    // Setter
    set fullname(value) {
        if (!value || value.trim().length === 0) {
            throw new Error("Nama lengkap tidak boleh kosong");
        }
    }
    // Business Method
    /**
     * Verifikasi password - satu satunya cara mengecek password dari luar
     */
    verifyPassword(inputPassword) {
        return this._password === inputPassword;
    }
    /**
     * Ganti password dengan validasi password lama
     */
    changePassword(oldPassword, newPassword) {
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
    deactivate() {
        this._isActive = false;
    }
    /**
     * Cek apakah user punya akses ke fitur tertentu.
     * Untuk saat ini, sederhana Admin bisa semua, Cashier terbatas.
     */
    hasAccess(feature) {
        if (this._role === "ADMIN")
            return true;
        const cashierFeatures = ["transaction", "view_products"];
        return cashierFeatures.includes(feature);
    }
    toString() {
        const status = this._isActive ? "Active" : "Inactive";
        return (`[User#${this._id}] ${this._username} (${this._fullname}) | ` +
            `Role: ${this._role} | ${status}`);
    }
}
exports.User = User;
