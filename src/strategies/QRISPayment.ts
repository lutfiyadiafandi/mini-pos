import { PaymentResult, PaymentStrategy } from "../interfaces/PaymentStrategy";

/**
 * Pembayaran QRIS (simulasi)
 * Dalam implementasi nyata, ini akan generate QR Code dan menunggu konfirmasi.
 * Untuk praktikum kita simulasikan pembayaran selalu berhasil
 */
export class QRISPayment implements PaymentStrategy {
  readonly methodName = "QRIS";

  validatePayment(amount: number): boolean {
    // QRIS selalu valid selama jumlah > 0
    return amount > 0 && amount <= 5_000_000; // Simulasi limit QRIS
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
          `Transaksi QRIS maksimal Rp 5.000.000, ` +
          `Jumlah: Rp ${amount.toLocaleString("id-ID")}`,
        transactionCode: "",
      };
    }

    // Simulasi: generate QR payload dana auto success
    const transactionCode = `QR-${Date.now()}`;
    return {
      success: true,
      message:
        `QRIS: Rp ${amount.toLocaleString("id-ID")} - pembayaran dikonfirmasi. ` +
        `QR Payload: ${transactionCode}`,
      transactionCode,
    };
  }

  getPaymentSummary(): string {
    return (
      `Metode Pembayaran: ${this.methodName}. ` + `QR Payload: QR-${Date.now()}`
    );
  }
}
