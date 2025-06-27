
# Cara Membuat Bot WhatsApp Sendiri Menggukan Node.js

Projek Ini Adalah Permulaan Membuat Bot Whatsapp dengan Menggunakan **Node.js** dan Library **[Baileys](https://github.com/WhiskeySockets/Baileys)**.
Code tutorial lengkap boleh ke Website Library: 
- **[Baileys Wiki](https://baileys.wiki)**
- **[Baileys Npm](https://www.npmjs.com/package/@whiskeysockets/baileys)**

---

## 🚀 Fitur Bot
- Connection ke WhatsApp Menggunakan QrCode & PairingCode
- Balas pesan otomatis ( Non )
- Kirim gambar, stiker, video ( Non )
- Deteksi pesan grup & pribadi ( Non )
- AntiCall ( Non )

---

## 🛠️ Persiapan

### 1. Install Node.js

Pastikan anda sudah memasang Node.js
 Git di PC:
- [Download Node.js](https://nodejs.org/)
- disarankan menggunakan node.js versi terbaharu
  
 Termux Di Android:
```Bash
pkg install nodejs git -y
```


- jika sudah install periksa versi:
```bash
node -v
npm -v
```

---

### 2. Clone Projek Ini
```bash
git clone https://github.com/razifeditcode/wabot
cd wabot
```

---

### 📦 Install Dependencies

Jalankan perintah ini untuk pasang semua package yang diperlukan:
```bash
npm install
```


---

### ⚙️ Cara Menjalankan Bot

Setelah install semua, jalankan bot:
```bash
node index.js
```

Akan keluar pairingCode di terminal. Salin nombor mu tanpa "-" & "+" contoh:
*60175429669*


---

### 💾 Simpan Session

Setiap kali login, akan disimpan ke **session** agar tidak perlu pairingCode semula. Jangan kongsi file ini secara publik.


---

### 🛡️ Penafian
Projek ini hanya tahap permulaan, jika lihat cara proses membuat bot whatsapp sila lihat channel youtube
**[Razif || Code](https://youtube.com/@razifeditcode)**

---

### 📧 Sokongan

Jika anda ada masalah, boleh buka Issue atau hubungi saya melalui whatsapp grup
**[Group WhatsApp]()**

