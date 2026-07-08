import { ProductController } from "./controllers/ProductController.js";
import { CategoryController } from "./controllers/CategoryController.js";
import { DashboardController } from "./controllers/DashboardController.js";
import { TransactionController } from "./controllers/TransactionController.js";
import { ReportController } from "./controllers/ReportController.js";
import { AuthController } from "./controllers/AuthController.js";
import {
  loadPageContent,
  registerPageLoader,
  updateLayout,
} from "./utils/PageLoader.js";

// =====================================================================
// PAGE INITIALIZER
// Setiap halaman memiliki logic masing-masing.
// =====================================================================

const pageInitializers: Record<string, () => void> = {
  dashboard: () => new DashboardController(),

  products: () => new ProductController(),

  categories: () => new CategoryController(),

  transactions: () => new TransactionController(),

  reports: () => new ReportController(),

  login: () => new AuthController(),
};

// =====================================================================
// PAGE LOADER
// =====================================================================

const mainContent = document.querySelector<HTMLElement>("#main-content")!;
async function loadPage(page: string) {
  await loadPageContent(page, mainContent);

  pageInitializers[page]?.();
}
registerPageLoader(loadPage);

// =====================================================================
// SIDEBAR NAVIGATION
// =====================================================================

const navLinks = document.querySelectorAll<HTMLAnchorElement>("[data-page]");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    loadPage(link.dataset.page!);
  });
});

// User info
const userInfo = document.querySelector<HTMLElement>("#user-info")!;
const currentUser = sessionStorage.getItem("currentUser");
if (currentUser) {
  userInfo.textContent = JSON.parse(currentUser).username;
}

// HandleLogout
const logoutBtn = document.querySelector<HTMLButtonElement>("#btn-logout");

logoutBtn?.addEventListener("click", () => {
  sessionStorage.removeItem("currentUser");
  updateLayout();
  loadPage("login");
});

// =====================================================================
// START APPLICATION
// =====================================================================
updateLayout();

if (sessionStorage.getItem("currentUser")) {
  loadPage("dashboard");
} else {
  loadPage("login");
}
