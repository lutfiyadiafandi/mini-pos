# Dokumen Keputusan Desain — Modul Membership & Loyalty

**Proyek:** Mini POS System - Capstone Extension (Topik A) Membership & Loyalty

**DEV:** Lutfiyadi Afandi - A18.2024.00157

---

## 1. Ringkasan

Modul ini menambahkan sistem membership (REGULAR, GOLD, VIP) dengan diskon per-tier,
akumulasi poin, redeem poin, dan auto-upgrade tier ke atas Mini POS yang sudah ada.
Seluruh fitur menembus penuh arsitektur berlapis existing: Model → Repository →
Service → API → Controller → View, tanpa mengubah perilaku fitur lama (checkout
non-member tetap berjalan identik seperti sebelumnya).

## 2. Kenapa Strategy Pattern untuk perhitungan diskon?

Aturan diskon berbeda per tier (REGULAR 0%, GOLD 5%, VIP 10%) beserta pengali poin
yang berbeda pula. Alternatif paling sederhana adalah `if/else` atau `switch` di
dalam `TransactionService.checkout()`. Itu ditolak karena dua alasan:

- **Melanggar Open-Closed Principle.** Setiap kali ada tier baru, kode `checkout()`
  yang sudah teruji harus disentuh lagi — beresiko merusak alur checkout yang sudah
  jalan.
- **Tidak konsisten dengan pola yang sudah ada.** Project ini sudah punya
  `PaymentStrategy`/`PaymentFactory` untuk metode pembayaran. Memakai pendekatan
  berbeda (if-else) untuk masalah yang bentuknya identis (satu interface, banyak
  implementasi konkret dipilih saat runtime) akan membuat codebase tidak konsisten.

Solusi: `DiscountStrategy` (interface) + `RegularDiscount`/`GoldDiscount`/`VIPDiscount`
(implementasi) + `DiscountFactory` (pemilihan strategy berdasarkan tier). Menambah
tier baru = menambah satu class baru + satu baris di factory, tanpa menyentuh
`TransactionService` sama sekali.

**Alternatif yang dipertimbangkan dan ditolak:**

- _Lookup table/object_ (`{REGULAR: 0, GOLD: 0.05, VIP: 0.1}`) — cukup untuk
  angka statis, tapi tidak cocok begitu ada logika berbeda per tier (misal kalau
  suatu saat VIP butuh aturan pembulatan berbeda). Strategy Pattern lebih siap
  untuk perubahan itu tanpa refactor besar.
- _Inheritance murni di `Customer`_ (method `calculateDiscount()` di-override
  per subclass Customer) — ditolak karena akan mencampur tanggung jawab data
  (Customer sebagai entity) dengan tanggung jawab kalkulasi (yang sifatnya bisa
  berubah independen dari data member).

## 3. Kenapa business rule ada di Service, bukan Repository/Model/View?

Mengikuti pola `UserService`/`TransactionService` yang sudah ada di project:

- **Repository** hanya tahu cara baca/tulis SQLite (prepared statements, mapping
  row ke object). Tidak ada satupun keputusan "boleh/tidak boleh" di sana.
- **Model** (`Customer`) hanya menjaga _invariant_ levelnya sendiri — misalnya
  poin tidak boleh negatif, tier tidak boleh turun. Ini validasi struktural, bukan
  keputusan bisnis seperti "kapan seorang customer boleh naik tier".
- **View** murni DOM manipulation — render tabel, tangkap event form, tidak
  pernah menghitung apapun.
- **Service** (`LoyaltyService`) adalah satu-satunya tempat keputusan bisnis:
  kapan upgrade terjadi, berapa poin didapat, apakah redeem valid, dsb.

Konsekuensinya: kalau aturan bisnis berubah (misalnya ambang GOLD naik jadi
Rp 2.000.000), yang diubah cukup satu tempat di `LoyaltyService`, tidak menyebar
ke banyak file.

## 4. Keputusan skema database

- **`customer_id` nullable** di tabel `transactions` — supaya transaksi
  pelanggan non-member (yang masih menjadi kasus mayoritas) tetap valid tanpa
  perlu row dummy atau default value palsu.
- **`is_active`** ditambahkan ke `customers` untuk soft delete, mengikuti pola
  yang sudah dipakai di `users` dan `products` — konsisten dengan cara project
  ini menangani penghapusan data yang punya riwayat terkait (transaksi member
  tidak boleh hilang hanya karena membernya "dihapus").
- **`discount_amount`** dan **`points_earned`** disimpan langsung di
  `transactions` (bukan dihitung ulang tiap kali ditampilkan) supaya riwayat
  transaksi tetap akurat meskipun aturan diskon tier berubah di kemudian hari.

## 5. Urutan kalkulasi saat checkout

```
subtotal (kotor)
  → dipotong diskon tier (DiscountStrategy)
  → dipotong redeem poin (1 poin = Rp 1)
  → total yang benar-benar dibayar (disimpan sebagai total_amount)
```

Poin baru dihitung dari nominal **setelah diskon tier, sebelum redeem** — supaya
redeem poin di transaksi yang sama tidak mengurangi perolehan poin baru pada
transaksi itu sendiri.

**`total_spending`** (dipakai untuk ambang auto-upgrade tier) diakumulasi dari
**subtotal kotor**, bukan nominal setelah diskon. Alasannya: kalau dihitung dari
nominal net, member yang tier-nya sudah tinggi (dapat diskon lebih besar) justru
butuh belanja lebih banyak secara nominal untuk naik ke tier berikutnya
dibanding member baru — kurang adil dan tidak mencerminkan volume belanja riil.

## 6. Integrasi ke `TransactionService.checkout()`

`LoyaltyService` di-inject lewat constructor (Dependency Injection, konsisten
dengan pola service lain). Parameter membership (`customerId`, `redeemPoints`)
bersifat **opsional** di seluruh rantai pemanggilan — dari endpoint API sampai
`TransactionController`. Ini memastikan flow checkout lama (tanpa member) tidak
mengalami perubahan perilaku sama sekali; kode lama yang tidak mengirim
`customerId` akan berjalan identik seperti sebelum modul ini ada.

## 7. Ringkasan pemetaan OOP

| Konsep                | Penerapan                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Encapsulation         | `Customer` — semua field private, akses lewat getter/setter dengan validasi                                                   |
| Inheritance           | `Customer extends BaseModel`; `MembershipTier` (abstract) → `RegularTier`/`GoldTier`/`VIPTier`                                |
| Polymorphism          | `DiscountStrategy` — `TransactionService`/`LoyaltyService` memanggil `calculateDiscount()` tanpa tahu implementasi konkretnya |
| Strategy Pattern      | `DiscountStrategy` + `DiscountFactory`, paralel dengan `PaymentStrategy`/`PaymentFactory` yang sudah ada                      |
| Repository Pattern    | `CustomerRepository` — CRUD murni, prepared statements                                                                        |
| Dependency Injection  | `LoyaltyService(customerRepo)`, `TransactionService(..., loyaltyService)`                                                     |
| Custom Error Handling | `ValidationError`, `NotFoundError`, `DatabaseError` dipakai konsisten dengan modul lain                                       |
