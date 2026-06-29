"use strict";
/**
 * Base error class untuk semua error di aplikasi
 * Extends native Error dan menambahkan status code
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        // Fix prototype chain penting di TypeScript
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
/**
 * Error saat resource tidak ditemukan.
 * Contoh: product dengan ID tertentu tidak ada di database.
 */
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Error saat validasi data gagal.
 * Contoh: SKU sudah dipakai, harga negatif, dll.
 */
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
/**
 * Error saat operasi database gagal.
 * Menyimpan original error untuk debugging.
 */
class DatabaseError extends AppError {
    originalError;
    constructor(message, originalError) {
        super(message, 500);
        this.originalError = originalError;
    }
}
exports.DatabaseError = DatabaseError;
