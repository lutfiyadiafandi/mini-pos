"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const User_js_1 = require("../models/User.js");
const connection_js_1 = require("../database/connection.js");
const AppError_js_1 = require("../errors/AppError.js");
class UserRepository {
    db;
    constructor() {
        this.db = connection_js_1.DatabaseConnection.getInstance();
    }
    /*
     * Ambil semua user aktif.
     */
    findAll() {
        const rows = this.db
            .prepare("SELECT * FROM users ORDER BY username")
            .all();
        return rows.map((row) => this.mapToUser(row));
    }
    /**
     * Cari user berdasarkan ID.
     * @throws NotFoundError jika user tidak ditemukan
     */
    findById(id) {
        const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        if (!row) {
            throw new AppError_js_1.NotFoundError(`User dengan ID ${id} tidak ditemukan`);
        }
        return this.mapToUser(row);
    }
    /**
     * Cari user berdasarkan username.
     * @throws NotFoundError jika user tidak ditemukan
     */
    findByUsername(username) {
        const row = this.db
            .prepare("SELECT * FROM users WHERE username = ?")
            .get(username);
        if (!row) {
            throw new AppError_js_1.NotFoundError(`User dengan username ${username} tidak ditemukan`);
        }
        return this.mapToUser(row);
    }
    /**
     * Buat user baru.
     * @throws DatabaseError jika operasi database gagal
     */
    create(data) {
        try {
            const result = this.db
                .prepare(`INSERT INTO users (username, password, full_name, role)
                 VALUES (?, ?, ?, ?)`)
                .run(data.username, data.password, data.full_name, data.role);
            return this.findById(result.lastInsertRowid);
        }
        catch (err) {
            throw new AppError_js_1.DatabaseError("Gagal menyimpan user", err);
        }
    }
    /**
     * Update data user.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    update(id, data) {
        // Pastikan user ada
        this.findById(id);
        try {
            this.db
                .prepare(`UPDATE users SET
                username = COALESCE(?, username),              
                password = COALESCE(?, password),              
                full_name = COALESCE(?, full_name),              
                role = COALESCE(?, role)
              WHERE id = ?`)
                .run(data.username ?? null, data.password ?? null, data.full_name ?? null, data.role ?? null, id);
            return this.findById(id);
        }
        catch (err) {
            throw new AppError_js_1.DatabaseError(`Gagal update user ID ${id}`, err);
        }
    }
    /**
     * Mapping dari database row ke domain object User.
     */
    mapToUser(row) {
        return new User_js_1.User(row.id, row.username, row.password, row.full_name);
    }
}
exports.UserRepository = UserRepository;
