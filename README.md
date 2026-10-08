# FinFlow - Sistem Pencatatan Keuangan Pribadi Modern 💰

Aplikasi pencatatan keuangan pribadi (*personal finance management*) berbasis web yang elegan, cepat, responsif, dan siap pakai secara offline tanpa perlu instalasi server atau dependensi tambahan.

---

## 🌟 Fitur Utama

1. **Dashboard Finansial Real-Time**:
   - **Total Saldo Bersih (*Net Worth*)**: Akumulasi total saldo dari seluruh rekening dan dompet.
   - **Pemasukan & Pengeluaran Bulanan**: Pantau arus kas masuk dan keluar bulan berjalan secara langsung.
   - **Sisa Tabungan (*Net Cashflow*)**: Rasio tabungan dan indikator kesehatan finansial.
   - **Fitur Privasi (Mode Intip)**: Sembunyikan atau tampilkan nominal saldo dengan 1 klik agar aman saat dilihat di tempat umum.

2. **Manajemen Multi-Dompet / Rekening**:
   - Dukungan berbagai jenis akun: **Uang Tunai (Cash)**, **Rekening Bank** (BCA, Mandiri, BRI, BNI, Jago, dll.), **E-Wallet** (GoPay, OVO, DANA, ShopeePay), dan akun investasi.
   - Saldo per dompet yang terhitung otomatis dan real-time berdasarkan riwayat transaksi.
   - Fitur **Transfer Antar Dompet** (misal: Tarik tunai dari ATM BCA ke Dompet Tunai, atau Top Up GoPay dari M-Banking).

3. **Pencatatan Transaksi Lengkap**:
   - 3 jenis transaksi: **Pengeluaran (-)**, **Pemasukan (+)**, dan **Transfer Saldo (↔)**.
   - Format nominal otomatis dengan titik pemisah ribuan Rupiah (`Rp`).
   - Kategorisasi lengkap dengan ikon dan warna identitas unik (Makanan, Transportasi, Belanja, Tagihan, Hiburan, Medis, dll.).
   - Catatan/deskripsi tambahan dan tanggal transaksi yang fleksibel.
   - Filter pencarian instan berdasarkan kata kunci, jenis transaksi, kategori, atau dompet tertentu.

4. **Batas Anggaran Bulanan (*Budgeting & Smart Alerts*)**:
   - Atur batas pengeluaran bulanan per kategori.
   - Bilah progres (*progress bar*) visual dengan indikator 3 level:
     - 🟢 **Aman**: Pengeluaran < 75% dari batas pagu.
     - 🟡 **Waspada**: Pengeluaran mencapai 75% - 99%.
     - 🔴 **Bahaya / Overbudget**: Pengeluaran telah melampaui batas anggaran (dengan animasi *pulse alert*).

5. **Visual Grafik & Analisis Komprehensif**:
   - **Diagram Donat (*Donut Chart*)**: Proporsi dan alokasi pengeluaran per kategori.
   - **Grafik Batang (*Cash Flow Trend*)**: Tren arus kas harian pemasukan vs pengeluaran.
   - Tabel rincian pengeluaran dengan persentase share pengeluaran.

6. **Target Tabungan (*Savings Goals*)**:
   - Rencanakan target dana impian (Dana Darurat, Liburan, Beli Gadget/Laptop, DP Rumah).
   - Progres tabungan visual dan tombol cepat tambah tabungan.

7. **Ekspor, Cadangan & Pemulihan Data (*Backup & Restore*)**:
   - **Ekspor Excel (CSV)**: File CSV dengan encoding UTF-8 BOM yang langsung rapi saat dibuka di Microsoft Excel atau Google Sheets.
   - **Cetak Laporan / Simpan ke PDF**: Tampilan ramah cetak (*print-friendly*).
   - **Cadangan JSON**: Simpan seluruh database aplikasi dalam 1 file `.json`.
   - **Pemulihan Data (Restore)**: Unggah file `.json` untuk mengembalikan seluruh catatan keuangan Anda.

8. **Tampilan Modern & Ramah Pengguna**:
   - Pilihan **Mode Gelap (Dark Mode)** dan **Mode Terang (Light Mode)**.
   - Desain responsif di layar Laptop, Tablet, maupun HP (dilengkapi *Bottom Navigation Bar*).
   - 100% data tersimpan di browser Anda secara lokal (*Local Storage*), privasi aman tanpa dikirim ke server pihak ketiga.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dapat langsung dijalankan tanpa perlu instalasi `Node.js` atau server khusus:

### Cara 1: Menggunakan Launcher (Paling Praktis)
Cukup klik ganda (*double click*) file:
`Buka_Aplikasi.bat`

### Cara 2: Buka Langsung File HTML
Buka file `index.html` dengan klik kanan > **Open with** > pilih browser favorit Anda (Google Chrome, Microsoft Edge, Mozilla Firefox, dll.).

---

## 📁 Struktur Berkas

```text
Catatan Keuangan/
├── index.html            # Antarmuka web utama
├── Buka_Aplikasi.bat     # File peluncur otomatis (Windows)
├── css/
│   └── style.css         # Desain sistem, tema gelap/terang, dan animasi
├── js/
│   ├── data.js           # Mesin data, LocalStorage, kalkulasi saldo & ekspor
│   ├── chart-renderer.js # Mesin pembuat grafik analitik (Chart.js & Canvas fallback)
│   └── app.js            # Logika navigasi, filter transaksi, dan modal form
└── README.md             # Panduan lengkap penggunaan
```
# catatan-keuangan
# catatan-keuangan
