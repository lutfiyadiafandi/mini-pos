"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const BaseModel_1 = require("./BaseModel");
class User extends BaseModel_1.BaseModel {
    _username;
    _password;
    _fullName;
    _isActive = true;
    constructor(id, username, password, fullName) {
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
    get username() {
        return this._username;
    }
    get fullName() {
        return this._fullName;
    }
    get isActive() {
        return this._isActive;
    }
    // Setter
    set fullName(value) {
        if (!value || value.trim().length === 0) {
            throw new Error("Nama lengkap tidak boleh kosong");
        }
        this._fullName = value.trim();
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
     * Method yang akan di override oleh subclass.
     * Base User tidak punya role spesifik.
     */
    getRole() {
        return "USER";
    }
    /**
     * Method yang akan di override oleh subclass.
     * Base User tidak punya akses ke fitur apapun.
     */
    hasAccess(feature) {
        return false;
    }
    toString() {
        const status = this._isActive ? "Active" : "Inactive";
        return `[${this.getRole()}#${this._id}] ${this._username} (${this._fullName}) | ${status}`;
    }
}
exports.User = User;
