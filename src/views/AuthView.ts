export class AuthView {
  private form: HTMLFormElement;
  private usernameInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private loginButton: HTMLButtonElement;
  private messageDiv: HTMLDivElement;

  constructor(private onLogin: (username: string, password: string) => void) {
    this.form = document.querySelector("#login-form")!;
    this.usernameInput = document.querySelector("#login-username")!;
    this.passwordInput = document.querySelector("#login-password")!;
    this.loginButton = document.querySelector("#btn-login")!;
    this.messageDiv = document.querySelector("#login-message")!;

    this.bindEvents();
  }

  /**
   * Event tombol login
   */
  private bindEvents(): void {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      this.onLogin(this.usernameInput.value.trim(), this.passwordInput.value);
    });
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loginButton.disabled = loading;

    this.loginButton.textContent = loading ? "Login..." : "Login";
  }

  /**
   * Success message
   */
  showSuccess(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-green-500, green)";

    setTimeout(() => {
      this.messageDiv.style.display = "none";
    }, 3000);
  }

  /**
   * Error message
   */
  showError(message: string): void {
    this.messageDiv.textContent = message;
    this.messageDiv.style.display = "block";
    this.messageDiv.style.color = "var(--pico-color-red-500, red)";

    setTimeout(() => {
      this.messageDiv.style.display = "none";
    }, 4000);
  }

  clear(): void {
    this.form.reset();
    this.usernameInput.focus();
  }
}
