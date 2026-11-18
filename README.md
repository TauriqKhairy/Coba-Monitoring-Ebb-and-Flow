# Rancang Bangun Aplikasi Monitoring dan Pengendalian Irigasi Adaptif pada Hidroponik Ebb and Flow Bertingkat

Aplikasi web modern berbasis **Next.js 16 + React 19**, **Tailwind CSS v4**, **Shadcn UI**, dan **Firebase** (Modular SDK v10) untuk sistem monitoring dan otomasi pasang-surut (Ebb and Flow) adaptif 3 tingkat pada tanaman hidroponik dengan mikrokontroler **ESP32**.

---

## 🛠️ Tech Stack & Arsitektur
- **Framework & UI**: Next.js 16 (App Router), React 19, Shadcn UI, Radix UI Primitives, Lucide Icons
- **Styling**: Tailwind CSS v4, Dark/Light Mode Theme Provider (`next-themes`)
- **Grafik & Visualisasi**: Recharts
- **Backend & Database**: Firebase Authentication (Email/Password) & Firebase Realtime Database
- **Hardware Integrasi**: ESP32 Controller via Firebase RTDB

---

## 🚀 Panduan Menjalankan di Komputer Lokal

### 1. Masalah Kebijakan PowerShell (`npm.ps1 cannot be loaded`)
Jika saat menjalankan `npm` muncul error:
```text
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system...
```
Jalankan perintah ini sekali di PowerShell:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
```
*(Atau Anda bisa menggunakan `npm.cmd run dev`)*.

---

### 2. Konfigurasi Variabel Lingkungan (`.env.local`)
Buka file `.env.local` (atau `.env`) lalu sesuaikan dengan konfigurasi Firebase Anda dari [Firebase Console](https://console.firebase.google.com/):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=proyek-anda.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://proyek-anda-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=proyek-anda
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=proyek-anda.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef...
NEXT_PUBLIC_DEFAULT_DEVICE_ID=esp32_hidroponik_01
```

---

### 3. Menjalankan Server Development
Di direktori proyek `E:\ta2`, jalankan:
```powershell
npm run dev
```
Buka browser pada: **[http://localhost:3000](http://localhost:3000)**

---

### 4. Menjalankan Simulator ESP32 (Mock / Testing Tanpa Alat Asli)
Untuk menguji antarmuka, grafik pasang-surut, dan kendali pompa tanpa harus menyambungkan hardware ESP32 fisik:
Buka tab terminal baru lalu jalankan:
```powershell
npm run mock
```
Simulator akan secara otomatis:
- Mengirim status online heartbeat ESP32
- Mengirim data sensor tandon (pH, TDS, suhu air, volume)
- Mengirim data 3 tingkat rak (kelembaban media, suhu tray, level pasang-surut)
- Menerima saklar pompa dari halaman `/kontrol` dan mensimulasikan kenaikan/penurunan air secara fisik!

---

## 📱 Daftar Halaman Antarmuka
1. **`/dashboard`**: Monitoring realtime status ESP32, kualitas air tandon nutrisi, dan kondisi ketiga rak tingkat tray.
2. **`/kontrol`**: Pengendali mode sistem (Otomatis Adaptif vs Manual) dan saklar daya pompa per tingkat (Tier 1, Tier 2, Tier 3).
3. **`/pengaturan`**: Form rentang batas kelembaban adaptif, durasi pasang (*flood duration*), dan interval surut (*drain interval*) dengan validasi input.
4. **`/riwayat`**: Grafik deret waktu interaktif sensor (Recharts) dengan filter rentang waktu (1 jam, 24 jam, 7 hari), tabel log, dan ekspor CSV langsung.
5. **`/notifikasi`**: Riwayat peringatan sistem (pH abnormal, TDS, air tandon rendah) dengan tombol aksi "Tandai Selesai".
6. **`/login`**: Halaman masuk dan pendaftaran akun operator berbasis Firebase Auth.

---

## 🔒 Firebase Realtime Database Security Rules
Salin aturan keamanan berikut ke Firebase Console -> Realtime Database -> Rules:
```json
{
  "rules": {
    "devices": {
      "$deviceId": {
        ".read": "auth != null",
        "control": {
          ".write": "auth != null"
        },
        "settings": {
          ".write": "auth != null"
        },
        "status": {
          ".write": "auth != null"
        },
        "sensors": {
          ".write": "auth != null"
        },
        "actuators": {
          ".write": "auth != null"
        }
      }
    },
    "history": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "alerts": {
      "$deviceId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```
