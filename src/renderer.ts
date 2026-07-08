import { ProductController } from "./controllers/ProductController.js";
import { CategoryController } from "./controllers/CategoryController.js";
import { DashboardController } from "./controllers/DashboardController.js";
import { TransactionController } from "./controllers/TransactionController.js";
import { ReportController } from "./controllers/ReportController.js";

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
};

// =====================================================================
// PAGE LOADER
// =====================================================================

const mainContent = document.querySelector<HTMLElement>("#main-content");

async function loadPage(page: string): Promise<void> {
  if (!mainContent) return;

  try {
    const response = await fetch(`./pages/${page}.html`);
    if (!response.ok) throw new Error(`Halaman "${page}" tidak ditemukan`);

    mainContent.innerHTML = await response.text();

    pageInitializers[page]?.();
  } catch (err) {
    console.error(err);
    mainContent.innerHTML = `
        <article>
            <h3>Halaman gagal dimuat</h3>
            <p>${(err as Error).message}</p>
        </article>
        `;
  }
}

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

// =====================================================================
// START APPLICATION
// =====================================================================

loadPage("dashboard");
