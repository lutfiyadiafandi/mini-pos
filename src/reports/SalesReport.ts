import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Transaction } from "../models/Transaction";

export class SalesReport {
  constructor(private transactions: Transaction[]) {}

  // Total revenue dari transaksi berhasil
  totalRevenue(): number {
    return this.transactions
      .filter((t) => t.status === "SUCCESS")
      .reduce((sum, t) => sum + t.totalAmount, 0);
  }

  // Jumlah transaksi berhasil
  successfulTransactionCount(): number {
    return this.transactions.filter((t) => t.status === "SUCCESS").length;
  }

  // Revenue per payment method
  revenuePaymentMethod(): Map<string, number> {
    return this.transactions
      .filter((t) => t.status === "SUCCESS")
      .reduce((map, t) => {
        const current = map.get(t.paymentMethod) ?? 0;
        map.set(t.paymentMethod, current + t.totalAmount);
        return map;
      }, new Map<string, number>());
  }

  // Revenue per category
  getRevenueByCategory(
    categories: Category[],
    products: Product[],
  ): Map<string, number> {
    const productCategoryMap = new Map<number, number>(
      products.map((p) => [p.id, p.categoryId]),
    );
    const categoryNameMap = new Map<number, string>(
      categories.map((c) => [c.id, c.name]),
    );

    return this.transactions
      .filter((t) => t.status === "SUCCESS")
      .flatMap((t) => t.items)
      .reduce((map, item) => {
        const categoryId = productCategoryMap.get(item.productId);
        if (categoryId === undefined) return map;

        const categoryName = categoryNameMap.get(categoryId) ?? "Unknown";
        const current = map.get(categoryName) ?? 0;
        map.set(categoryName, current + item.subtotal);
        return map;
      }, new Map<string, number>());
  }

  // Top selling products berdasarkan quantity
  topSellingProducts(
    n: number = 5,
  ): { productName: string; qtySold: number; revenue: number }[] {
    const allItems = this.transactions
      .filter((t) => t.status === "SUCCESS")
      .flatMap((t) => t.items);

    const grouped = allItems.reduce((map, item) => {
      const key = item.productName;
      const existing = map.get(key) ?? {
        productName: key,
        qtySold: 0,
        revenue: 0,
      };
      existing.qtySold += item.quantity;
      existing.revenue += item.subtotal;
      map.set(key, existing);
      return map;
    }, new Map<string, { productName: string; qtySold: number; revenue: number }>());

    return Array.from(grouped.values())
      .sort((a, b) => b.qtySold - a.qtySold)
      .slice(0, n);
  }

  // Filter transaksi berdasarkan date range
  transactionsByDateRange(start: Date, end: Date): Transaction[] {
    return this.transactions.filter(
      (t) => t.transactionDate >= start && t.transactionDate <= end,
    );
  }

  // Ringkasan harian
  dailySummary(dateString: string): { count: number; revenue: number } {
    const dayTrx = this.transactions.filter(
      (t) =>
        t.transactionDate.toISOString().startsWith(dateString) &&
        t.status === "SUCCESS",
    );

    return {
      count: dayTrx.length,
      revenue: dayTrx.reduce((sum, t) => sum + t.totalAmount, 0),
    };
  }

  // Revenue per hari
  dailyRevenue(): Map<string, number> {
    const dailyMap = this.transactions
      .filter((t) => t.status === "SUCCESS")
      .reduce((map, t) => {
        const dateKey = t.transactionDate.toISOString().slice(0, 10);
        const current = map.get(dateKey) ?? 0;
        map.set(dateKey, current + t.totalAmount);
        return map;
      }, new Map<string, number>());

    return new Map(
      Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0])),
    );
  }

  // Distribusi per jam
  getHourDistribution(): Map<number, number> {
    const hourMap = this.transactions
      .filter((t) => t.status === "SUCCESS")
      .reduce((map, t) => {
        const hour = t.transactionDate.getHours();
        const current = map.get(hour) ?? 0;
        map.set(hour, current + 1);
        return map;
      }, new Map<number, number>());

    return new Map(Array.from(hourMap.entries()).sort((a, b) => a[0] - b[0]));
  }

  // Perbandingan antara hari dengan hari lainnya
  compareDaily(
    date1: string,
    date2: string,
  ): {
    date1: { date: string; count: number; revenue: number };
    date2: { date: string; count: number; revenue: number };
    revenueDiff: number;
    winner: string;
  } {
    const summary1 = this.dailySummary(date1);
    const summary2 = this.dailySummary(date2);

    const revenueDiff = summary2.revenue - summary1.revenue;

    const winner =
      summary1.revenue > summary2.revenue
        ? date1
        : summary2.revenue > summary1.revenue
          ? date2
          : "Draw";

    return {
      date1: { date: date1, ...summary1 },
      date2: { date: date2, ...summary2 },
      revenueDiff,
      winner,
    };
  }

  // Export data ke CSV
  exportToCSV(): string {
    const header = [
      "Kode Transaksi",
      "Tanggal",
      "Payment Method",
      "Status",
      "Nama Produk",
      "Qty",
      "Harga Satuan",
      "Subtotal",
      "Total Transaksi",
    ].join(", ");

    const rows = this.transactions
      .filter((t) => t.status === "SUCCESS")
      .flatMap((t) =>
        t.items.map((item, index) =>
          [
            t.code,
            t.transactionDate.toISOString().slice(0, 10),
            t.paymentMethod,
            t.status,
            item.productName,
            item.quantity,
            item.price,
            item.subtotal,
            index === 0 ? t.totalAmount : "",
          ].join(", "),
        ),
      );

    return [header, ...rows].join("\n");
  }
}
