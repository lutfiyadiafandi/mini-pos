import { PaymentResult, PaymentStrategy } from "../interfaces/PaymentStrategy";

export class CreditCardPayment implements PaymentStrategy {
  readonly methodName = "CREDIT_CARD";

  private cardNumber: string;
  private expiryDate: string; // format: "MM/YY"
  private cvv: string;

  constructor(cardNumber: string, expiryDate: string, cvv: string) {
    if (!this.isValidCardNumber(cardNumber)) {
      throw new Error("Nomor kartu tidak valid: harus 16 digit angka");
    }
    if (!this.isValidExpiry(expiryDate)) {
      throw new Error("Expiry date tidak valid atau sudah kadaluarsa");
    }
    if (!this.isValidCvv(cvv)) {
      throw new Error("CVV tidak valid: harus 3 digit angka");
    }

    this.cardNumber = cardNumber;
    this.expiryDate = expiryDate;
    this.cvv = cvv;
  }

  validatePayment(amount: number): boolean {
    return amount > 0 && amount <= 50_000_000; // Simulasi limit kartu kredit
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validatePayment(amount)) {
      return {
        success: false,
        message:
          amount <= 0
            ? "Jumlah pembayaran harus lebih dari 0"
            : `Melebihi limit kartu: maksimal Rp 50.000.000`,
        transactionCode: "",
      };
    }

    const maskedCard = this.cardNumber.slice(-4);
    const transactionCode = `CC-${Date.now()}`;

    return {
      success: true,
      message:
        `Kartu Kredit ${maskedCard} berhasil diproses. ` +
        `Tagihan: Rp ${amount.toLocaleString("id-ID")}`,
      transactionCode,
    };
  }

  getPaymentSummary(): string {
    return (
      `Metode Pembayaran: ${this.methodName}. ` +
      `Kartu: ${this.cardNumber.slice(-4)}, ` +
      `Exp: ${this.expiryDate}`
    );
  }

  // Private validation methods
  private isValidCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s/g, "");
    return /^\d{16}$/.test(digits);
  }

  private isValidExpiry(expiry: string): boolean {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [month, year] = expiry.split("/").map(Number);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100; // ambil 2 digit
    const currentMonth = now.getMonth() + 1;

    // Kartu expired jika tahun lebih kecil, atau tahun sama tapi bulan sudah lewat
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  }

  private isValidCvv(cvv: string): boolean {
    return /^\d{3}$/.test(cvv);
  }
}
