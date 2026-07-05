import { DashboardView } from "../views/DashboardView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";

export class DashboardController {
  private view: DashboardView;
  private api: BrowserAPI;

  constructor() {
    this.api = new BrowserAPI();
    this.view = new DashboardView();
    this.initialize();
  }

  private async initialize() {
    await this.loadReports();
  }

  /**
   * Merender metrics dan alert di halaman dashboard
   */
  private async loadReports(): Promise<void> {
    try {
      const result = await this.api.reportsGetAll();

      if (result.success && result.data) {
        this.view.renderMetrics({
          revenue: result.data.totalRevenue,
          trxCount: result.data.totalTransactions,
          lowStockCount: result.data.lowStockCount,
        });
        this.view.renderLowStockTable(
          result.data.lowStockProducts.map((product: any) =>
            this.mapProduct(product),
          ),
        );
      }
    } catch (err) {
      console.error("Gagal load reports:", err);
    }
  }
  private mapProduct(product: any) {
    return {
      id: product._id,
      sku: product._sku,
      name: product._name,
      stock: product._stock,
      isLowStock: true,
    };
  }
}
