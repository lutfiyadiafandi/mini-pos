import express, { Request, Response } from "express";
import cors from "cors";
// (Panggil semua class Repository dan Service yang kita buat pada Praktikum 8)
import { DatabaseConnection } from "./database/connection.js";
import { ProductRepository } from "./repositories/ProductRepository.js";
import { CategoryRepository } from "./repositories/CategoryRepository.js";
import { TransactionRepository } from "./repositories/TransactionRepository.js";
import { UserRepository } from "./repositories/UserRepository.js";
import { CustomerRepository } from "./repositories/CustomerRepository.js";
import { ProductService } from "./services/ProductService.js";
import { CategoryService } from "./services/CategoryService.js";
import { TransactionService } from "./services/TransactionService.js";
import { AuthService } from "./services/AuthService.js";
import { UserService } from "./services/UserService.js";
import { LoyaltyService } from "./services/LoyaltyService.js";
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
const userRepo = new UserRepository();
const customerRepo = new CustomerRepository();

const categoryService = new CategoryService(categoryRepo);
const productService = new ProductService(productRepo, categoryRepo);
const loyaltyService = new LoyaltyService(customerRepo);
const transactionService = new TransactionService(
  transactionRepo,
  productRepo,
  loyaltyService,
);
const authService = new AuthService();
const userService = new UserService(userRepo);

// ======= ENDPOINT ROUTES ======

// ======== API Products =========
// API untuk mendapatkan seluruh produk
app.get("/api/products", (req: Request, res: Response) => {
  try {
    const result = productService.getAllProducts(); // Logic PBO
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// API untuk mendapatkan produk berdasarkan ID
app.get("/api/products/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = productService.getProductById(id); // Logic PBO();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
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

// API untuk memperbarui produk
app.patch("/api/products/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = productService.updateProduct(id, req.body); // req.body dengan method PATCH
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk menghapus produk
app.delete("/api/products/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = productService.deleteProduct(id); // req.body dengan method DELETE
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// ======== API Categories =========
// API untuk mendapatkan seluruh kategori
app.get("/api/categories", (req: Request, res: Response) => {
  try {
    const result = categoryService.getAllCategories(); // Logic PBO
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// API untuk mendapatkan kategori berdasarkan ID
app.get("/api/categories/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = categoryService.getCategoryById(id); // Logic PBO();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// API untuk menyimpan kategori baru (Dari Form HTML)
app.post("/api/categories", (req: Request, res: Response) => {
  try {
    const result = categoryService.createCategory(req.body); // req.body dengan method POST
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk memperbarui kategori
app.patch("/api/categories/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = categoryService.updateCategory(id, req.body); // req.body dengan method PATCH
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk menghapus kategori
app.delete("/api/categories/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = categoryService.deleteCategory(id); // req.body dengan method DELETE
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// ======== API Transactions =========
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
    const { userId, cartItems, paymentStrategy, customerId, redeemPoints } =
      req.body;
    const strategy = PaymentFactory.create(paymentStrategy);
    const result = transactionService.checkout(userId, cartItems, strategy, {
      customerId,
      redeemPoints,
    });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// ======== API Reports =========
// API untuk filter transaksi
app.get("/api/transactions/filter", (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };
    const result = transactionService.getByDateRange(startDate, endDate);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// ======== API Dasboard =========
// API untuk mendapatkan data pada dashboard
app.get("/api/reports", (req: Request, res: Response) => {
  try {
    const allTrx = transactionService.getAllTransactions();
    const totalRevenue = allTrx.reduce((sum, t) => sum + t.totalAmount, 0);
    const lowStock = productService.getLowStockProducts();
    const membershipStats = loyaltyService.getMembershipStats();
    return res.json({
      success: true,
      data: {
        totalTransactions: allTrx.length,
        totalRevenue,
        lowStockCount: lowStock.length,
        lowStockProducts: lowStock,
        membershipStats,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// ======== API Auth =========
// API untuk login
app.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const result = authService.login(username, password);
    return res.status(200).json({
      success: true,
      data: mapUser(result),
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// ======== API Users =========
// API untuk mendapatkan seluruh user
app.get("/api/users", (req: Request, res: Response) => {
  try {
    const result = userService.getAllUsers(); // Logic PBO
    return res.status(200).json({ success: true, data: result.map(mapUser) });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// API untuk mendapatkan user berdasarkan ID
app.get("/api/users/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = userService.getUserById(id); // Logic PBO();
    return res.status(200).json({ success: true, data: mapUser(result) });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// API untuk menambahkan user baru
app.post("/api/users", (req: Request, res: Response) => {
  try {
    const result = userService.createUser(req.body); // req.body dengan method POST
    return res.status(201).json({ success: true, data: mapUser(result) });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk memperbarui data user
app.patch("/api/users/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = userService.updateUser(id, req.body); // req.body dengan method PATCH
    return res.status(200).json({ success: true, data: mapUser(result) });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk menghapus user
app.delete("/api/users/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = userService.deleteUser(id); // req.body dengan method DELETE
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// ======== API Customers =========
// API untuk mendapatkan seluruh customer
app.get("/api/customers", (req: Request, res: Response) => {
  try {
    const result = loyaltyService.getAllCustomers();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// API untuk mendapatkan customer berdasarkan ID
app.get("/api/customers/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = loyaltyService.getCustomerById(id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// API untuk mendaftarkan member baru
app.post("/api/customers", (req: Request, res: Response) => {
  try {
    const result = loyaltyService.registerCustomer(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk memperbarui profil customer
app.patch("/api/customers/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = loyaltyService.updateCustomerProfile(id, req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk soft delete customer
app.delete("/api/customers/:id", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = loyaltyService.deleteCustomer(id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, error: String(error) });
  }
});

// API untuk riwayat belanja seorang customer
app.get("/api/customers/:id/transactions", (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = transactionService.getTransactionsByCustomerId(id);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(404).json({ success: false, error: String(error) });
  }
});

// ======== API Loyalty =========
// API untuk laporan top customers
app.get("/api/loyalty/top-customers", (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = loyaltyService.getTopCustomers(limit);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

function mapUser(user: any) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.getRole(),
  };
}

// START SERVER
app.listen(3000, () => {
  console.log(
    "Mini POS Server API Backend menyala bosku di https:localhost:3000",
  );
});
