"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    items = [];
    /**
     * Menambahkan item baru ke repository.
     */
    add(item) {
        // Cek duplikasi
        if (this.items.some((existing) => existing.id === item.id)) {
            throw new Error(`Item dengan ID ${item.id} sudah ada`);
        }
        this.items.push(item);
    }
    /**
     * Mengganti item yang sudah ada di repository.
     */
    update(item) {
        // Cek apakah item ditemukan
        const index = this.items.findIndex((existing) => existing.id === item.id);
        if (index === -1) {
            throw new Error(`Item dengan ID ${item.id} tidak ditemukan`);
        }
        this.items[index] = item;
    }
    /**
     * Mencari item berdasarkan ID.
     * Returns the item jika ditemukan, undefined jika tidak.
     */
    findById(id) {
        return this.items.find((item) => item.id === id);
    }
    /**
     * Mengambil semua items.
     * Mengembalikan copy array untuk mencegah modifikasi lansung
     */
    getAll() {
        return [...this.items];
    }
    /**
     * Menghapus item berdasarkan ID.
     * Returns true jika item berhasil dihapus, false jika tidak ditemukan.
     */
    delete(id) {
        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1)
            return false; // Item tidak ditemukan
        this.items.splice(index, 1); // Hapus item
        return true;
    }
    /**
     * Menghitung jumlah item dalam repository.
     */
    count() {
        return this.items.length;
    }
}
exports.BaseRepository = BaseRepository;
