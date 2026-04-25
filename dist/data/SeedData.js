"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCategories = seedCategories;
exports.seedProducts = seedProducts;
exports.seedTransactions = seedTransactions;
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const Transaction_1 = require("../models/Transaction");
// Categories
function seedCategories() {
    return [
        new Category_1.Category(1, "Makanan", "Makanan siap saji"),
        new Category_1.Category(2, "Minuman", "Minuman dingin dan panas"),
        new Category_1.Category(3, "Snack", "Makanan ringan"),
        new Category_1.Category(4, "Alat Tulis", "Peralatan tulis menulis"),
        new Category_1.Category(5, "Kebutuhan RT", "Kebutuhan rumah tangga"),
    ];
}
// Products
function seedProducts() {
    return [
        new Product_1.Product(1, "FD001", "Nasi Goreng", 15_000, 50, 1),
        new Product_1.Product(2, "FD002", "Mie Goreng", 12_000, 40, 1),
        new Product_1.Product(3, "FD003", "Nasi Uduk", 10_000, 30, 1),
        new Product_1.Product(4, "BV001", "Teh Botol", 5_000, 100, 2),
        new Product_1.Product(5, "BV002", "Kopi Susu", 8_000, 80, 2),
        new Product_1.Product(6, "BV003", "Es Jeruk", 7_000, 60, 2),
        new Product_1.Product(7, "SN001", "Chitato", 10_000, 3, 3), // Low Stock
        new Product_1.Product(8, "SN002", "Tango", 8_000, 25, 3),
        new Product_1.Product(9, "ST001", "Pulpen", 3_000, 200, 4),
        new Product_1.Product(10, "ST002", "Buku Tulis", 5_000, 150, 4),
        new Product_1.Product(11, "HH001", "Sabun Cuci", 12_000, 2, 5), // Low Stock
        new Product_1.Product(12, "HH002", "Tisu", 6_000, 4, 5), // Low Stock
    ];
}
// Transactions
function seedTransactions() {
    const date = (day, hour = 10) => {
        const d = new Date(2026, 1, day, hour);
        return d;
    };
    return [
        new Transaction_1.Transaction(1, "TRX-001", 2, [
            {
                productId: 1,
                productName: "Nasi Goreng",
                price: 15_000,
                quantity: 2,
                subtotal: 30_000,
            },
            {
                productId: 4,
                productName: "Teh Botol",
                price: 5_000,
                quantity: 2,
                subtotal: 10_000,
            },
        ], 40_000, "CASH", "SUCCESS", date(1, 10)),
        new Transaction_1.Transaction(2, "TRX-002", 2, [
            {
                productId: 5,
                productName: "Kopi Susu",
                price: 8_000,
                quantity: 1,
                subtotal: 8_000,
            },
        ], 8_000, "QRIS", "SUCCESS", date(1, 11)),
        new Transaction_1.Transaction(3, "TRX-003", 2, [
            {
                productId: 2,
                productName: "Mie Goreng",
                price: 12_000,
                quantity: 3,
                subtotal: 36_000,
            },
            {
                productId: 6,
                productName: "Es Jeruk",
                price: 7_000,
                quantity: 3,
                subtotal: 21_000,
            },
        ], 57_000, "CASH", "SUCCESS", date(1, 14)),
        // Tanggal 2 – 3 transaksi
        new Transaction_1.Transaction(4, "TRX-004", 2, [
            {
                productId: 1,
                productName: "Nasi Goreng",
                price: 15_000,
                quantity: 1,
                subtotal: 15_000,
            },
            {
                productId: 7,
                productName: "Chitato",
                price: 10_000,
                quantity: 2,
                subtotal: 20_000,
            },
        ], 35_000, "TRANSFER", "SUCCESS", date(2, 9)),
        new Transaction_1.Transaction(5, "TRX-005", 2, [
            {
                productId: 3,
                productName: "Nasi Uduk",
                price: 10_000,
                quantity: 2,
                subtotal: 20_000,
            },
        ], 20_000, "CASH", "SUCCESS", date(2, 12)),
        new Transaction_1.Transaction(6, "TRX-006", 2, [
            {
                productId: 9,
                productName: "Pulpen",
                price: 3_000,
                quantity: 5,
                subtotal: 15_000,
            },
            {
                productId: 10,
                productName: "Buku Tulis",
                price: 5_000,
                quantity: 3,
                subtotal: 15_000,
            },
        ], 30_000, "QRIS", "SUCCESS", date(2, 15)),
        // Tanggal 3 – 4 transaksi
        new Transaction_1.Transaction(7, "TRX-007", 2, [
            {
                productId: 1,
                productName: "Nasi Goreng",
                price: 15_000,
                quantity: 3,
                subtotal: 45_000,
            },
            {
                productId: 5,
                productName: "Kopi Susu",
                price: 8_000,
                quantity: 3,
                subtotal: 24_000,
            },
        ], 69_000, "CASH", "SUCCESS", date(3, 8)),
        new Transaction_1.Transaction(8, "TRX-008", 2, [
            {
                productId: 8,
                productName: "Tango",
                price: 8_000,
                quantity: 2,
                subtotal: 16_000,
            },
        ], 16_000, "QRIS", "SUCCESS", date(3, 10)),
        new Transaction_1.Transaction(9, "TRX-009", 2, [
            {
                productId: 11,
                productName: "Sabun Cuci",
                price: 12_000,
                quantity: 1,
                subtotal: 12_000,
            },
            {
                productId: 12,
                productName: "Tisu",
                price: 6_000,
                quantity: 2,
                subtotal: 12_000,
            },
        ], 24_000, "TRANSFER", "SUCCESS", date(3, 13)),
        new Transaction_1.Transaction(10, "TRX-010", 2, [
            {
                productId: 4,
                productName: "Teh Botol",
                price: 5_000,
                quantity: 5,
                subtotal: 25_000,
            },
        ], 25_000, "CASH", "FAILED", date(3, 15)), // Failed
        // Tanggal 5 – 3 transaksi
        new Transaction_1.Transaction(11, "TRX-011", 2, [
            {
                productId: 2,
                productName: "Mie Goreng",
                price: 12_000,
                quantity: 2,
                subtotal: 24_000,
            },
            {
                productId: 4,
                productName: "Teh Botol",
                price: 5_000,
                quantity: 2,
                subtotal: 10_000,
            },
        ], 34_000, "CASH", "SUCCESS", date(5, 9)),
        new Transaction_1.Transaction(12, "TRX-012", 2, [
            {
                productId: 1,
                productName: "Nasi Goreng",
                price: 15_000,
                quantity: 1,
                subtotal: 15_000,
            },
            {
                productId: 6,
                productName: "Es Jeruk",
                price: 7_000,
                quantity: 1,
                subtotal: 7_000,
            },
            {
                productId: 7,
                productName: "Chitato",
                price: 10_000,
                quantity: 1,
                subtotal: 10_000,
            },
        ], 32_000, "QRIS", "SUCCESS", date(5, 11)),
        new Transaction_1.Transaction(13, "TRX-013", 2, [
            {
                productId: 5,
                productName: "Kopi Susu",
                price: 8_000,
                quantity: 4,
                subtotal: 32_000,
            },
        ], 32_000, "TRANSFER", "SUCCESS", date(5, 14)),
        // Tanggal 7 – 2 transaksi
        new Transaction_1.Transaction(14, "TRX-014", 2, [
            {
                productId: 3,
                productName: "Nasi Uduk",
                price: 10_000,
                quantity: 3,
                subtotal: 30_000,
            },
            {
                productId: 4,
                productName: "Teh Botol",
                price: 5_000,
                quantity: 3,
                subtotal: 15_000,
            },
        ], 45_000, "CASH", "SUCCESS", date(7, 10)),
        new Transaction_1.Transaction(15, "TRX-015", 2, [
            {
                productId: 1,
                productName: "Nasi Goreng",
                price: 15_000,
                quantity: 2,
                subtotal: 30_000,
            },
            {
                productId: 8,
                productName: "Tango",
                price: 8_000,
                quantity: 3,
                subtotal: 24_000,
            },
            {
                productId: 5,
                productName: "Kopi Susu",
                price: 8_000,
                quantity: 2,
                subtotal: 16_000,
            },
        ], 70_000, "QRIS", "SUCCESS", date(7, 13)),
        // Tanggal 10 - 3 transaksi
        new Transaction_1.Transaction(16, "TRX-016", 2, [
            {
                productId: 2,
                productName: "Mie Goreng",
                price: 12_000,
                quantity: 1,
                subtotal: 12_000,
            },
        ], 12_000, "CASH", "SUCCESS", date(10, 8)),
        new Transaction_1.Transaction(17, "TRX-017", 2, [
            {
                productId: 9,
                productName: "Pulpen",
                price: 3_000,
                quantity: 10,
                subtotal: 30_000,
            },
        ], 30_000, "QRIS", "SUCCESS", date(10, 11)),
        new Transaction_1.Transaction(18, "TRX-018", 2, [
            {
                productId: 1,
                productName: "Nasi Goreng",
                price: 15_000,
                quantity: 2,
                subtotal: 30_000,
            },
            {
                productId: 11,
                productName: "Sabun Cuci",
                price: 12_000,
                quantity: 2,
                subtotal: 24_000,
            },
        ], 54_000, "TRANSFER", "SUCCESS", date(10, 14)),
        // Tangal 12 - 2 transaksi
        new Transaction_1.Transaction(19, "TRX-019", 2, [
            {
                productId: 6,
                productName: "Es Jeruk",
                price: 7_000,
                quantity: 5,
                subtotal: 35_000,
            },
            {
                productId: 7,
                productName: "Chitato",
                price: 10_000,
                quantity: 3,
                subtotal: 30_000,
            },
        ], 65_000, "CASH", "SUCCESS", date(12, 10)),
        new Transaction_1.Transaction(20, "TRX-020", 2, [
            {
                productId: 10,
                productName: "Buku Tulis",
                price: 5_000,
                quantity: 5,
                subtotal: 25_000,
            },
            {
                productId: 12,
                productName: "Tisu",
                price: 6_000,
                quantity: 3,
                subtotal: 18_000,
            },
        ], 43_000, "QRIS", "SUCCESS", date(12, 14)),
    ];
}
