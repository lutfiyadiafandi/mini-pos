import { PaymentStrategy } from "../interfaces/PaymentStrategy";
import { Product } from "../models/Product";
import { ProductRepository } from "../repositories/ProductRepository";

export class TransactionService {
  private productRepo: ProductRepository;

  constructor(productRepo: ProductRepository) {
    this.productRepo = productRepo;
  }

  checkout(
    cart: { productId: number; quantity: number }[],
    paymentStrategy: PaymentStrategy,
  ): void {
    if (cart.length === 0) {
      console.log("Keranjang masih kosong.");
      return;
    }

    // Validasi semua produk exist dan stok cukup sebelum proses apapun
    const resolvedItems: { product: Product; quantity: number }[] = [];

    for (const cartItem of cart) {
      const product = this.productRepo.findById(cartItem.productId);
      if (!product)
        throw new Error(
          `Produk dengan ID ${cartItem.productId} tidak ditemukan`,
        );

      if (!product.isActive)
        throw new Error(`Produk ${product.name} tidak tersedia`);

      if (cartItem.quantity > product.stock) {
        throw new Error(
          `Stok ${product.name} tidak cukup: diminta ${cartItem.quantity}, tersedia ${product.stock}`,
        );
      }

      resolvedItems.push({ product, quantity: cartItem.quantity });
    }

    // Hitung total
    const total = resolvedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    // Tampilkan
    console.log("--- CHECKOUT ---");
    console.log(`${paymentStrategy.getPaymentSummary()}`);
    console.log("Items:");
    for (const item of resolvedItems) {
      const subtotal = item.product.price * item.quantity;
      console.log(
        `  ${item.product.name} x${item.quantity} = Rp ${subtotal.toLocaleString("id-ID")}`,
      );
    }
    console.log(`Total  : Rp ${total.toLocaleString("id-ID")}`);

    // Proses pembayaran — polymorphic, tidak peduli implementasi mana
    const result = paymentStrategy.processPayment(total);

    console.log(`Status : ${result.success ? "SUCCESS" : "FAILED"}`);
    console.log(`Message: ${result.message}`);
    console.log(`Code   : ${result.transactionCode ?? ""}`);
    console.log("--- END ---\n");
  }
}
