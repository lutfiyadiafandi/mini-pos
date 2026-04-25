"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferPayment = void 0;
/**
 * Pembayaran transfer bank (simulasi)
 * Generate nomor virtual account dummy dan simulasikan konfirmasi manual
 */
class TransferPayment {
    methodName = "TRANSFER";
    bankName;
    static SUPPORTED_BANKS = ["BCA", "BNI", "BRI", "MANDIRI"];
    static BANK_CODES = {
        BCA: "014",
        BNI: "009",
        BRI: "002",
        MANDIRI: "008",
    };
    constructor(bankName = "BCA") {
        if (!TransferPayment.SUPPORTED_BANKS.includes(bankName.toUpperCase())) {
            throw new Error(`Bank '${bankName}' tidak didukung. Pilihan: ${TransferPayment.SUPPORTED_BANKS.join(", ")}`);
        }
        this.bankName = bankName.toUpperCase();
    }
    validatePayment(amount) {
        // Transfer selalu valid selama jumlah > 0
        return amount > 0;
    }
    processPayment(amount) {
        if (amount <= 0) {
            return {
                success: false,
                message: "Jumlah pembayaran harus lebih dari 0",
                transactionCode: "",
            };
        }
        // Generate nomor VA dummy
        const vaNumber = this.generateVANumber();
        const transactionCode = `TRF-${Date.now()}`;
        return {
            success: true,
            message: `Transfer ${this.bankName} berhasil. ` +
                `VA: ${vaNumber} | ` +
                `Jumlah: Rp ${amount.toLocaleString("id-ID")}`,
            transactionCode,
        };
    }
    getPaymentSummary() {
        return (`Metode Pembayaran: ${this.methodName}. ` +
            `Bank: ${this.bankName}, ` +
            `VA: ${this.generateVANumber()}`);
    }
    generateVANumber() {
        const code = TransferPayment.BANK_CODES[this.bankName] ?? "000";
        const random = Math.floor(Math.random() * 10_000_000_000)
            .toString()
            .padStart(10, "0");
        return `${code}${random}`;
    }
}
exports.TransferPayment = TransferPayment;
