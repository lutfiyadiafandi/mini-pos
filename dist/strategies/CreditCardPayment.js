"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardPayment = void 0;
class CreditCardPayment {
    methodName = "CREDIT_CARD";
    cardNumber;
    expiryDate; // format: "MM/YY"
    cvv;
    constructor(cardNumber, expiryDate, cvv) {
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
    validatePayment(amount) {
        return amount > 0 && amount <= 50_000_000; // Simulasi limit kartu kredit
    }
    processPayment(amount) {
        if (!this.validatePayment(amount)) {
            return {
                success: false,
                message: amount <= 0
                    ? "Jumlah pembayaran harus lebih dari 0"
                    : `Melebihi limit kartu: maksimal Rp 50.000.000`,
                transactionCode: "",
            };
        }
        const maskedCard = this.cardNumber.slice(-4);
        const transactionCode = `CC-${Date.now()}`;
        return {
            success: true,
            message: `Kartu Kredit ${maskedCard} berhasil diproses. ` +
                `Tagihan: Rp ${amount.toLocaleString("id-ID")}`,
            transactionCode,
        };
    }
    getPaymentSummary() {
        return (`Metode Pembayaran: ${this.methodName}. ` +
            `Kartu: ${this.cardNumber.slice(-4)}, ` +
            `Exp: ${this.expiryDate}`);
    }
    // Private validation methods
    isValidCardNumber(cardNumber) {
        const digits = cardNumber.replace(/\s/g, "");
        return /^\d{16}$/.test(digits);
    }
    isValidExpiry(expiry) {
        if (!/^\d{2}\/\d{2}$/.test(expiry))
            return false;
        const [month, year] = expiry.split("/").map(Number);
        if (month < 1 || month > 12)
            return false;
        const now = new Date();
        const currentYear = now.getFullYear() % 100; // ambil 2 digit
        const currentMonth = now.getMonth() + 1;
        // Kartu expired jika tahun lebih kecil, atau tahun sama tapi bulan sudah lewat
        if (year < currentYear)
            return false;
        if (year === currentYear && month < currentMonth)
            return false;
        return true;
    }
    isValidCvv(cvv) {
        return /^\d{3}$/.test(cvv);
    }
}
exports.CreditCardPayment = CreditCardPayment;
