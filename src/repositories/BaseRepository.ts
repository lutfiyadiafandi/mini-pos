import { BaseModel } from "../models/BaseModel";

export abstract class BaseRepository<T extends BaseModel> {
  protected items: T[] = [];

  /**
   * Menambahkan item baru ke repository.
   */
  add(item: T): void {
    // Cek duplikasi
    if (this.items.some((existing) => existing.id === item.id)) {
      throw new Error(`Item dengan ID ${item.id} sudah ada`);
    }
    this.items.push(item);
  }

  /**
   * Mengganti item yang sudah ada di repository.
   */
  update(item: T): void {
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
  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * Mengambil semua items.
   * Mengembalikan copy array untuk mencegah modifikasi lansung
   */
  getAll(): T[] {
    return [...this.items];
  }

  /**
   * Menghapus item berdasarkan ID.
   * Returns true jika item berhasil dihapus, false jika tidak ditemukan.
   */
  delete(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false; // Item tidak ditemukan
    this.items.splice(index, 1); // Hapus item
    return true;
  }

  /**
   * Menghitung jumlah item dalam repository.
   */
  count(): number {
    return this.items.length;
  }

  /**
   * Abstract method - HARUS diimplementasikan oleh setiap subclass.
   * Setiap Entity punya cara search yang berbeda
   */
  abstract search(query: string): T[];
}
