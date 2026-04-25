// Discriminated Union yang type-safe
export type PaymentConfig =
  | { method: "CASH"; cashReceived: number }
  | { method: "QRIS" }
  | { method: "TRANSFER"; bankName?: string }
  | {
      method: "CREDIT_CARD";
      cardNumber: string;
      expiryDate: string;
      cvv: string;
    };

/**
 * Hasil dari proses pembayaran
 * Interface ini menstandarisasi response dari semua payment method
 */
export interface PaymentResult {
  success: boolean;
  message: string;
  transactionCode: string;
  changeAmount?: number; // Opsional - hanya untuk cash payment
}

/**
 * Kontrak untuk semua payment method
 * Setiap payment method harus mengimplementasikan interface ini
 */
export interface PaymentStrategy {
  /**
   * Nama method pembayaran (readonly - tidak bisa diubah setelah diinisialisasi)
   */
  readonly methodName: string;

  /**
   * Proses pembayaran dengan jumlah tertentu
   * @param amount Jumlah yang harus dibayar
   * @returns PaymentResult berisi status dan detail pembayaran
   */
  processPayment(amount: number): PaymentResult;

  /**
   * Validasi apakah pembayaran bisa dilakukan
   * @param amount Jumlah yang harus dibayar
   * @returns true jika pembayaran valid, false jika tidak valid
   */
  validatePayment(amount: number): boolean;

  /**
   * Ringkasan informasi terkait payment method
   */
  getPaymentSummary(): string;
}
