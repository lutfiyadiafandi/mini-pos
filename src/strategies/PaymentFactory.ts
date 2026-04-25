import { PaymentConfig, PaymentStrategy } from "../interfaces/PaymentStrategy";
import { CashPayment } from "./CashPayment";
import { CreditCardPayment } from "./CreditCardPayment";
import { QRISPayment } from "./QRISPayment";
import { TransferPayment } from "./TransferPayment";

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
