"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Singleton class untuk koneksi database SQLite.
 * Memastikan hanya ada SATU koneksi database di seluruh aplikasi.
 */
class DatabaseConnection {
    static instance = null;
    /**
     * Private constructor tidak bisa di-instantiate dari luar.
     * Ini adalah ciri khas Singleton pattern.
     */
    constructor() { }
    /**
     * Mendapatkan instance koneksi database.
     * Jika belum ada, buat baru. Jika sudah ada, kembalikan yang sama.
     */
    static getInstance(dbPath = "pos.db") {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new better_sqlite3_1.default(dbPath);
            // Aktifkan WAL mode untuk performa yang lebih baik
            DatabaseConnection.instance.pragma("journal_mode = WAL");
            // Aktifkan foreign key constraints
            DatabaseConnection.instance.pragma("foreign_keys = ON");
            console.log(`[DB] Connected to ${dbPath}`);
        }
        return DatabaseConnection.instance;
    }
    /**
     * Inisialisasi database: jalankan schema dan seed.
     */
    static initialize(dbPath = "pos.db") {
        const db = DatabaseConnection.getInstance(dbPath);
        // Baca file SQL
        // const _dirname = dirname(fileURLToPath(import.meta.url));
        const _dirname = __dirname;
        const schemaSQL = (0, fs_1.readFileSync)((0, path_1.join)(_dirname, "schema.sql"), "utf-8");
        const seedSQL = (0, fs_1.readFileSync)((0, path_1.join)(_dirname, "seed.sql"), "utf-8");
        // Jalankan dalam transaction untuk atomicity
        db.exec(schemaSQL);
        db.exec(seedSQL);
        console.log("[DB] Schema created and data seeded");
    }
    /**
     * Menutup koneksi database.
     */
    static close() {
        if (DatabaseConnection.instance) {
            DatabaseConnection.instance.close();
            DatabaseConnection.instance = null;
            console.log("[DB] Connection closed");
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
