"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("./models/Category");
const Product_1 = require("./models/Product");
const User_1 = require("./models/User");
const BaseModel_1 = require("./models/BaseModel");
const Admin_1 = require("./models/Admin");
const Cashier_1 = require("./models/Cashier");
const Supervisor_1 = require("./models/Supervisor");
const Transaction_1 = require("./models/Transaction");
// ==========================TEST BASEMODEL INHERITANCE=========================
console.log("===================== TEST INHERITANCE ======================\n");
const product = new Product_1.Product(1, "FD001", "Nasi Goreng", 15_000, 50, 1);
const category = new Category_1.Category(1, "Makanan");
// toString dari BaseModel dioverride oleh masing masing subclass
console.log(product.toString());
// Output: [Product#1] FD001 - Nasi Goreng | Rp15000 | Stock: 50 | Active
console.log(category.toString());
// Output: [Category#1] Makanan
// Instance check - inheritence chain
console.log(`\nproduct instanceof Product: ${product instanceof Product_1.Product}`); // true
console.log(`product instanceof BaseModel: ${product instanceof BaseModel_1.BaseModel}`); // true
console.log(`category instanceof Category: ${category instanceof Category_1.Category}`); // true
console.log(`category instanceof BaseModel: ${category instanceof BaseModel_1.BaseModel}`); // true
// ==========================TEST USER HIERARCHY =========================
console.log("\n===================== TEST USER HIERARCHY ======================\n");
const admin = new Admin_1.Admin(1, "admin", "admin123", "Administrator");
const kasir = new Cashier_1.Cashier(2, "kasir01", "kasir123", "Siti Rahayu");
const supervisor = new Supervisor_1.Supervisor(3, "supervisor01", "supervisor123", "Budi Santoso");
// Polymorphic toString - getRole dipanggil di dalam toString
console.log(admin.toString());
// Output: [User#1] admin (Administrator) | Role: ADMIN | Active
console.log(kasir.toString());
// Output: [User#2] kasir01 (Siti Rahayu) | Role: CASHIER | Active
console.log(supervisor.toString());
// Output: [User#3] supervisor01 (Budi Santoso) | Role: SUPERVISOR | Active
// Test method overriding - has access
console.log("\n---- Access control ----");
// const features = [
//   "manage_users",
//   "transaction",
//   "view_products",
//   "view_reports",
// ];
const features = admin.getPermissionsList();
// ["manage_users", "transaction", "view_products", "view_categories", "view_reports"]
for (const feature of features) {
    const adminAccess = admin.hasAccess(feature) ? "✅" : "❌";
    const kasirAccess = kasir.hasAccess(feature) ? "✅" : "❌";
    const supervisorAccess = supervisor.hasAccess(feature) ? "✅" : "❌";
    console.log(`${feature.padEnd(20)} Admin: ${adminAccess} | Kasir: ${kasirAccess} | Supervisor: ${supervisorAccess}`);
}
// Output:
// manage_users         Admin: ✅ | Kasir: ❌ | Supervisor: ❌
// transaction          Admin: ✅ | Kasir: ✅ | Supervisor: ✅
// view_products        Admin: ✅ | Kasir: ✅ | Supervisor: ✅
// view_reports         Admin: ✅ | Kasir: ❌ | Supervisor: ✅
// Instanceof chain
console.log(`\n--- Instanceof Chain ---`);
console.log(`admin instanceof Admin: ${admin instanceof Admin_1.Admin}`); // true
console.log(`admin instanceof User: ${admin instanceof User_1.User}`); // true
console.log(`admin instanceof BaseModel: ${admin instanceof BaseModel_1.BaseModel}`); // true
console.log(`kasir instanceof Cashier: ${kasir instanceof Cashier_1.Cashier}`); // true
console.log(`kasir instanceof User: ${kasir instanceof User_1.User}`); // true
console.log(`supervisor instanceof Supervisor: ${supervisor instanceof Supervisor_1.Supervisor}`); // true
console.log(`supervisor instanceof User: ${supervisor instanceof User_1.User}`); // true
// ==========================TEST POLYMORPHIC ARRAY ==========================
console.log("\n=================== TEST POLYMORPHIC ARRAY ====================\n");
// Semua user bisa ditampung dalam satu array bertipe User[]
const users = [admin, kasir, supervisor];
for (const user of users) {
    console.log(`${user.getRole().padEnd(10)} | ${user.fullName.padEnd(20)} | transaction: ${user.hasAccess("transaction")}`);
    // Meskipun array bertipe User[], method yang dipanggil adalah milik subclass masing-masing
    // Ini adalah POLYMORPHISM
}
// =========================TEST TRANSACTION ============================
console.log("\n=================== TEST TRANSACTION ====================\n");
const nasiGoreng = new Product_1.Product(2, "FD002", "Nasi Goreng Spesial", 15_000, 50, 1);
const tehBottle = new Product_1.Product(3, "BV001", "Teh Botol", 5_000, 20, 2);
const trx = new Transaction_1.Transaction(kasir.id, "CASH");
trx.addItem(nasiGoreng, 2);
trx.addItem(tehBottle, 3);
console.log(trx.toString());
// [Transaction] TRX-xxxxx
//   Kasir ID  : 2
//   Status    : PENDING
//   Items:
//   - Nasi Goreng Spesial x2 | Rp 15.000 = Rp 30.000
//   - Teh Botol x3 | Rp 5.000 = Rp 15.000
//   Total     : Rp 45.000
trx.complete();
console.log(`\nStatus transaksi ${trx.code}: ${trx.status}`);
// Output: Status transaksi TRX-xxxxx: SUCCESS
// Test tidak bisa addItem setelah complete
try {
    trx.addItem(nasiGoreng, 1);
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Tidak bisa menambah item ke transaksi yang sudah selesai
}
// Test stok berkurang setelah transaksi
console.log(`\nStok Nasi Goreng setelah transaksi: ${nasiGoreng.stock}`);
// Output: Stok Nasi Goreng setelah transaksi: 48
console.log("\n===================== TEST SELESAI ======================");
