"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("./models/Category");
const Product_1 = require("./models/Product");
const User_1 = require("./models/User");
const CartItem_1 = require("./models/CartItem");
// Test Category
console.log("===================== TES CATEGORY ======================");
const makanan = new Category_1.Category(1, "Makanan", "Kategori makanan dan snack");
const minuman = new Category_1.Category(2, "Minuman");
console.log(makanan.toString());
// Output: [Category#1] Makanan
console.log(minuman.toString());
// Output: [Category#2] Minuman
// Test validasi
try {
    const invalid = new Category_1.Category(3, "");
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Error (expected): Nama kategori tidak boleh kosong
}
// Test Product
console.log("\n===================== TEST PRODUCT ======================");
const nasiGoreng = new Product_1.Product(1, "FD001", "Nasi Goreng", 15000, 50, 1, "Nasi goreng spesial");
const tehBottle = new Product_1.Product(2, "BV001", "Teh Botol", 5000, 3, 2);
console.log(nasiGoreng.toString());
// Output: [Product#1] FD001 - Nasi Goreng | Rp15000 | Stock: 50 | Active
console.log(tehBottle.toString());
// Output: [Product#2] BV001 - Teh Botol | Rp5000 | Stock: 3 _ LOW STOCK | Active
// Test SKU format validasi
try {
    const invalid = new Product_1.Product(3, "INVALID", "Test", 1000, 10, 1);
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Error (expected): Format SKU tidak valid. Contoh yang benar: FD001, BV002
}
// Test reduce stock
console.log("\n --- TEST REDUCE STOCK ---");
nasiGoreng.reduceStock(5);
console.log(`Stok Nasi Goreng setelah dikurangi 5: ${nasiGoreng.stock}`);
// Output: Stok Nasi Goreng setelah dikurangi 5: 45
// Test stok tidak cukup
try {
    tehBottle.reduceStock(10);
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Error (expected): Stok tidak cukup: diminta 10, tersedia 3
}
// Test validasi harga
console.log("\n --- TEST VALIDASI HARGA ---");
try {
    nasiGoreng.price = -100;
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Error (expected): Harga harus lebih dari 0
}
// Test deactivate product
console.log("\n --- TEST DEACTIVATE PRODUCT ---");
tehBottle.deactivate();
console.log(tehBottle.toString());
// Output: [Product#2] BV001 - Teh Botol | Rp5000 | Stock: 3 _ LOW STOCK | Inactive
// Test User
console.log("\n===================== TEST USER ======================");
const admin = new User_1.User(1, "admin", "admin123", "Administrator", "ADMIN");
const kasir = new User_1.User(2, "kasir01", "kasir123", "Siti Rahayu", "CASHIER");
console.log(admin.toString());
// Output: [User#1] admin (Administrator) | Role: ADMIN | Active
console.log(kasir.toString());
// Output: [User#2] kasir01 (Siti Rahayu) | Role: CASHIER | Active
// Test access control
console.log("\n --- TEST ACCESS CONTROL ---");
console.log(`Admin akses 'manage_users': ${admin.hasAccess("manage_users")}`);
// Output: Admin akses 'manage_users': true
console.log(`Kasir akses 'transaction': ${kasir.hasAccess("transaction")}`);
// Output: Kasir akses 'transaction': true
console.log(`Kasir akses 'manage_users': ${kasir.hasAccess("manage_users")}`);
// Output: Kasir akses 'manage_users': false
// Test password
console.log("\n --- TEST PASSWORD ---");
console.log(`Verify correct password: ${kasir.verifyPassword("kasir123")}`);
// Output: Verify correct password: true
console.log(`Verify wrong password: ${kasir.verifyPassword("wrongpass")}`);
// Output: Verify wrong password: false
// Test change password
try {
    kasir.changePassword("kasir123", "newpass123");
    console.log("Password berhasil diubah");
    console.log(`Verify new password: ${kasir.verifyPassword("newpass123")}`);
    // Output: Verify new password: true
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Error (expected): Password lama salah
}
// Test role validation
try {
    const invalidUser = new User_1.User(3, "test", "test123", "Test User", "MANAGER");
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Error (expected): Role tidak valid. Pilihan: ADMIN, CASHIER
}
// Test CartItem
console.log("\n===================== TEST CART ITEM ======================");
const keranjang = new CartItem_1.CartItem(nasiGoreng, 3);
console.log(keranjang.toString());
// Output: [Product#1] FD001 - Nasi Goreng | Rp15000 x 3 = Rp45000
console.log(`Subtotal: ${keranjang.subtotal}`);
// Output: Subtotal: 45000
// Test updateQuantity
keranjang.updateQuantity(60);
console.log(`Quantity setelah update: ${keranjang.quantity}`);
// Output: Quantity setelah update: 6
// Test validasi updateQuantity
try {
    keranjang.updateQuantity(0);
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
    // Output: Error (expected): Quantity harus lebih dari 0
}
console.log("\n--- SEMUA TEST SELESAI ---");
