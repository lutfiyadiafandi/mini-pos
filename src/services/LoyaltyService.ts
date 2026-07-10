import { Customer, MembershipTierName } from "../models/Customer.js";
import { CustomerRepository } from "../repositories/CustomerRepository.js";
import { DiscountFactory } from "../strategies/DiscountFactory.js";
import { ValidationError } from "../errors/AppError.js";

/**
 * Service layer untuk Membership & Loyalty.
 * Seluruh business rule (diskon, poin, upgrade, redeem, validasi) ada di sini.
 *
 * Repository bertanggung jawab: "bagaimana menyimpan/mengambil data customer?"
 * Service bertanggung jawab: "apakah operasi loyalty ini valid secara bisnis?"
 */
export class LoyaltyService {
  constructor(private customerRepo: CustomerRepository) {}

  // A.1
  getAllCustomers(): Customer[] {
    return this.customerRepo.findAll();
  }

  getCustomerById(id: number): Customer {
    return this.customerRepo.findById(id);
  }

  searchCustomer(keyword: string): Customer[] {
    if (!keyword || keyword.trim().length === 0) {
      return this.customerRepo.findAll();
    }
    return this.customerRepo.search(keyword.trim());
  }

  registerCustomer(data: {
    name: string;
    phone: string;
    email?: string | null;
  }): Customer {
    // Business validation: format dasar (repo juga cek duplikat phone)
    if (!data.name || data.name.trim().length < 3) {
      throw new ValidationError("Nama pelanggan minimal 3 karakter");
    }
    if (!data.phone || !/^\d{10,13}$/.test(data.phone)) {
      throw new ValidationError("Nomor HP harus berupa angka 10-13 digit");
    }
    if (data.email && !data.email.includes("@")) {
      throw new ValidationError("Format email tidak valid");
    }

    // Member baru selalu REGULAR, points 0, totalSpending 0 (aturan A.1)
    return this.customerRepo.create(data);
  }

  updateCustomerProfile(
    id: number,
    data: { name?: string; phone?: string; email?: string | null },
  ): Customer {
    if (data.name && data.name.trim().length < 3) {
      throw new ValidationError("Nama pelanggan minimal 3 karakter");
    }
    if (data.phone && !/^\d{10,13}$/.test(data.phone)) {
      throw new ValidationError("Nomor HP harus berupa angka 10-13 digit");
    }
    if (data.email && !data.email.includes("@")) {
      throw new ValidationError("Format email tidak valid");
    }

    // Tier/points/totalSpending TIDAK bisa diubah lewat method ini —
    // hanya lewat mekanisme transaksi & auto-upgrade (kasir tidak boleh set tier manual)
    // A.2
    return this.customerRepo.update(id, data);
  }

  /**
   * Hitung nominal diskon untuk customer tertentu berdasarkan tier-nya.
   * @param subtotal subtotal sebelum diskon
   */
  calculateDiscount(customerId: number, subtotal: number): number {
    const customer = this.customerRepo.findById(customerId);
    const strategy = DiscountFactory.create(customer.tier);
    return strategy.calculateDiscount(subtotal);
  }

  // A.3
  /**
   * Hitung poin yang akan didapat dari sebuah transaksi.
   * floor(totalBayarSetelahDiskon / 1000) x pengaliPoin tier
   */
  calculatePointsEarned(
    customerId: number,
    amountAfterDiscount: number,
  ): number {
    if (amountAfterDiscount <= 0) return 0;

    const customer = this.customerRepo.findById(customerId);
    const strategy = DiscountFactory.create(customer.tier);
    return Math.floor(amountAfterDiscount / 1000) * strategy.pointMultiplier();
  }

  // A.5
  /**
   * Validasi permintaan redeem poin.
   * @throws ValidationError jika poin tidak cukup atau membuat total bayar < 0
   */
  validateRedeem(
    customerId: number,
    pointsToRedeem: number,
    amountAfterTierDiscount: number,
  ): void {
    if (pointsToRedeem < 0) {
      throw new ValidationError("Poin yang di-redeem tidak boleh negatif");
    }

    const customer = this.customerRepo.findById(customerId);

    if (pointsToRedeem > customer.points) {
      throw new ValidationError(
        `Poin tidak cukup: diminta ${pointsToRedeem}, tersedia ${customer.points}`,
      );
    }

    // 1 poin = Rp 1 potongan. Total bayar tidak boleh < 0.
    if (pointsToRedeem > amountAfterTierDiscount) {
      throw new ValidationError(
        `Poin yang di-redeem (${pointsToRedeem}) melebihi total bayar setelah diskon (Rp ${amountAfterTierDiscount.toLocaleString("id-ID")})`,
      );
    }
  }

  /**
   * Terapkan redeem poin: kurangi saldo poin customer.
   * Panggil setelah validateRedeem() lolos dan transaksi berhasil (SUCCESS).
   */
  applyRedeem(customerId: number, pointsToRedeem: number): Customer {
    if (pointsToRedeem === 0) {
      return this.customerRepo.findById(customerId);
    }

    const customer = this.customerRepo.findById(customerId);
    customer.deductPoints(pointsToRedeem); // invariant check di model

    return this.customerRepo.update(customerId, { points: customer.points });
  }

  // A.6
  /**
   * Cek apakah customer layak naik tier berdasarkan totalSpending saat ini,
   * lalu upgrade jika melewati ambang. Tier tidak pernah turun.
   */
  checkAndUpgradeTier(customerId: number): Customer {
    const customer = this.customerRepo.findById(customerId);

    const eligibleTier = this.resolveTierBySpending(customer.totalSpending);
    const order: MembershipTierName[] = ["REGULAR", "GOLD", "VIP"];

    if (order.indexOf(eligibleTier) > order.indexOf(customer.tier)) {
      customer.upgradeTier(eligibleTier); // invariant check di model (tidak boleh turun)
      return this.customerRepo.update(customerId, { tier: customer.tier });
    }

    return customer;
  }

  /**
   * Tentukan tier yang sesuai berdasarkan total belanja.
   */
  private resolveTierBySpending(totalSpending: number): MembershipTierName {
    if (totalSpending >= 5_000_000) return "VIP";
    if (totalSpending >= 1_000_000) return "GOLD";
    return "REGULAR";
  }

  /**
   * Menambah poin, menambah total belanja, lalu cek auto-upgrade.
   * @param amountForSpending nominal yang dihitung sebagai kontribusi ke total belanja
   * @param pointsEarned poin yang didapat dari transaksi ini
   */
  completePurchase(
    customerId: number,
    amountForSpending: number,
    pointsEarned: number,
  ): Customer {
    const customer = this.customerRepo.findById(customerId);

    customer.addPoints(pointsEarned);
    customer.addSpending(amountForSpending);

    this.customerRepo.update(customerId, {
      points: customer.points,
      totalSpending: customer.totalSpending,
    });

    return this.checkAndUpgradeTier(customerId);
  }

  // A.7
  /**
   * Laporan pelanggan dengan belanja terbanyak.
   * Wajib pakai collection operations (sort/slice/map) — tanpa loop manual.
   */
  getTopCustomers(limit: number = 10): Customer[] {
    return this.customerRepo
      .findAll()
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .slice(0, limit);
  }
}
