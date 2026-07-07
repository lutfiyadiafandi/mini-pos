import {
  PaymentConfig,
  PaymentStrategy,
} from "../interfaces/PaymentStrategy.js";
import { CashPayment } from "./CashPayment.js";
import { CreditCardPayment } from "./CreditCardPayment.js";
import { QRISPayment } from "./QRISPayment.js";
import { TransferPayment } from "./TransferPayment.js";

export class PaymentFactory {
  static create(config: PaymentConfig): PaymentStrategy {
    switch (config.method) {
      case "CASH":
        return new CashPayment(config.cashReceived);

      case "QRIS":
        return new QRISPayment();

      case "TRANSFER":
        return new TransferPayment(config.bankName);

      case "CREDIT_CARD":
        return new CreditCardPayment(
          config.cardNumber,
          config.expiryDate,
          config.cvv,
        );
    }
  }

  static getAvailableMethods(): string[] {
    return ["CASH", "QRIS", "TRANSFER", "CREDIT_CARD"];
  }
}
