"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("./models/Category");
const Product_1 = require("./models/Product");
const Admin_1 = require("./models/Admin");
const Cashier_1 = require("./models/Cashier");
const Supervisor_1 = require("./models/Supervisor");
const Transaction_1 = require("./models/Transaction");
const CategoryRepository_1 = require("./repositories/CategoryRepository");
const ProductRepository_1 = require("./repositories/ProductRepository");
const UserRepository_1 = require("./repositories/UserRepository");
const TransactionRepository_1 = require("./repositories/TransactionRepository");
// ========================== SETUP DATA =========================
console.log("===================== SETUP DATA ======================\n");
// Repository instances
const categoryRepo = new CategoryRepository_1.CategoryRepository();
const productRepo = new ProductRepository_1.ProductRepository();
// Seed categories
categoryRepo.add(new Category_1.Category(1, "Makanan", "Kategori makananan"));
categoryRepo.add(new Category_1.Category(2, "Minuman", "Kategori minuman"));
categoryRepo.add(new Category_1.Category(3, "Snack", "Kategori snack"));
// Seed products
const products = [
    new Product_1.Product(1, "FD001", "Nasi Goreng", 15_000, 50, 1, "Nasi goreng spesial"),
    new Product_1.Product(2, "BV001", "Teh Botol", 5_000, 3, 2, "Teh botol sosro"),
    new Product_1.Product(3, "SN001", "Chitato", 10_000, 30, 3, "Chitato rasa sapi panggang"),
    new Product_1.Product(4, "FD002", "Mie Goreng", 12_000, 2, 1, "Mie goreng spesial"),
    new Product_1.Product(5, "BV002", "Kopi Susu", 8_000, 100, 2, "Kopi susu gula aren"),
];
for (const product of products) {
    productRepo.add(product);
}
console.log(`Categories: ${categoryRepo.count()}`);
console.log(`Products: ${productRepo.count()}`);
// ==========================TEST REPOSITORY=========================
console.log("\n===================== TEST REPOSITORY ======================\n");
// findById
const found = productRepo.findById(1);
console.log(`findById(1): ${found?.toString() ?? "Not found"}`);
// search
console.log("\nSearch 'goreng':");
const searchResults = productRepo.search("goreng");
for (const p of searchResults) {
    console.log(` - ${p.toDisplayString()}`);
}
// findBySku
const bySku = productRepo.findBySku("BV001");
console.log(`\nfindBySku('BV001'): ${bySku?.name ?? "Not found"}`);
// findByCategory
console.log(`\nProducts in Makanan (Category#1):`);
for (const p of productRepo.findByCategory(1)) {
    console.log(` - ${p.toDisplayString()}`);
}
// findLowStock
console.log(`\nLow stock products:`);
for (const p of productRepo.findLowStock()) {
    console.log(` - ${p.toDisplayString()}`);
}
// ========================== TEST DISPLAYABLE =========================
console.log("\n===================== TEST DISPLAYABLE ======================\n");
// Product implements Displayable
const nasiGoreng = productRepo.findById(1);
console.log(`Display String:`);
console.log(nasiGoreng.toDisplayString());
console.log(`\nDetail String:`);
console.log(nasiGoreng.toDetailString());
// ==========================TEST ABSTARCT CLASS ==========================
console.log("\n=================== TEST ABSTARCT CLASS ====================\n");
// Delete test
console.log(`Before delete: ${productRepo.count()} products`);
const deleted = productRepo.delete(5);
console.log(`Delete ID 5: ${deleted}`);
console.log(`After delete: ${productRepo.count()} products`);
// Duplicate ID test
try {
    productRepo.add(new Product_1.Product(1, "XX001", "Duplicate", 1000, 10, 1));
}
catch (err) {
    console.error(`\nError (expected): ${err.message}`);
}
// ===================== TEST SEARCHABLE =====================
console.log("\n=================== TEST SEARCHABLE ====================\n");
const makanan = categoryRepo.findById(1);
console.log(`nasiGoreng.matches("goreng"): ${nasiGoreng.matches("goreng")}`); // true
console.log(`nasiGoreng.matches("teh"): ${nasiGoreng.matches("teh")}`); // false
console.log(`makanan.matches("makan"): ${makanan.matches("makan")}`); // true
// =================== TEST UPDATE REPOSITORY =================
console.log("\n=============== TEST UPDATE REPOSITORY =================\n");
// Update
console.log(`Sebelum: ${productRepo.findById(2).toDisplayString()}`);
productRepo.update(new Product_1.Product(2, "BV001", "Teh Botol Sosro Premium", 7_000, 3, 2));
console.log(`Sesudah: ${productRepo.findById(2).toDisplayString()}`);
try {
    productRepo.update(new Product_1.Product(99, "XX999", "Ghost", 1000, 10, 1));
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
}
// =================== TEST USER REPOSITORY ===================
console.log("\n================ TEST USER REPOSITORY ==================\n");
const userRepo = new UserRepository_1.UserRepository();
const users = [
    new Admin_1.Admin(1, "admin", "admin123", "Administrator"),
    new Cashier_1.Cashier(2, "kasir01", "kasir123", "Siti Rahayu"),
    new Supervisor_1.Supervisor(3, "supervisor01", "supervisor123", "Budi Santoso"),
];
for (const user of users) {
    userRepo.add(user);
}
// findByUsername
const byUsername = userRepo.findByUsername("kasir01");
console.log(`findByUsername("kasir01"): ${byUsername?.toString() ?? "Not found"}`);
// findByRole
const byRole = userRepo.findByRole("SUPERVISOR");
console.log(`\nfindByRole("SUPERVISOR"): ${byRole.map((u) => u.toString()).join(", ")}`);
// ================ TEST TRANSACTION REPOSITORY ================
console.log("\n=========== TEST TRANSACTION REPOSITORY ===============\n");
const transactionRepo = new TransactionRepository_1.TransactionRepository();
const chitato = productRepo.findById(3);
const kasir = userRepo.findByUsername("kasir01");
const trx1 = new Transaction_1.Transaction(kasir.id, "CASH");
trx1.addItem(nasiGoreng, 2);
trx1.addItem(chitato, 1);
trx1.complete();
transactionRepo.add(trx1);
const trx2 = new Transaction_1.Transaction(kasir.id, "QRIS");
trx2.addItem(chitato, 3);
transactionRepo.add(trx2); // PENDING
const todayStr = new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});
// findByDate (format "01 Januari 2026")
const byDate = transactionRepo.findByDate(todayStr);
console.log(`findByDate("${todayStr}"): \n${byDate.map((t) => t.toString()).join(", \n")}`);
// findByUserId
const byUserId = transactionRepo.findByUserId(kasir.id);
console.log(`\nfindByUserId(${kasir.id}): \n${byUserId.map((t) => t.toString()).join(", \n")}`);
// findByStatus
const byStatus = transactionRepo.findByStatus("PENDING");
console.log(`\nfindByStatus("PENDING"): \n${byStatus.map((t) => t.toString()).join(", ")}`);
console.log("\n===================== TEST SELESAI ======================");
