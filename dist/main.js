"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("./models/Category");
const Product_1 = require("./models/Product");
const CategoryRepository_1 = require("./repositories/CategoryRepository");
const ProductRepository_1 = require("./repositories/ProductRepository");
const CashPayment_1 = require("./strategies/CashPayment");
const QRISPayment_1 = require("./strategies/QRISPayment");
const TransferPayment_1 = require("./strategies/TransferPayment");
const PaymentFactory_1 = require("./strategies/PaymentFactory");
const TransactionService_1 = require("./services/TransactionService");
const AMOUNT = 35_000;
// ========================== TEST INDIVIDUAL PAYMENT =========================
console.log("================= TEST INDIVIDUAL PAYMENT ==================\n");
// 1. Cash - uang cukup
const cash = new CashPayment_1.CashPayment(50_000);
const cashResult = cash.processPayment(AMOUNT);
console.log(`[${cash.methodName}] ${cashResult.message}`);
console.log(`   Code: ${cashResult.transactionCode}`);
console.log(`   Kembalian: ${cashResult.changeAmount?.toLocaleString("id-ID")}`);
// 2. Cash - uang tidak cukup
console.log();
const cashInsufficient = new CashPayment_1.CashPayment(20_000);
const failResult = cashInsufficient.processPayment(AMOUNT);
console.log(`[${cashInsufficient.methodName}] ${failResult.message}`);
console.log(`   Success: ${failResult.success}`);
// 3. QRIS
console.log();
const qris = new QRISPayment_1.QRISPayment();
const qrisResult = qris.processPayment(AMOUNT);
console.log(`[${qris.methodName}] ${qrisResult.message}`);
// 4. Transfer
console.log();
const transfer = new TransferPayment_1.TransferPayment("BNI");
const transferResult = transfer.processPayment(AMOUNT);
console.log(`[${transfer.methodName}] ${transferResult.message}`);
// ========================== POLYMORPHISM IN ACTION =========================
console.log("\n================== POLYMORPHISM IN ACTION ===================\n");
// Array bertipe PaymentStrategy[]
const strategies = [
    PaymentFactory_1.PaymentFactory.create({ method: "CASH", cashReceived: 50_000 }),
    PaymentFactory_1.PaymentFactory.create({ method: "QRIS" }),
    PaymentFactory_1.PaymentFactory.create({ method: "TRANSFER", bankName: "MANDIRI" }),
];
// Loop
for (const strategy of strategies) {
    const result = strategy.processPayment(AMOUNT);
    const status = result.success ? "✅" : "❌";
    console.log(`${status} [${strategy.methodName.padEnd(10)}] ${result.message}`);
}
// ============= TEST DISCRIMINATED UNION (PaymentConfig) =============
console.log("\n========== TEST DISCRIMINATED UNION ===============\n");
console.log("Avaiable methods:", PaymentFactory_1.PaymentFactory.getAvailableMethods().join(", "));
// Type-safe
const configs = [
    { method: "CASH", cashReceived: 50_000 },
    { method: "QRIS" },
    { method: "TRANSFER", bankName: "BRI" },
    {
        method: "CREDIT_CARD",
        cardNumber: "1234567890123456",
        expiryDate: "12/27",
        cvv: "123",
    },
];
for (const config of configs) {
    const strategy = PaymentFactory_1.PaymentFactory.create(config);
    console.log(strategy.getPaymentSummary());
}
// =================== TEST CREDIT CARD ===================
console.log("\n================ TEST CREDIT CARD =================\n");
const cc = PaymentFactory_1.PaymentFactory.create({
    method: "CREDIT_CARD",
    cardNumber: "1234567890123456",
    expiryDate: "12/27",
    cvv: "123",
});
console.log(`${cc.getPaymentSummary()}`);
const ccResult = cc.processPayment(AMOUNT);
console.log(`[${cc.methodName}] ${ccResult.message}`);
// Validasi nomor kartu salah
try {
    PaymentFactory_1.PaymentFactory.create({
        method: "CREDIT_CARD",
        cardNumber: "123",
        expiryDate: "12/27",
        cvv: "123",
    });
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
}
// Validasi kartu expired
try {
    PaymentFactory_1.PaymentFactory.create({
        method: "CREDIT_CARD",
        cardNumber: "1234567890123456",
        expiryDate: "01/20",
        cvv: "123",
    });
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
}
// ================ TEST TRANSFER VALIDATION ==================
console.log("\n============ TEST TRANSFER VALIDATION ==============\n");
try {
    new TransferPayment_1.TransferPayment("BITCOIN");
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
}
// Format berbeda per bank
for (const bank of ["BCA", "BNI", "BRI", "MANDIRI"]) {
    const tf = new TransferPayment_1.TransferPayment(bank);
    const rek = tf.processPayment(AMOUNT);
    console.log(`[${bank}] ${rek.message}`);
}
// ================ TEST TRANSACTION SERVICE ==================
console.log("\n============ TEST TRANSACTION SERVICE ==============\n");
// Repository instances
const categoryRepo = new CategoryRepository_1.CategoryRepository();
const productRepo = new ProductRepository_1.ProductRepository();
const service = new TransactionService_1.TransactionService(productRepo);
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
// Checkout dengan CASH
service.checkout([
    { productId: 1, quantity: 2 },
    { productId: 3, quantity: 1 },
], PaymentFactory_1.PaymentFactory.create({ method: "CASH", cashReceived: 50_000 }));
// Checkout dengan QRIS
service.checkout([
    { productId: 2, quantity: 1 },
    { productId: 4, quantity: 1 },
], PaymentFactory_1.PaymentFactory.create({ method: "QRIS" }));
// Checkout dengan TRANSFER
service.checkout([
    { productId: 5, quantity: 2 },
    { productId: 2, quantity: 1 },
], PaymentFactory_1.PaymentFactory.create({ method: "TRANSFER", bankName: "MANDIRI" }));
// Checkout dengan CREDIT CARD
service.checkout([{ productId: 2, quantity: 1 }], PaymentFactory_1.PaymentFactory.create({
    method: "CREDIT_CARD",
    cardNumber: "9876543210987654",
    expiryDate: "06/28",
    cvv: "456",
}));
// Checkout produk tidak ada
try {
    service.checkout([{ productId: 99, quantity: 1 }], PaymentFactory_1.PaymentFactory.create({ method: "QRIS" }));
}
catch (err) {
    console.error(`Error (expected): ${err.message}`);
}
console.log("\n===================== TEST SELESAI ======================");
