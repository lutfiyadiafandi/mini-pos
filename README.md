# MINI-POS

**Proyek:** Mini POS System - Capstone Extension (Topik A) Membership & Loyalty

**DEV:** Lutfiyadi Afandi - A18.2024.00157

## Setup Instalasi

Langkah-langkah untuk menginstal:

1. Clone repo https://github.com/lutfiyadiafandi/A18.2024.00157_LutfiyadiAfandi_ProyekAkhir_A-Membership
2. Jalankan perintah

```bash
# Install dependencies / packages
npm install

# Build
npm run build

# Generate ulang schema + seed (opsional)
npx run seed
```

3. Copy folder public ke dalam folder dist
4. Jalankan perintah di terminal yang berbeda secara paralel

```bash
# Running server
npm run dev:server

# Running electron
npm run start
```

## Kelengkapan Fitur

1. Login Screen
2. Dashboard
3. Product Management (CRUD)
4. Category Management (CRUD)
5. Transaction (Cart -> Payment -> Receipt)
6. Sales Report (Filter + Table + Export CSV)
7. User Management (CRUD)

## Fitur Tambahan

8. **Membership & Loyalty (Strategy Pattern)**

## Credentials

| Username | Password |
| -------- | -------- |
| admin    | admin123 |
| kasir01  | kasir123 |
| kasir02  | kasir123 |

## Membership & Loyalty

| Tier    | Syarat Total Belanja | Diskon | Pengali Poin |
| ------- | -------------------- | ------ | ------------ |
| REGULAR | Rp 0                 | 0%     | 1x           |
| GOLD    | ≥ Rp 1.000.000       | 5%     | 1.5x         |
| VIP     | ≥ Rp 5.000.000       | 10%    | 2x           |

## Dokumentasi Teknis

- [Dokumen Keputusan Desain](./DESIGN_DECISIONS.md)
- [Class Diagram & ERD](./DIAGRAMS.md)
