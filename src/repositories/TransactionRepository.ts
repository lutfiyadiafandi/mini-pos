import { Transaction } from "../models/Transaction";
import { BaseRepository } from "./BaseRepository";

export class TransactionRepository extends BaseRepository<Transaction> {
  /**.
   * Search transaksi berdasarkan kode transaksi.
   * Implementasi abstract method dari BaseRepository.
   */
  search(keyword: string): Transaction[] {
    const lower = keyword.toLowerCase();
    return this.items.filter((t) => t.code.toLowerCase().includes(lower));
  }

  // Cari transaksi berdasarkan tanggal format "DD/MM/YYYY"
  findByDate(date: string): Transaction[] {
    return this.items.filter((t) => t.formattedDate === date);
  }

  // Cari transaksi berdasarkan user kasir (userId) yang melakukan transaksi
  findByUserId(userId: number): Transaction[] {
    return this.items.filter((t) => t.userId === userId);
  }

  // Cari transaksi berdasarkan status
  findByStatus(status: string): Transaction[] {
    return this.items.filter(
      (t) => t.status.toLowerCase() === status.toLowerCase(),
    );
  }
}
