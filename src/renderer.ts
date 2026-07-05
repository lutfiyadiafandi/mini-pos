import { CategoryView } from "./views/CategoryView.js";
import { Category } from "./models/Category.js";
import { ProductController } from "./controllers/ProductController.js";
import { DashboardController } from "./controllers/DashboardController.js";

// =====================================================================
// SAMPLE DATA
// Praktikum 08:
// sementara memakai data dummy.
// Praktikum 09:
// data akan berasal dari Controller melalui IPC.
// =====================================================================

// Data kategori masih dummy sementara dan di praktikum 10 akan dinamis
const categories: Category[] = [
  new Category(1, "Makanan"),
  new Category(2, "Minuman"),
  new Category(3, "Snack"),
];

// =====================================================================
// PAGE INITIALIZER
// Setiap halaman memiliki logic masing-masing.
// =====================================================================

const pageInitializers: Record<string, () => void> = {
  dashboard: () => new DashboardController(),

  products: () => {
    const productController = new ProductController();
    productController.renderCategories(categories); // sementara dummy
  },

  categories: () => {
    const categoryView = new CategoryView(
      (data) => {
        console.log("Save category", data);
        alert(`Kategori "${data.name}" berhasil disimpan (simulasi)`);
      },

      (id) => {
        console.log("Delete category", id);
        alert(`Kategori #${id} dihapus (simulasi)`);
      },

      (keyword) => {
        const filtered = categories.filter((category) =>
          category.name.toLowerCase().includes(keyword.toLowerCase()),
        );

        categoryView.renderCategories(filtered, []);
      },
    );

    categoryView.renderCategories(categories, []);
  },
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
