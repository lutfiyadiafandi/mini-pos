import { ValidationError } from "../errors/AppError.js";
import { PaymentStrategy } from "../interfaces/PaymentStrategy.js";
import { Transaction, TransactionDetail } from "../models/Transaction.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { TransactionRepository } from "../repositories/TransactionRepository.js";

/**
 * Service untuk proses transaksi POS.
 * Mengorkestrasikan: validasi -> pembayaran -> simpan transaksi -> update stok
 * Payment strategy diterima secara polymorphic - service tidak tahu
 * apakah ini CashPayment, QRISPayment, TransferPayment, atau CreditCardPayment
 */
export class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private productRepo: ProductRepository,
  ) {}

  /**
   * Proses checkout inti dari flow POS.
   * @param userid ID user (kasir) yang memproses transaksi
   * @param cartItems Items di keranjang: productId + quantity
   * @param paymentStrategy Strategy pembayaran (polymorphic!)
   * @returns Transaction yang berhasil disimpan
   * @throws ValidationError jika cart kosong, stok tidak cukup, atau pemb
   */
  checkout(
    userId: number,
    cartItems: { productId: number; quantity: number }[],
    paymentStrategy: PaymentStrategy,
  ): Transaction {
    // Step 1: Validasi cart tidak kosong
    if (cartItems.length === 0) {
      throw new ValidationError(
        "Cart kosong - tambahkan item sebelum checkout",
      );
    }

    // Step 2: Resolve products & validate stock
    const details: TransactionDetail[] = cartItems.map((item) => {
      if (item.quantity <= 0)
        throw new ValidationError("Quantity harus lebih dari 0");

      const product = this.productRepo.findById(item.productId);

      if (product.stock < item.quantity) {
        throw new ValidationError(
          `Stok ${product.name} tidak cukup (sisa: ${product.stock})`,
        );
      }
      return {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    });

    // Step 3: Calculate total
    const totalAmount = details.reduce((sum, d) => sum + d.subtotal, 0);

    // Step 4: Process payment (polymorphic!)
    const paymentResult = paymentStrategy.processPayment(totalAmount);
    if (!paymentResult.success) {
      throw new ValidationError(`Pembayaran gagal: ${paymentResult.message}`);
    }

    // Step 5: Save transaction to database
    const transaction = this.transactionRepo.create(
      userId,
      details,
      totalAmount,
      paymentStrategy.methodName,
      paymentResult.transactionCode,
      paymentStrategy.methodName === "CASH" ? undefined : undefined,
      paymentResult.changeAmount,
    );

    // Step 6: Update stock for each item
    for (const detail of details) {
      this.productRepo.updateStock(detail.productId, -detail.quantity);
    }

    return transaction;
  }

  /**
   * Ambil semua transaksi
   */
  getAllTransactions(): Transaction[] {
    return this.transactionRepo.findAll();
  }

  /**
   * Ambil transaksi berdasarkan date range
   */
  getByDateRange(startDate: string, endDate: string): Transaction[] {
    return this.transactionRepo.findByDateRange(startDate, endDate);
  }

  /**
   * Generate receipt string untuk console display.
   */
  generateReceipt(transaction: Transaction): string {
    const lines: string[] = [
      "||================================================||",
      "||               MINI POS SYSTEM                  ||",
      "||               STRUK PEMBAYARAN                 ||",
      "||================================================||",
      `   Kode    : ${transaction.code}`,
      `   Tanggal : ${transaction.transactionDate.toLocaleString("id-ID")}`,
      `   Payment : ${transaction.paymentMethod}`,
      "||________________________________________________||",
    ];

    for (const item of transaction.items) {
      lines.push(
        `   ${item.productName}`,
        `     ${item.quantity} x Rp ${item.price.toLocaleString("id-ID")}`,
      );
    }

    lines.push(
      "  ________________________________________________",
      `   TOTAL: Rp ${transaction.totalAmount.toLocaleString("id-ID")}`,
      "  ================================================",
      "                 Terima kasih! 🙏",
      "||================================================||",
    );

    return lines.join("\n");
  }
}
