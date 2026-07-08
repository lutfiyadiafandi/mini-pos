import { PaymentResult, PaymentStrategy } from "../interfaces/PaymentStrategy";

/**
 * Pembayaran transfer bank (simulasi)
 * Generate nomor virtual account dummy dan simulasikan konfirmasi manual
 */
export class TransferPayment implements PaymentStrategy {
  readonly methodName = "TRANSFER";
  private bankName: string;
  private vaNumber: string;

  private static SUPPORTED_BANKS = ["BCA", "BNI", "BRI", "MANDIRI"];

  private static BANK_CODES: Record<string, string> = {
    BCA: "014",
    BNI: "009",
    BRI: "002",
    MANDIRI: "008",
  };

  constructor(bankName: string = "BCA") {
    if (!TransferPayment.SUPPORTED_BANKS.includes(bankName.toUpperCase())) {
      throw new Error(
        `Bank '${bankName}' tidak didukung. Pilihan: ${TransferPayment.SUPPORTED_BANKS.join(", ")}`,
      );
    }
    this.bankName = bankName.toUpperCase();
    this.vaNumber = this.generateVANumber();
  }

  validatePayment(amount: number): boolean {
    // Transfer selalu valid selama jumlah > 0
    return amount > 0;
  }

  processPayment(amount: number): PaymentResult {
    if (amount <= 0) {
      return {
        success: false,
        message: "Jumlah pembayaran harus lebih dari 0",
        transactionCode: "",
      };
    }

    const transactionCode = `TRF-${Date.now()}`;

    return {
      success: true,
      message:
        `Transfer ${this.bankName} berhasil. ` +
        `VA: ${this.vaNumber} | ` +
        `Jumlah: Rp ${amount.toLocaleString("id-ID")}`,
      transactionCode,
    };
  }

  getPaymentSummary(): string {
    return (
      `Metode Pembayaran: ${this.methodName}. ` +
      `Bank: ${this.bankName}, ` +
      `VA: ${this.vaNumber}`
    );
  }

  public generateVANumber(): string {
    const code = TransferPayment.BANK_CODES[this.bankName] ?? "000";
    const random = Math.floor(Math.random() * 10_000_000_000)
      .toString()
      .padStart(10, "0");
    return `${code}${random}`;
  }

  public getVANumber(): string {
    return this.vaNumber;
  }

  public getBankName(): string {
    return this.bankName;
  }
}
