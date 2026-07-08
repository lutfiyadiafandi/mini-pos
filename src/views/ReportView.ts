import { Transaction } from "../models/Transaction.js";
import { SalesReport } from "../reports/SalesReport.js";

/**
 * ReportView - render halaman laporan penjualan
 */
export class ReportView {
  private tableBody: HTMLTableSectionElement;
  private byMethodBody: HTMLTableSectionElement;
  private totalRevenueEl: HTMLElement;
  private trxCountEl: HTMLElement;
  private exportBtn: HTMLButtonElement;
  private filterBtn: HTMLButtonElement;
  private startDateInput: HTMLInputElement;
  private endDateInput: HTMLInputElement;

  private onFilter: (startDate: string, endDate: string) => void;
  private onExport: () => void;

  constructor(
    onFilter: (startDate: string, endDate: string) => void,
    onExport: () => void,
  ) {
    this.onFilter = onFilter;
    this.onExport = onExport;

    this.tableBody = document.querySelector("#report-table-body")!;
    this.byMethodBody = document.querySelector("#report-by-method")!;
    this.totalRevenueEl = document.querySelector("#report-total-revenue")!;
    this.trxCountEl = document.querySelector("#report-trx-count")!;
    this.exportBtn = document.querySelector(
      "#btn-export-csv",
    ) as HTMLButtonElement;
    this.filterBtn = document.querySelector(
      "#btn-filter-report",
    ) as HTMLButtonElement;
    this.startDateInput = document.querySelector(
      "#report-start-date",
    ) as HTMLInputElement;
    this.endDateInput = document.querySelector(
      "#report-end-date",
    ) as HTMLInputElement;

    // Set default date (this month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.startDateInput.value = firstDay.toISOString().slice(0, 10);
    this.endDateInput.value = today.toISOString().slice(0, 10);

    // Events
    this.filterBtn.addEventListener("click", () => {
      this.onFilter(this.startDateInput.value, this.endDateInput.value);
    });
    this.exportBtn.addEventListener("click", () => this.onExport());
  }

  /**
   * Render report data
   */
  renderReport(transactions: Transaction[]): void {
    const report = new SalesReport(transactions);

    // Summary
    this.totalRevenueEl.textContent = `Rp ${report.totalRevenue().toLocaleString("id-ID")}`;
    this.trxCountEl.textContent = String(report.successfulTransactionCount());

    // Revenue by method
    const byMethod = report.revenuePaymentMethod();
    this.byMethodBody.innerHTML = Array.from(byMethod.entries())
      .map(([method, revenue]) => {
        const count = transactions.filter(
          (t) => t.paymentMethod === method,
        ).length;
        return `
                <tr>
                    <td><strong>${method}</strong></td>
                    <td>${count}</td>
                    <td>Rp ${revenue.toLocaleString("id-ID")}</td>
                </tr>
      `;
      })
      .join("");

    // Transactions table
    if (transactions.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Tidak ada transaksi</td></tr>`;
      return;
    }

    this.tableBody.innerHTML = transactions
      .map(
        (t) => `
            <tr>
                <td><code>${t.code}</code></td>
                <td>${t.transactionDate.toLocaleString("id-ID")}</td>
                <td>${t.paymentMethod}</td>
                <td>Rp ${t.totalAmount.toLocaleString("id-ID")}</td>
                <td>${t.status === "SUCCESS" ? "<mark>SUCCESS</mark>" : t.status}</td>
            </tr>
    `,
      )
      .join("");
  }
}
