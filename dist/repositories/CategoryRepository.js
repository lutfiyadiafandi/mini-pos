"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class CategoryRepository extends BaseRepository_1.BaseRepository {
    /**
     * Search kategori berdasarkan nama.
     * Implementasi abstract method dari BaseRepository.
     */
    search(keyword) {
        const lower = keyword.toLowerCase();
        return this.items.filter((c) => c.name.toLowerCase().includes(lower));
    }
    // Cari kategori berdasarkan nama (case-insensitive)
    findByName(name) {
        return this.items.find((c) => c.name.toLowerCase() === name.toLowerCase());
    }
}
exports.CategoryRepository = CategoryRepository;
