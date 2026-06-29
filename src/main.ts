import { DatabaseConnection } from "./database/connection.js";
import { ProductRepository } from "./repositories/ProductRepository.js";
import { NotFoundError, ValidationError } from "./errors/AppError.js";
import { CategoryRepository } from "./repositories/CategoryRepository.js";
import { UserRepository } from "./repositories/UserRepository.js";

//  ================= INITIALIZE DATABASE =================
console.log("================= INITIALIZE DATABASE =================\n");

// Inisialisasi database (buat tabel + seed data)
DatabaseConnection.initialize();

const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();
const userRepo = new UserRepository();

// ================= TEST FIND ALL =================
console.log("\n================= FIND ALL PRODUCTS =================\n");

const allProducts = productRepo.findAll();
console.log(`Total products: ${allProducts.length}`);
for (const p of allProducts) {
  console.log(
    `${p.sku.padEnd(6)} ${p.name.padEnd(20)} Rp ${p.price.toLocaleString("id-ID")}`,
  );
}

// ================= TEST FIND BY ID =================
console.log("\n================= FIND BY ID =================\n");

const product1 = productRepo.findById(1);
console.log(`Found: ${product1.name} (${product1.sku})`);

// Test NotFoundError
try {
  productRepo.findById(999);
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(`NotFoundError (expected): ${err.message}`);
  }
}

// ================= TEST CREATE =================
console.log("\n================= CREATE PRODUCT =================\n");

const newProduct = productRepo.create({
  sku: "FD004",
  name: "Soto Ayam",
  categoryId: 1,
  price: 18_000,
  stock: 20,
  description: "Soto Ayam kampung",
});
console.log(`Created: ${newProduct.name} (ID: ${newProduct.id})`);

// Test ValidationError duplicate SKU
try {
  productRepo.create({
    sku: "FD001", // SKU sudah ada!
    name: "Duplicate",
    categoryId: 1,
    price: 10_000,
    stock: 10,
  });
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`ValidationError (expected): ${err.message}`);
  }
}

// ================= TEST UPDATE =================
console.log("\n================= UPDATE PRODUCT =================\n");

const updated = productRepo.update(1, {
  price: 17_000,
  name: "Nasi Goreng Spesial",
});
console.log(
  `Updated: ${updated.name} - Rp ${updated.price.toLocaleString("id-ID")}`,
);

// ================= TEST SEARCH =================
console.log("\n================= SEARCH =================\n");

const searchResults = productRepo.search("goreng");
console.log(`Search 'goreng': ${searchResults.length} results`);
for (const p of searchResults) {
  console.log(`${p.sku} - ${p.name}`);
}

// ================= TEST LOW STOCK =================
console.log("\n================= LOW STOCK =================\n");

const lowStock = productRepo.findLowStock();
console.log(`Low stock products: ${lowStock.length}`);
for (const p of lowStock) {
  console.log(`⚠️  ${p.name}: ${p.stock} remaining`);
}

// ================= TEST UPDATE STOCK =================
console.log("\n================= UPDATE STOCK =================\n");

const before = productRepo.findById(1);
console.log(`Before: ${before.name} stock = ${before.stock}`);

productRepo.updateStock(1, -5); // Kurangi 5
const after = productRepo.findById(1);
console.log(`After reduce 5: ${after.name} stock = ${after.stock}`);

// Test stok tidak cukup
try {
  productRepo.updateStock(7, -100); // Chitato stok hanya 3
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`ValidationError (expected): ${err.message}`);
  }
}

// ================= TEST DELETE (SOFT) =================
console.log("\n================= SOFT DELETE =================\n");

productRepo.delete(newProduct.id);
const afterDelete = productRepo.findAll();
console.log(`Products after soft delete: ${afterDelete.length}`);

// ================= TAKE HOME TASK =================

// ================= TEST CATEGORY =================
console.log("\n================= CATEGORY REPOSITORY =================\n");

// FIND ALL
const categories = categoryRepo.findAll();
console.log(`Total categories: ${categories.length}`);
categories.forEach((c) => {
  console.log(`${c.id}. ${c.name}`);
});

// FIND BY ID
const category = categoryRepo.findById(1);
console.log(`Find ID 1: ${category.name}`);

// NOT FOUND
try {
  categoryRepo.findById(999);
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(`NotFoundError (expected): ${err.message}`);
  }
}

// CREATE
const newCategory = categoryRepo.create({
  name: "Dessert",
  description: "Menu dessert",
});

console.log(`Created: ${newCategory.name}`);

// UPDATE
const updatedCategory = categoryRepo.update(newCategory.id, {
  name: "Dessert Premium",
});

console.log(`Updated: ${updatedCategory.name}`);

// DELETE GAGAL (karena masih dipakai)
try {
  categoryRepo.delete(1);
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`ValidationError (expected): ${err.message}`);
  }
}

// DELETE BERHASIL
categoryRepo.delete(newCategory.id);
console.log("Delete category success");

// ================= TEST USER =================
console.log("\n================= USER REPOSITORY =================\n");

// FIND ALL
const users = userRepo.findAll();
console.log(`Total users: ${users.length}`);
users.forEach((u) => {
  console.log(`${u.username} (${u.getRole()})`);
});

// FIND BY ID
const admin = userRepo.findById(1);
console.log(`Find ID 1: ${admin.username}`);

// FIND BY USERNAME
const cashier = userRepo.findByUsername("kasir01");
console.log(`Find Username: ${cashier.username}`);

// NOT FOUND
try {
  userRepo.findById(999);
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log(`NotFoundError (expected): ${err.message}`);
  }
}

// CREATE
const newUser = userRepo.create({
  username: "tester",
  password: "123456",
  full_name: "Testing User",
  role: "CASHIER",
});

console.log(`Created: ${newUser.username}`);

// UPDATE
const updatedUser = userRepo.update(newUser.id, {
  full_name: "Testing User Updated",
});

console.log(`Updated: ${updatedUser.fullName} - ${updatedUser.username}`);

// ================= CLEANUP =================
console.log("\n");
DatabaseConnection.close();
console.log("\n================= SEMUA TEST SELESAI =================");
