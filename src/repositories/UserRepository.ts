import { User } from "../models/User";
import { BaseRepository } from "./BaseRepository";

export class UserRepository extends BaseRepository<User> {
  /**.
   * Search user berdasarkan username atau nama lengkap.
   * Implementasi abstract method dari BaseRepository.
   */
  search(keyword: string): User[] {
    const lower = keyword.toLowerCase();
    return this.items.filter(
      (u) =>
        u.username.toLowerCase().includes(lower) ||
        u.fullName.toLowerCase().includes(lower),
    );
  }

  // Cari user berdasarkan username
  findByUsername(username: string): User | undefined {
    return this.items.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
  }

  // Cari user berdasarkan role
  findByRole(role: string): User[] {
    return this.items.filter(
      (u) => u.getRole().toLowerCase() === role.toLowerCase(),
    );
  }
}
