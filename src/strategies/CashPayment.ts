import { PaymentResult, PaymentStrategy } from "../interfaces/PaymentStrategy";

/**
 * Pembayaran tunai (Cash)
 * Memvalidasi apakah uang yang diterima cukup dan menghitung kembalian
 */
export class CashPayment implements PaymentStrategy {
  readonly methodName = "CASH";
  private cashReceived: number;

  constructor(cashReceived: number) {
    if (cashReceived < 0) {
      throw new Error("Jumlah uang tidak boleh negatif");
    }
    this.cashReceived = cashReceived;
  }

  validatePayment(amount: number): boolean {
    // Tunai valid jika uang yang diterima >= jumlah yang harus dibayar
    return this.cashReceived >= amount;
  }

  processPayment(amount: number): PaymentResult {
    if (amount <= 0) {
      return {
        success: false,
        message: "Jumlah pembayaran harus lebih dari 0",
        transactionCode: "",
      };
    }

    if (!this.validatePayment(amount)) {
      return {
        success: false,
        message:
          `Uang tidak cukup: diterima Rp ${this.cashReceived.toLocaleString("id-ID")}, ` +
          `dibutuhkan Rp ${amount.toLocaleString("id-ID")}`,
        transactionCode: "",
      };
    }

    const change = this.cashReceived - amount;
    const transactionCode = `CSH-${Date.now()}`;
    return {
      success: true,
      message:
        `Pembayaran tunai berhasil. ` +
        `Diterima: Rp ${this.cashReceived.toLocaleString("id-ID")}, ` +
        `Kembalian: Rp ${change.toLocaleString("id-ID")}`,
      transactionCode,
      changeAmount: change,
    };
  }

  getPaymentSummary(): string {
    return (
      `Metode Pembayaran: ${this.methodName}. ` +
      `Diterima: Rp ${this.cashReceived.toLocaleString("id-ID")} `
    );
  }
}
