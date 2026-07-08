import { PaymentConfig } from "../interfaces/PaymentStrategy.js";
import { QRCodeService } from "../services/QRCodeService.js";
import { TransferPayment } from "../strategies/TransferPayment.js";

/**
 * Payment Modal modal dialog untuk memilih dan memproses pembayaran.
 */
export class PaymentModal {
  private modalEl: HTMLDialogElement | null = null;
  private qrCodeService = new QRCodeService();

  /**
   * Tampilkan modal pembayaran.
   * @param totalAmount Total yang harus dibayar
   * @param onConfirm Callback saat pembayaran dikonfirmasi
   */
  show(
    totalAmount: number,
    onConfirm: (strategy: PaymentConfig) => void,
  ): void {
    // Buat modal element
    this.modalEl = document.createElement("dialog");
    this.modalEl.id = "payment-modal";
    this.modalEl.innerHTML = `
        <article style="min-width: 400px;">
            <header>
                <h3>Pembayaran</h3>
                <p>Total: <strong>Rp ${totalAmount.toLocaleString("id-ID")}</strong></p>
            </header>
            
            <div>
                <p>Pilih metode pembayaran:</p>

                <!-- Cash Payment -->
                <details open>
                    <summary>Tunai (Cash)</summary>
                    <label>
                        Uang Diterima (Rp)
                        <input type="number" id="cash-received" min="${totalAmount}" placeholder="Masukkan jumlah uang" />
                    </label>
                    <p id="cash-change" style="font-weight: bold;"></p>
                    <button id="btn-pay-cash">Bayar Tunai</button>
                </details>

                <!-- QRIS Payment -->
                <details id="details-qris">
                    <summary>QRIS</summary>
                    <div id="qris-container" style="text-align: center;">
                        <p>Buka tab ini untuk generate QR Code</p>
                        <div id="qr-image-container"></div>
                    </div>
                    <button id="btn-pay-qris">Konfirmasi QRIS</button>
                </details>

                <!-- Transfer Payment -->
                <details id="details-transfer">
                    <summary>Transfer Bank</summary>
                    <label>
                        Bank
                        <select id="transfer-bank">
                            <option value="BCA">BCA</option>
                            <option value="BNI">BNI</option>
                            <option value="BRI">BRI</option>
                            <option value="MANDIRI">Mandiri</option>
                        </select>
                    </label>
                    <button id="btn-generate-va" class="secondary">
                        Generate Virtual Account
                    </button>
                    <article id="transfer-va-box" style="display:none; text-align:center; margin-top: 10px; margin-bottom: 10px;">
                    </article>
                    <button id="btn-pay-transfer">Konfirmasi Transfer</button>
                </details>
            </div>
            
            <footer>
                <button id="btn-cancel-payment" class="outline secondary">Batal</button>
            </footer>
        </article>
    `;

    document.body.appendChild(this.modalEl);
    this.modalEl.showModal();

    // --- Bind Events

    // Cash: hitung kembalian realtime
    const cashInput = this.modalEl.querySelector(
      "#cash-received",
    ) as HTMLInputElement;
    const cashChange = this.modalEl.querySelector(
      "#cash-change",
    ) as HTMLParagraphElement;
    cashInput.addEventListener("input", () => {
      const received = Number(cashInput.value);
      if (received >= totalAmount) {
        const change = received - totalAmount;
        cashChange.textContent = `Kembalian: Rp ${change.toLocaleString("id-ID")}`;
        cashChange.style.color = "green";
      } else {
        cashChange.textContent = "Uang belum cukup";
        cashChange.style.color = "red";
      }
    });

    // Pay Cash
    this.modalEl
      .querySelector("#btn-pay-cash")!
      .addEventListener("click", () => {
        const received = Number(cashInput.value);
        if (received < totalAmount) {
          alert("Uang tidak cukup!");
          return;
        }
        this.close();
        onConfirm({
          method: "CASH",
          cashReceived: received,
        });
      });

    // QRIS: generate QR Code
    const detailsQris = this.modalEl.querySelector(
      "#details-qris",
    ) as HTMLDetailsElement;
    const qrContainer = this.modalEl.querySelector(
      "#qr-image-container",
    ) as HTMLElement;
    let qrGenerated = false;
    detailsQris.addEventListener("toggle", async () => {
      if (detailsQris.open && !qrGenerated) {
        qrGenerated = true;
        const code = `TRX-${Date.now()}`;
        await this.qrCodeService.renderQR(qrContainer, code, totalAmount);
      }
    });

    // Pay QRIS
    this.modalEl
      .querySelector("#btn-pay-qris")!
      .addEventListener("click", () => {
        this.close();
        onConfirm({
          method: "QRIS",
        });
      });

    // Generate VA number
    this.modalEl
      .querySelector("#btn-generate-va")!
      .addEventListener("click", () => {
        const bank = (
          this.modalEl!.querySelector("#transfer-bank") as HTMLSelectElement
        ).value;
        const transfer = new TransferPayment(bank);

        const box = this.modalEl!.querySelector(
          "#transfer-va-box",
        ) as HTMLElement;

        box.style.display = "block";
        box.innerHTML = `
              <h6>Virtual Account</h6>
              <p><strong>BANK :</strong> ${transfer.getBankName()}</p>
              <p><strong>VA :</strong> ${transfer.getVANumber()}</p>
              <small>
                  <strong>Total Pembayaran : </strong>
                  Rp ${totalAmount.toLocaleString("id-ID")}
              </small>
        `;
      });

    // Transfer
    this.modalEl
      .querySelector("#btn-pay-transfer")!
      .addEventListener("click", () => {
        const bank = (
          this.modalEl!.querySelector("#transfer-bank") as HTMLSelectElement
        ).value;
        this.close();
        onConfirm({
          method: "TRANSFER",
          bankName: bank,
        });
      });

    // Cancel
    this.modalEl
      .querySelector("#btn-cancel-payment")!
      .addEventListener("click", () => {
        this.close();
      });
  }

  /**
   * Tutup dan hapus modal
   */
  close(): void {
    if (this.modalEl) {
      this.modalEl.close();
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
