import { User } from "./User";

export class Cashier extends User {
  /**
   * Daftar fitur yang bisa diakses oleh Cashier.
   * Static karena berlaku untuk semua instance Cashier.
   */
  private static ALLOWED_FEATURES = [
    "transaction",
    "view_products",
    "view_categories",
  ];

  constructor(
    id: number,
    username: string,
    password: string,
    fullName: string,
  ) {
    super(id, username, password, fullName);
  }

  getPermissionsList(): string[] {
    return Cashier.ALLOWED_FEATURES;
  }

  override getRole(): string {
    return "CASHIER";
  }

  /**
   * Cashier hanya punya akses ke fitur yang ada di ALLOWED_FEATURES.
   */
  override hasAccess(feature: string): boolean {
    return Cashier.ALLOWED_FEATURES.includes(feature);
  }
}
