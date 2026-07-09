import { BrowserAPI } from "../utils/BrowserAPI.js";
import { AuthView } from "../views/AuthView.js";
import { navigate, refreshUserUI, updateLayout } from "../utils/PageLoad.js";

export class AuthController {
  private api: BrowserAPI;
  private view: AuthView;

  constructor() {
    this.api = new BrowserAPI();

    this.view = new AuthView((username, password) =>
      this.handleLogin(username, password),
    );

    if (this.getCurrentUser()) {
      refreshUserUI();
      updateLayout();
      navigate("dashboard");
      return;
    }
  }

  // Login
  private async handleLogin(username: string, password: string): Promise<void> {
    this.view.setLoading(true);

    try {
      const result = await this.api.login({
        username,
        password,
      });

      if (!result.success) {
        this.view.showError(result.error);
        return;
      }

      sessionStorage.setItem("currentUser", JSON.stringify(result.data));

      refreshUserUI();
      updateLayout();

      this.view.showSuccess(`Selamat datang, ${result.data.fullName}!`);
      setTimeout(() => {
        navigate("dashboard");
      }, 700);
    } catch (err) {
      console.error(err);
      this.view.showError("Tidak dapat terhubung ke server.");
    } finally {
      this.view.setLoading(false);
    }
  }

  // Logout dan hapus current user
  logout() {
    sessionStorage.removeItem("currentUser");
    updateLayout();
    navigate("login");
  }

  // Ambil user yang sedang login
  getCurrentUser() {
    const user = sessionStorage.getItem("currentUser");

    return user ? JSON.parse(user) : null;
  }

  // Cek apakah sudah ada user yang login
  isLoggedIn(): boolean {
    return sessionStorage.getItem("currentUser") != null;
  }
}
