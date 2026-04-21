import { User } from "./User";

export class Admin extends User {
  constructor(
    id: number,
    username: string,
    password: string,
    fullName: string,
  ) {
    super(id, username, password, fullName);
  }

  getPermissionsList(): string[] {
    return [
      "manage_users",
      "transaction",
      "view_products",
      "view_categories",
      "view_reports",
    ];
  }

  /**
   * Admin selalu return "ADMIN".
   */
  override getRole(): string {
    return "ADMIN";
  }

  /**
   * Admin punya akses ke SEMUA fitur.
   */
  override hasAccess(_feature: string): boolean {
    return true;
  }

  override toString(): string {
    const status = this.isActive ? "Active" : "Inactive";
    return `[SUPER${this.getRole()}#${this.id}] ${this.username} (${this.fullName}) | ${status}`;
  }
}
