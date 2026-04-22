"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class UserRepository extends BaseRepository_1.BaseRepository {
    /**.
     * Search user berdasarkan username atau nama lengkap.
     * Implementasi abstract method dari BaseRepository.
     */
    search(keyword) {
        const lower = keyword.toLowerCase();
        return this.items.filter((u) => u.username.toLowerCase().includes(lower) ||
            u.fullName.toLowerCase().includes(lower));
    }
    // Cari user berdasarkan username
    findByUsername(username) {
        return this.items.find((u) => u.username.toLowerCase() === username.toLowerCase());
    }
    // Cari user berdasarkan role
    findByRole(role) {
        return this.items.filter((u) => u.getRole().toLowerCase() === role.toLowerCase());
    }
}
exports.UserRepository = UserRepository;
