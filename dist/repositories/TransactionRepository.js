"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class TransactionRepository extends BaseRepository_1.BaseRepository {
    /**.
     * Search transaksi berdasarkan kode transaksi.
     * Implementasi abstract method dari BaseRepository.
     */
    search(keyword) {
        const lower = keyword.toLowerCase();
        return this.items.filter((t) => t.code.toLowerCase().includes(lower));
    }
    // Cari transaksi berdasarkan tanggal format "DD/MM/YYYY"
    findByDate(date) {
        return this.items.filter((t) => t.formattedDate === date);
    }
    // Cari transaksi berdasarkan user kasir (userId) yang melakukan transaksi
    findByUserId(userId) {
        return this.items.filter((t) => t.userId === userId);
    }
    // Cari transaksi berdasarkan status
    findByStatus(status) {
        return this.items.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }
}
exports.TransactionRepository = TransactionRepository;
