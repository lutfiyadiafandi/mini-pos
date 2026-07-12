import { Product } from "../models/Product.js";

/**
 * DashboardView render metrics dan alert di halaman dashboard.
 */
export class DashboardView {
  /**
   * Render metrics cards.
   */
  renderMetrics(data: {
    revenue: number;
    trxCount: number;
    lowStockCount: number;
  }): void {
    const revenueEl = document.querySelector("#today-revenue");
    const trxEl = document.querySelector("#today-trx");
    const lowStockEl = document.querySelector("#low-stock-count");

    if (revenueEl) {
      revenueEl.textContent = `Rp ${data.revenue.toLocaleString("id-ID")}`;
    }
    if (trxEl) {
      trxEl.textContent = String(data.trxCount);
    }
    if (lowStockEl) {
      lowStockEl.textContent = String(data.lowStockCount);
    }
  }

  /**
   * Render tabel produk low stock.
   */
  renderLowStockTable(products: Product[]): void {
    const tableBody = document.querySelector("#low-stock-table");
    if (!tableBody) return;

    if (products.length === 0) {
      tableBody.innerHTML = `
                           <tr>
                                <td colspan="3" style="text-align: center;">Semua stok aman</td>
                           </tr>
                           `;
      return;
    }

    tableBody.innerHTML = products
      .map(
        (p) => `            <tr>
                                <td><code>${p.sku}</code></td>
                                <td>${p.name}</td>
                                <td><mark>${p.stock}</mark></td>
                           </tr>
                `,
      )
      .join("");
  }

  /**
   * Render statistik membership (jumlah member per tier + total poin).
   */
  renderMembershipStats(data: {
    totalMembers: number;
    regularCount: number;
    goldCount: number;
    vipCount: number;
    totalPoints: number;
  }): void {
    const totalEl = document.querySelector("#member-total-count");
    const regularEl = document.querySelector("#member-regular-count");
    const goldEl = document.querySelector("#member-gold-count");
    const vipEl = document.querySelector("#member-vip-count");
    const pointsEl = document.querySelector("#member-total-points");

    if (totalEl) totalEl.textContent = String(data.totalMembers);
    if (regularEl) regularEl.textContent = String(data.regularCount);
    if (goldEl) goldEl.textContent = String(data.goldCount);
    if (vipEl) vipEl.textContent = String(data.vipCount);
    if (pointsEl)
      pointsEl.textContent = data.totalPoints.toLocaleString("id-ID");
  }

  /**
   * Render tabel top customers.
   */
  renderTopCustomers(
    customers: {
      name: string;
      tier: string;
      totalSpending: number;
      points: number;
    }[],
  ): void {
    const tableBody = document.querySelector("#top-customers-table");
    if (!tableBody) return;

    if (customers.length === 0) {
      tableBody.innerHTML = `
                           <tr>
                                <td colspan="4" style="text-align: center;">Belum ada data member</td>
                           </tr>
                           `;
      return;
    }

    tableBody.innerHTML = customers
      .map(
        (c) => `            <tr>
                                <td>${c.name}</td>
                                <td>${this.renderTierBadge(c.tier)}</td>
                                <td>Rp ${c.totalSpending.toLocaleString("id-ID")}</td>
                                <td>${c.points.toLocaleString("id-ID")}</td>
                           </tr>
                `,
      )
      .join("");
  }

  private renderTierBadge(tier: string): string {
    const colorMap: Record<string, string> = {
      REGULAR: "",
      GOLD: "pico-background-amber-500",
      VIP: "pico-background-violet-500",
    };
    const cls = colorMap[tier] ?? "";
    return `<mark class="${cls}">${tier}</mark>`;
  }
}
