import { DashboardView } from "./views/DashboardView.js";
import { ProductView } from "./views/ProductView.js";
import { CategoryView } from "./views/CategoryView.js";
import { Product } from "./models/Product.js";
import { Category } from "./models/Category.js";

// =====================================================================
// SAMPLE DATA
// Praktikum 08:
// sementara memakai data dummy.
// Praktikum 09:
// data akan berasal dari Controller melalui IPC.
// =====================================================================

const categories: Category[] = [
  new Category(1, "Makanan"),
  new Category(2, "Minuman"),
  new Category(3, "Snack"),
];

const products: Product[] = [
  new Product(1, "FD001", "Nasi Goreng", 15000, 50, 1),
  new Product(2, "FD002", "Mie Goreng", 12000, 40, 1),
  new Product(3, "BV001", "Teh Botol", 5000, 100, 2),
  new Product(4, "BV002", "Kopi Susu", 8000, 80, 2),
  new Product(5, "SN001", "Chitato", 10000, 3, 3),
  new Product(6, "HH001", "Sabun Cuci", 12000, 2, 5),
];

// =====================================================================
// PAGE INITIALIZER
// Setiap halaman memiliki logic masing-masing.
// =====================================================================

const pageInitializers: Record<string, () => void> = {
  dashboard: () => {
    const dashboard = new DashboardView();
    dashboard.renderMetrics({
      revenue: 245000,
      trxCount: 8,
      lowStockCount: products.filter((p) => p.isLowStock).length,
    });

    dashboard.renderLowStockTable(products.filter((p) => p.isLowStock));
  },

  products: () => {
    const productView = new ProductView(
      (data) => {
        console.log("Save :", data);
        alert(`Produk "${data.name}" berhasil disimpan (simulasi)`);
      },

      (id) => {
        console.log("Delete :", id);
        alert(`Delete produk ${id} (simulasi)`);
      },

      (keyword) => {
        const filtered = products.filter(
          (p) =>
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.sku.toLowerCase().includes(keyword.toLowerCase()),
        );

        productView.renderProducts(filtered);
      },
    );

    productView.renderCategories(categories);
    productView.renderProducts(products);
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

        categoryView.renderCategories(filtered, products);
      },
    );

    categoryView.renderCategories(categories, products);
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
