import { Category } from "../models/Category";
import { BaseRepository } from "./BaseRepository";

export class CategoryRepository extends BaseRepository<Category> {
  /**
   * Search kategori berdasarkan nama.
   * Implementasi abstract method dari BaseRepository.
   */
  search(keyword: string): Category[] {
    const lower = keyword.toLowerCase();
    return this.items.filter((c) => c.name.toLowerCase().includes(lower));
  }

  // Cari kategori berdasarkan nama (case-insensitive)
  findByName(name: string): Category | undefined {
    return this.items.find((c) => c.name.toLowerCase() === name.toLowerCase());
  }
}
