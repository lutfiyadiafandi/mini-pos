import { ReportView } from "../views/ReportView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";
import { SalesReport } from "../reports/SalesReport.js";

/**
 * ReportController - mengelola halaman laporan
 */
export class ReportController {
  private api: BrowserAPI;
  private view: ReportView;
  private currentTransactions: any[] = [];

  constructor() {
    this.api = new BrowserAPI();

    this.view = new ReportView(
      (start, end) => this.handleFilter(start, end),
      () => this.handleExport(),
    );

    this.initialize();
  }

  private async initialize() {
    // Load default (bulan ini)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    await this.handleFilter(
      firstDay.toISOString().slice(0, 10),
      today.toISOString().slice(0, 10),
    );
  }

  private async handleFilter(
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const result = await this.api.transactionFilter(startDate, endDate);

    if (result.success) {
      this.currentTransactions = result.data.map((trx: any) =>
        this.mapTransaction(trx),
      );
      this.view.renderReport(this.currentTransactions);
    } else {
      console.error("Filter error:", result.error);
    }
  }

  private handleExport(): void {
    if (this.currentTransactions.length === 0) {
      alert("Tidak ada data untuk di-export");
      return;
    }
    const report = new SalesReport(this.currentTransactions);
    const csv = report.exportToCSV();

    // Trigger download
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private mapTransaction(trx: any) {
    return {
      id: trx._id,
      code: trx._code,
      userId: trx._userId,
      items: trx._items,
      totalAmount: trx._totalAmount,
      paymentMethod: trx._paymentMethod,
      status: trx._status,
      transactionDate: new Date(trx._transactionDate),
    };
  }
}
