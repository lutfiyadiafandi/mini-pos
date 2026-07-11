import { ValidationError } from "../errors/AppError.js";
import { PaymentStrategy } from "../interfaces/PaymentStrategy.js";
import { Transaction, TransactionDetail } from "../models/Transaction.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { TransactionRepository } from "../repositories/TransactionRepository.js";
import { LoyaltyService } from "./LoyaltyService.js";

export interface MembershipCheckoutOptions {
  customerId?: number;
  redeemPoints?: number;
}

/**
 * Service untuk proses transaksi POS.
 * Mengorkestrasikan: validasi -> diskon membership (opsional) -> pembayaran -> simpan transaksi -> update stok -> update loyalty
 * Payment strategy diterima secara polymorphic - service tidak tahu
 * apakah ini CashPayment, QRISPayment, TransferPayment, atau CreditCardPayment.
 * Begitu juga DiscountStrategy (lewat LoyaltyService) - service tidak tahu tier customer.
 */
export class TransactionService {
  constructor(
    private transactionRepo: TransactionRepository,
    private productRepo: ProductRepository,
    private loyaltyService: LoyaltyService,
  ) {}

  /**
   * Proses checkout inti dari flow POS.
   * @param userid ID user (kasir) yang memproses transaksi
   * @param cartItems Items di keranjang: productId + quantity
   * @param paymentStrategy Strategy pembayaran (polymorphic!)
   * @param membershipOptions Opsional: customerId + poin yang ingin di-redeem.
   *        Jika tidak diisi, checkout berjalan seperti transaksi non-member (flow lama).
   * @returns Transaction yang berhasil disimpan
   * @throws ValidationError jika cart kosong, stok tidak cukup, pembayaran gagal, atau redeem tidak valid
   */
  checkout(
    userId: number,
    cartItems: { productId: number; quantity: number }[],
    paymentStrategy: PaymentStrategy,
    membershipOptions?: MembershipCheckoutOptions,
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

    // Step 3: Calculate subtotal (kotor, sebelum diskon apapun)
    const subtotal = details.reduce((sum, d) => sum + d.subtotal, 0);

    // Step 4: Hitung diskon membership (jika ada customerId)
    // subtotal -> potong diskon tier -> potong redeem poin -> total bayar
    const customerId = membershipOptions?.customerId;
    const redeemPoints = membershipOptions?.redeemPoints ?? 0;

    let discountAmount = 0;
    let amountAfterTierDiscount = subtotal;

    if (customerId) {
      discountAmount = this.loyaltyService.calculateDiscount(
        customerId,
        subtotal,
      );
      amountAfterTierDiscount = subtotal - discountAmount;

      if (redeemPoints > 0) {
        // Validasi: poin cukup & tidak membuat total bayar < 0
        this.loyaltyService.validateRedeem(
          customerId,
          redeemPoints,
          amountAfterTierDiscount,
        );
      }
    } else if (redeemPoints > 0) {
      throw new ValidationError(
        "Redeem poin hanya bisa dilakukan oleh customer member",
      );
    }

    // 1 poin = Rp 1 potongan
    const totalToPay = amountAfterTierDiscount - redeemPoints;

    // Step 5: Process payment (polymorphic!) — dibayar sejumlah totalToPay, BUKAN subtotal kotor
    const paymentResult = paymentStrategy.processPayment(totalToPay);
    if (!paymentResult.success) {
      throw new ValidationError(`Pembayaran gagal: ${paymentResult.message}`);
    }

    // Step 6: Hitung poin yang didapat — dihitung dari amountAfterTierDiscount,
    // SEBELUM redeem dikurangkan, supaya redeem poin tidak mengurangi perolehan poin baru
    const pointsEarned = customerId
      ? this.loyaltyService.calculatePointsEarned(
          customerId,
          amountAfterTierDiscount,
        )
      : 0;

    // Step 7: Save transaction to database (total_amount yang disimpan = totalToPay, nominal riil dibayar)
    const transaction = this.transactionRepo.create(
      userId,
      details,
      totalToPay,
      paymentStrategy.methodName,
      paymentResult.transactionCode,
      paymentStrategy.methodName === "CASH" ? undefined : undefined,
      paymentResult.changeAmount,
      customerId,
      discountAmount,
      pointsEarned,
    );

    // Step 8: Update stock for each item
    for (const detail of details) {
      this.productRepo.updateStock(detail.productId, -detail.quantity);
    }

    // Step 9: Update loyalty data — HANYA jika transaksi berhasil (SUCCESS) & ada customer
    // totalSpending ditambah dari subtotal KOTOR
    if (customerId) {
      this.loyaltyService.completePurchase(customerId, subtotal, pointsEarned);

      if (redeemPoints > 0) {
        this.loyaltyService.applyRedeem(customerId, redeemPoints);
      }
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

    if (transaction.customerId) {
      lines.push(
        "  ________________________________________________",
        `   Diskon Member : -Rp ${transaction.discountAmount.toLocaleString("id-ID")}`,
        `   Poin Didapat  : +${transaction.pointsEarned}`,
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
