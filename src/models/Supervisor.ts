import { User } from "./User";

export class Supervisor extends User {
  /**
   * Daftar fitur yang bisa diakses oleh Supervisor.
   * Static karena berlaku untuk semua instance Supervisor.
   */
  private static ALLOWED_FEATURES = [
    "transaction",
    "view_products",
    "view_categories",
    "view_reports",
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
    return Supervisor.ALLOWED_FEATURES;
  }

  override getRole(): string {
    return "SUPERVISOR";
  }

  /**
   * Supervisor hanya punya akses ke fitur yang ada di ALLOWED_FEATURES.
   */
  override hasAccess(feature: string): boolean {
    return Supervisor.ALLOWED_FEATURES.includes(feature);
  }
}
