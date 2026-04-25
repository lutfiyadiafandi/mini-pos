import { Category } from "./models/Category";
import { Product } from "./models/Product";
import { User } from "./models/User";
import { CartItem } from "./models/CartItem";
import { BaseModel } from "./models/BaseModel";
import { Admin } from "./models/Admin";
import { Cashier } from "./models/Cashier";
import { Supervisor } from "./models/Supervisor";
import { Transaction } from "./models/Transaction";
import { CategoryRepository } from "./repositories/CategoryRepository";
import { ProductRepository } from "./repositories/ProductRepository";
import { UserRepository } from "./repositories/UserRepository";
import { TransactionRepository } from "./repositories/TransactionRepository";
import { CashPayment } from "./strategies/CashPayment";
import { QRISPayment } from "./strategies/QRISPayment";
import { TransferPayment } from "./strategies/TransferPayment";
import { PaymentConfig, PaymentStrategy } from "./interfaces/PaymentStrategy";
import { PaymentFactory } from "./strategies/PaymentFactory";
import { CreditCardPayment } from "./strategies/CreditCardPayment";
import { TransactionService } from "./services/TransactionService";
import {
  seedCategories,
  seedProducts,
  seedTransactions,
} from "./data/SeedData";
import { SalesReport } from "./reports/SalesReport";
import { ProductAnalytics } from "./reports/ProductAnalytics";

// ========================== SEED DATA =========================
console.log("================= SEED DATA ==================\n");

const categories = seedCategories();
const products = seedProducts();
const transactions = seedTransactions();

console.log(
  `Loaded: ${categories.length} categories, ${products.length} products, ${transactions.length} transactions`,
);

// ========================== SALES REPORT =========================
console.log("\n================== SALES REPORT ===================\n");

const salesReport = new SalesReport(transactions);

// Total Revenue
console.log(
  `Total Revenue: ${salesReport.totalRevenue().toLocaleString("id-ID")}`,
);
console.log(
  `Successful Transactions: ${salesReport.successfulTransactionCount()}`,
);

// Revenue by Payment method
console.log("\nRevenue by Payment Method:");
const revenueByMethod = salesReport.revenuePaymentMethod();
for (const [method, revenue] of revenueByMethod) {
  console.log(`   ${method.padEnd(10)} Rp ${revenue.toLocaleString("id-ID")}`);
}

// Revenue By Category
console.log("\nRevenue by Category:");
const revenueByCategory = salesReport.getRevenueByCategory(
  categories,
  products,
);
for (const [catName, revenue] of revenueByCategory) {
  console.log(`   ${catName.padEnd(15)} Rp ${revenue.toLocaleString("id-ID")}`);
}

// Top selling products
console.log("\nTop 5 Selling Products:");
const topProducts = salesReport.topSellingProducts(5);
for (const [i, product] of topProducts.entries()) {
  console.log(
    `   ${i + 1}. ${product.productName.padEnd(20)} ` +
      `Qty: ${String(product.qtySold).padStart(3)} | ` +
      `Revenue: Rp ${product.revenue.toLocaleString("id-ID")}`,
  );
}

// Daily Summary
console.log("\nDaily Summary (2026-02-01)");
const feb1 = salesReport.dailySummary("2026-02-01");
console.log(`   Transactions: ${feb1.count}`);
console.log(`   Revenue: ${feb1.revenue.toLocaleString("id-ID")}`);

// Daily Revenue
console.log("\nDaily Revenue");
const dailyRevenue = salesReport.dailyRevenue();
for (const [date, revenue] of dailyRevenue) {
  const bar = "█".repeat(Math.round(revenue / 10_000));
  console.log(
    `   ${date} | Rp ${String(revenue.toLocaleString("id-ID")).padStart(10)} | ${bar}`,
  );
}

// Distribusi Transaksi per jam
console.log("\nDistribusi Transaksi per Jam:");
const hourDist = salesReport.getHourDistribution();
for (const [hour, count] of hourDist) {
  const bar = "█".repeat(count);
  console.log(
    `   Jam: ${String(hour).padStart(2)}:00 | ${count} transaksi | ${bar}`,
  );
}

// Perbandingan antara hari dengan hari lainnya
console.log("\nPerbandingan Harian:");
const comparison = salesReport.compareDaily("2026-02-01", "2026-02-03");
console.log(
  `   Tanggal ${comparison.date1.date} | Total: ${comparison.date1.count} transaksi | Revenue: Rp ${comparison.date1.revenue.toLocaleString("id-ID")}`,
);
console.log(
  `   Tanggal ${comparison.date2.date} | Total: ${comparison.date2.count} transaksi | Revenue: Rp ${comparison.date2.revenue.toLocaleString("id-ID")}`,
);
console.log(
  `   Selisih revenue: Rp ${comparison.revenueDiff.toLocaleString("id-ID")}`,
);
console.log(`   Hari dengan revenue lebih banyak: ${comparison.winner}`);

// CSV Export
console.log("\nCSV Export");
const csv = salesReport.exportToCSV();
const csvLines = csv.split("\n");
for (const line of csvLines.slice(0, 6)) {
  console.log(`   ${line}`);
}

// =================== PRODUCT ANALYTICS ===================
console.log("\n================ PRODUCT ANALYTICS =================\n");

const analytics = new ProductAnalytics(products);

// Summary
const summary = analytics.getSummary();
console.log("Product Summary:");
console.log(`   Total Products: ${summary.totalProducts}`);
console.log(`   Activate Products: ${summary.activeProducts}`);
console.log(
  `   Total Stock Value: Rp ${summary.totalStockValue.toLocaleString("id-ID")}`,
);
console.log(
  `   Average Price: Rp ${summary.averagePrice.toLocaleString("id-ID")}`,
);
console.log(`   Low Stock Count: ${summary.lowStockCount}`);

// Low Stock
console.log("\nLow Stock Products:");
const lowStock = analytics.getLowStockProducts();
for (const p of lowStock) {
  console.log(`  _ ${p.sku} - ${p.name}: ${p.stock} remaining`);
}

// By Category
console.log("\nProducts By Category:");
const byCategory = analytics.getByCategory();
for (const [catId, prods] of byCategory) {
  const catName = categories.find((c) => c.id === catId)?.name ?? "Unknown";
  console.log(`   [${catName}]`);
  for (const p of prods) {
    console.log(`   - ${p.name} (${p.formattedPrice})`);
  }
}

// Most Expensive
console.log("\nTop 3 Most Expensive Products:");
const expensive = analytics.getMostExpensive(3);
for (const p of expensive) {
  console.log(`   ${p.name}: ${p.formattedPrice}`);
}

// Search
console.log("\nSeach 'nasi':");
const searchResult = analytics.searchProducts("nasi");
for (const p of searchResult) {
  console.log(`   ${p.sku} - ${p.name}`);
}

console.log("\n===================== TEST SELESAI ======================");
