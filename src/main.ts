import { DatabaseConnection } from "./database/connection.js";
import { ProductRepository } from "./repositories/ProductRepository.js";
import { CategoryRepository } from "./repositories/CategoryRepository.js";
import { TransactionRepository } from "./repositories/TransactionRepository.js";
import { CustomerRepository } from "./repositories/CustomerRepository.js";
import { ProductService } from "./services/ProductService.js";
import { AuthService } from "./services/AuthService.js";
import { TransactionService } from "./services/TransactionService.js";
import { LoyaltyService } from "./services/LoyaltyService.js";
import { PaymentFactory } from "./strategies/PaymentFactory.js";
import { ValidationError } from "./errors/AppError.js";

//  ================= INITIALIZE DATABASE =================
console.log("================= INITIALIZE DATABASE =================\n");
DatabaseConnection.initialize();

// Repositories
const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();
const transactionRepo = new TransactionRepository();
const customerRepo = new CustomerRepository();

// Services (Dependency Injection repo diberikan via constructor)
const productService = new ProductService(productRepo, categoryRepo);
const authService = new AuthService();
const loyaltyService = new LoyaltyService(customerRepo);
const transactionService = new TransactionService(
  transactionRepo,
  productRepo,
  loyaltyService,
);

//  ================= TEST AUTH =================
console.log("\n================= TEST AUTH =================\n");

try {
  const user = authService.login("kasir01", "kasir123");
  console.log(`Logged in as: ${user.fullName} (${user.username})`);
} catch (err) {
  console.log(`Login failed: ${(err as Error).message}`);
}

// Test invalid login
try {
  authService.login("admin", "wrongpassword");
} catch (err) {
  if (err instanceof ValidationError) {
    console.log(`Login error (expected): ${err.message}`);
  }
}

//  ================= TEST PRODUCT SERVICE =================
console.log("\n================= PRODUCT SERVICE =================\n");

const allProducts = productService.getAllProducts();
console.log(`Products available: ${allProducts.length}`);

// Create product via service (with business validation)
try {
  const newProduct = productService.createProduct({
    sku: "BV004",
    name: "Jus Alpukat",
    categoryId: 2,
    price: 12_000,
    stock: 15,
  });
  console.log(`Created: ${newProduct.name}`);
} catch (err) {
  console.log(`Create error: ${(err as Error).message}`);
}

// Low stock
const lowStock = productService.getLowStockProducts();
console.log(`\nLow stock: ${lowStock.length} products\n`);
for (const p of lowStock) {
  console.log(`- ${p.name}: ${p.stock} remaining`);
}

//  ================= TEST CHECKOUT FLOW =================
console.log("\n================= CHECKOUT FLOW =================\n");

const currentUser = authService.getCurrentUser()!;

// Checkout #1: Cash Payment
console.log("--- Checkout #1: Cash ---");
try {
  const cart1 = [
    { productId: 1, quantity: 2 }, // Nasi Goreng x2
    { productId: 4, quantity: 3 }, // Teh Botol x3
  ];
  const strategy1 = PaymentFactory.create({
    method: "CASH",
    cashReceived: 50_000,
  });
  const trx1 = transactionService.checkout(currentUser.id, cart1, strategy1);
  console.log(transactionService.generateReceipt(trx1));
} catch (err) {
  console.log(`Checkout error: ${(err as Error).message}`);
}

// Checkout #2: QRIS Payment
console.log("\n");
console.log("--- Checkout #2: QRIS ---");
try {
  const cart2 = [
    { productId: 5, quantity: 1 }, // Kopi Susu x1
    { productId: 8, quantity: 2 }, // Tango x2
  ];
  const strategy2 = PaymentFactory.create({ method: "QRIS" });
  const trx2 = transactionService.checkout(currentUser.id, cart2, strategy2);
  console.log(transactionService.generateReceipt(trx2));
} catch (err) {
  console.log(`Checkout error: ${(err as Error).message}`);
}

// Checkout #3: TRANSFER Payment
console.log("\n");
console.log("--- Checkout #3: Transfer ---");
try {
  const cart3 = [
    { productId: 3, quantity: 1 }, // Nasi Uduk x1
  ];
  const strategy3 = PaymentFactory.create({
    method: "TRANSFER",
    bankName: "BCA",
  });
  const trx3 = transactionService.checkout(currentUser.id, cart3, strategy3);
  console.log(transactionService.generateReceipt(trx3));
} catch (err) {
  console.log(`Checkout error: ${(err as Error).message}`);
}

//  ================= VERIFY STOCK REDUCED =================
console.log("\n================= VERIFY STOCK =================\n");

const nasiGoreng = productService.getProductById(1);
console.log(`Nasi Goreng stock after 2 sold: ${nasiGoreng.stock}`);
// Should be 48 (50 - 2)

const tehBotol = productService.getProductById(4);
console.log(`Teh Botol stock after 3 sold: ${tehBotol.stock}`);
// Should be 97 (100 - 3)

//  ================= TEST ERROR CASES =================
console.log("\n================= ERROR CASES =================\n");

// Cart kosong
try {
  const emptyStrategy = PaymentFactory.create({
    method: "CASH",
    cashReceived: 100_000,
  });
  transactionService.checkout(currentUser.id, [], emptyStrategy);
} catch (err) {
  console.log(`Empty cart (expected): ${(err as Error).message}`);
}

// Stok tidak cukup
try {
  const cart = [{ productId: 7, quantity: 100 }]; // Chitato stok hanya 3
  const strategy = PaymentFactory.create({
    method: "CASH",
    cashReceived: 1_000_000,
  });
  transactionService.checkout(currentUser.id, cart, strategy);
} catch (err) {
  console.log(`Insufficient stock (expected): ${(err as Error).message}`);
}

// Uang tidak cukup
try {
  const cart = [{ productId: 1, quantity: 5 }]; // 5 x 15000 = 75000
  const strategy = PaymentFactory.create({
    method: "CASH",
    cashReceived: 10_000,
  });
  transactionService.checkout(currentUser.id, cart, strategy);
} catch (err) {
  console.log(`Insufficient cash (expected): ${(err as Error).message}`);
}

// ================= CLEANUP =================
console.log("\n");
DatabaseConnection.close();
console.log("\n================= SEMUA TEST SELESAI =================");
