"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFactory = void 0;
const CashPayment_1 = require("./CashPayment");
const CreditCardPayment_1 = require("./CreditCardPayment");
const QRISPayment_1 = require("./QRISPayment");
const TransferPayment_1 = require("./TransferPayment");
class PaymentFactory {
    static create(config) {
        switch (config.method) {
            case "CASH":
                return new CashPayment_1.CashPayment(config.cashReceived);
            case "QRIS":
                return new QRISPayment_1.QRISPayment();
            case "TRANSFER":
                return new TransferPayment_1.TransferPayment(config.bankName);
            case "CREDIT_CARD":
                return new CreditCardPayment_1.CreditCardPayment(config.cardNumber, config.expiryDate, config.cvv);
        }
    }
    static getAvailableMethods() {
        return ["CASH", "QRIS", "TRANSFER", "CREDIT_CARD"];
    }
}
exports.PaymentFactory = PaymentFactory;
