# ☕ Cozy Corner Ordering System

Sistem pemesanan digital yang lengkap untuk Cozy Corner Coffee Shop. Aplikasi web modern yang memungkinkan pelanggan memesan secara mandiri, kasir memproses pesanan, dan admin mengelola menu, stok, serta melihat laporan pendapatan.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Proyek](#-struktur-proyek)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Penggunaan](#-penggunaan)
- [Konfigurasi](#-konfigurasi)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Struktur Database](#-struktur-database)

## ✨ Fitur Utama

### 👥 Untuk Pelanggan
- **Menu Digital Interaktif**: Tampilan menu yang menarik dengan gambar dan deskripsi
- **Pemesanan Mandiri (Self-Service)**: Pelanggan dapat memesan langsung melalui antarmuka
- **Pembayaran Fleksibel**: Mendukung pembayaran tunai (bayar di kasir) dan QRIS
- **QR Code Menu**: Akses cepat ke menu melalui scan QR code
- **Keranjang Belanja**: Fitur keranjang untuk mengelola pesanan sebelum checkout
- **Opsi Menu**: Beberapa item menu memiliki opsi kustomisasi (contoh: ukuran, topping)

### 💰 Untuk Kasir
- **Antarmuka Kasir**: Interface khusus untuk memproses pesanan
- **Manajemen Pesanan**: Lihat dan kelola pesanan yang masuk
- **Pembayaran**: Proses pembayaran tunai dan non-tunai
- **Update Status**: Update status pesanan secara real-time

### 👨‍💼 Untuk Admin
- **Dashboard Admin**: Panel kontrol lengkap untuk mengelola sistem
- **Manajemen Menu**: Tambah, edit, dan hapus item menu
- **Manajemen Stok**: Kelola stok harian untuk setiap item menu
- **Laporan Pendapatan**: Lihat laporan pendapatan harian dan verifikasi kas
- **Autentikasi**: Sistem login yang aman untuk akses admin

## 🛠 Teknologi yang Digunakan

### Frontend
- **React 18.2.0** - Library UI modern
- **Vite 5.0.8** - Build tool yang cepat
- **React Router DOM 6.20.0** - Routing untuk SPA
- **Tailwind CSS 3.3.6** - Framework CSS utility-first
- **Axios 1.6.2** - HTTP client untuk API calls
- **Lucide React 0.294.0** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **SQLite3 5.1.6** - Database relasional
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **Body Parser 1.20.2** - Middleware untuk parsing request body
- **Dotenv 16.3.1** - Environment variables management

### Development Tools
- **Nodemon 3.0.1** - Auto-restart server saat development
- **Concurrently 8.2.2** - Menjalankan multiple commands bersamaan

## 📁 Struktur Proyek

```
OrderingSystem_CozyCorner/
├── client/                 # Frontend React application
│   ├── public/            # Static assets (images)
│   ├── src/
│   │   ├── pages/        # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── CashierOrder.jsx
│   │   │   ├── CustomerMenu.jsx
│   │   │   └── QRCode.jsx
│   │   ├── services/     # API services
│   │   │   └── api.js
│   │   ├── utils/        # Utility functions
│   │   │   └── menuOptions.js
│   │   ├── App.jsx       # Main app component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                # Backend Express application
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── menu.js       # Menu management routes
│   │   ├── orders.js     # Order management routes
│   │   ├── revenue.js    # Revenue routes
│   │   └── stock.js      # Stock management routes
│   ├── database.js       # Database setup and utilities
│   ├── index.js          # Server entry point
│   └── cozycorner.db     # SQLite database (auto-generated)
├── package.json          # Root package.json
├── render.yaml           # Render deployment config
├── railway.json          # Railway deployment config
├── update-descriptions.js # Script untuk update deskripsi menu
└── README.md
```

## 💻 Persyaratan Sistem

- **Node.js** >= 16.x
- **npm** >= 8.x (atau **yarn**)
- **Git** (untuk clone repository)

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd OrderingSystem_CozyCorner
```

### 2. Install Dependencies

Install dependencies untuk root project dan client sekaligus:

```bash
npm run install-all
```

Atau install secara manual:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Setup Environment Variables

Buat file `.env` di root directory:

```env
NODE_ENV=development
PORT=5000
ADMIN_PASSWORD=your_secure_password_here
```

**Catatan**: Ganti `your_secure_password_here` dengan password admin yang aman.

### 4. Inisialisasi Database

Database SQLite akan dibuat otomatis saat pertama kali menjalankan server. Tabel-tabel dan data awal akan di-generate secara otomatis.

## 📖 Penggunaan

### Development Mode

Jalankan server dan client secara bersamaan:

```bash
npm run dev
```

Atau jalankan secara terpisah:

```bash
# Terminal 1: Jalankan server
npm run server

# Terminal 2: Jalankan client
npm run client
```

Aplikasi akan tersedia di:
- **Frontend**: http://localhost:5173 (Vite default port)
- **Backend API**: http://localhost:5000

### Production Mode

1. Build client application:

```bash
npm run build
```

2. Jalankan server:

```bash
npm start
```

Server akan berjalan di port yang ditentukan di environment variable `PORT` (default: 5000).

### Akses Aplikasi

- **Menu Pelanggan**: http://localhost:5173/ (atau root URL)
- **QR Code Menu**: http://localhost:5173/qr
- **Kasir**: http://localhost:5173/cashier
- **Admin Login**: http://localhost:5173/admin/login
- **Admin Dashboard**: http://localhost:5173/admin

## ⚙️ Konfigurasi

### Environment Variables

| Variable | Deskripsi | Default | Required |
|----------|-----------|---------|----------|
| `NODE_ENV` | Environment mode (development/production) | `development` | No |
| `PORT` | Port untuk server backend | `5000` | No |
| `ADMIN_PASSWORD` | Password untuk login admin | - | Yes |

### Update Deskripsi Menu

Untuk mengupdate deskripsi menu, edit file `update-descriptions.js` dan jalankan:

```bash
node update-descriptions.js
```

## 🌐 Deployment

### Deploy ke Render

1. Buat akun di [Render](https://render.com)
2. Buat new Web Service
3. Connect repository GitHub/GitLab
4. Render akan otomatis membaca `render.yaml` untuk konfigurasi
5. Set environment variables di dashboard Render:
   - `NODE_ENV=production`
   - `PORT=10000` (atau sesuai kebutuhan)
   - `ADMIN_PASSWORD=<password_anda>`

### Deploy ke Railway

1. Buat akun di [Railway](https://railway.app)
2. Create new project
3. Deploy from GitHub repository
4. Railway akan otomatis membaca `railway.json` untuk konfigurasi
5. Set environment variables di Railway dashboard

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

## 🔌 API Endpoints

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Create new menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Stock
- `GET /api/stock` - Get all stock data
- `GET /api/stock/:menuItemId` - Get stock for specific menu item
- `PUT /api/stock/:menuItemId` - Update stock (Admin only)

### Revenue
- `GET /api/revenue` - Get revenue data
- `GET /api/revenue/daily` - Get daily revenue
- `PUT /api/revenue/:date/verify` - Verify daily revenue (Admin only)

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/verify` - Verify admin session

## 🗄️ Struktur Database

### Tabel: `menu_items`
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `category` (TEXT)
- `price` (REAL)
- `image_url` (TEXT)
- `description` (TEXT)
- `created_at` (DATETIME)

### Tabel: `stock`
- `id` (INTEGER PRIMARY KEY)
- `menu_item_id` (INTEGER, FOREIGN KEY)
- `quantity` (INTEGER)
- `date` (DATE)
- `updated_at` (DATETIME)

### Tabel: `orders`
- `id` (INTEGER PRIMARY KEY)
- `order_number` (TEXT UNIQUE)
- `order_type` (TEXT) - 'cashier' atau 'self-service'
- `status` (TEXT) - 'pending', 'completed', 'cancelled'
- `total_amount` (REAL)
- `payment_method` (TEXT) - 'cash' atau 'qris'
- `created_at` (DATETIME)
- `completed_at` (DATETIME)

### Tabel: `order_items`
- `id` (INTEGER PRIMARY KEY)
- `order_id` (INTEGER, FOREIGN KEY)
- `menu_item_id` (INTEGER, FOREIGN KEY)
- `quantity` (INTEGER)
- `price` (REAL)

### Tabel: `daily_revenue`
- `id` (INTEGER PRIMARY KEY)
- `date` (DATE UNIQUE)
- `total_revenue` (REAL)
- `total_orders` (INTEGER)
- `cash_received` (REAL)
- `verified` (BOOLEAN)
- `verified_at` (DATETIME)
- `created_at` (DATETIME)

## 📝 Catatan Penting

1. **Database**: Database SQLite (`cozycorner.db`) akan dibuat otomatis di folder `server/` saat pertama kali menjalankan aplikasi.

2. **Password Admin**: Pastikan untuk mengatur `ADMIN_PASSWORD` yang kuat di environment variables sebelum deployment.

3. **Static Files**: File gambar menu disimpan di `client/public/` dan diakses melalui `/public/` endpoint.

4. **Build Output**: Setelah build, file static akan berada di `client/dist/` yang akan di-serve oleh Express server.

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat issue atau pull request untuk perbaikan dan fitur baru.

## 📄 Lisensi

ISC License

---

**Dibuat dengan ❤️ untuk Cozy Corner Coffee Shop**
