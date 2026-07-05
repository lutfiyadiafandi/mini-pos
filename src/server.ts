import express, { Request, Response } from "express";
import cors from "cors";
// (Panggil semua class Repository dan Service yang kita buat pada Praktikum 8)
import { DatabaseConnection } from "./database/connection.js";
import { ProductRepository } from "./repositories/ProductRepository.js";
import { CategoryRepository } from "./repositories/CategoryRepository.js";
import { TransactionRepository } from "./repositories/TransactionRepository.js";
import { ProductService } from "./services/ProductService.js";
import { TransactionService } from "./services/TransactionService.js";
import { PaymentFactory } from "./strategies/PaymentFactory.js";

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Database
const db = DatabaseConnection.getInstance();
// Susun ketergantungan (Dependency Injection) Objek:
const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();
const transactionRepo = new TransactionRepository();
const productService = new ProductService(productRepo, categoryRepo);
const transactionService = new TransactionService(transactionRepo, productRepo);

// ======= ENDPOINT ROUTES ======

// ======== API Products =========
// API untuk mendapatkan seluruh produk
app.get("/api/products", (req: Request, res: Response) => {
  try {
    const result = productService.getAllProducts(); // Logic PBO
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// API untuk menyimpan produk baru (Dari Form HTML)
app.post("/api/products", (req: Request, res: Response) => {
  try {
    const result = productService.createProduct(req.body); // req.body dengan method POST
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// ======== API Dasboard =========
// API untuk mendapatkan seluruh transaksi
app.get("/api/transactions", (req: Request, res: Response) => {
  try {
    const result = transactionService.getAllTransactions();
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// API untuk memproses transaksi
app.post("/api/transactions/process", (req: Request, res: Response) => {
  try {
    const { userId, cartItems, paymentStrategy } = req.body;
    const strategy = PaymentFactory.create(paymentStrategy);
    const result = transactionService.checkout(userId, cartItems, strategy);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk mendapatkan data pada dashboard
app.get("/api/reports", (req: Request, res: Response) => {
  try {
    const allTrx = transactionService.getAllTransactions();
    const totalRevenue = allTrx.reduce((sum, t) => sum + t.totalAmount, 0);
    const lowStock = productService.getLowStockProducts();
    return res.json({
      success: true,
      data: {
        totalTransactions: allTrx.length,
        totalRevenue,
        lowStockCount: lowStock.length,
        lowStockProducts: lowStock,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// START SERVER
app.listen(3000, () => {
  console.log(
    "Mini POS Server API Backend menyala bosku di https:localhost:3000",
  );
});
