# 🚀 Code Journey

Code Journey, yazılım öğrenmeyi oyunlaştırarak daha eğlenceli hale getirmeyi amaçlayan bir mobil uygulamanın backend projesidir.

Kullanıcılar dersleri tamamlayarak XP kazanabilir, seviye atlayabilir, günlük serilerini (streak) koruyabilir, can ve coin sistemiyle ilerleyebilir. Proje modern backend teknolojileri kullanılarak geliştirilmektedir.

---

# 🛠️ Kullanılan Teknolojiler

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Swagger
- Docker (planlanıyor)

---

# 📂 Tamamlanan Modüller

## 🔐 Authentication

- Kullanıcı kayıt olma
- Kullanıcı giriş yapma
- JWT Access Token
- Refresh Token
- Token yenileme (Refresh Rotation)
- Güvenli çıkış (Logout)
- JWT korumalı endpointler

---

## 👤 User System

### Profil

- Profil bilgilerini görüntüleme
- Kullanıcı adı güncelleme
- Görünen ad (Display Name) güncelleme

### XP Sistemi

- XP kazanma
- Otomatik seviye hesaplama
- Level Progress hesaplama

### ❤️ Hearts Sistemi

- Can kullanma
- Can yenileme
- Maksimum 5 can sınırı

### 🪙 Coin Sistemi

- Coin kazanma
- Coin harcama
- Negatif coin oluşmasını engelleme

### 🔥 Streak Sistemi

- Günlük giriş takibi
- Günlük seriyi artırma
- Aynı gün tekrar saymama
- En uzun seriyi kaydetme

---

# 📖 API Dokümantasyonu

Swagger arayüzü:

```
http://localhost:3000/api
```

---

# ⚙️ Kurulum

Projeyi klonlayın:

```bash
git clone https://github.com/mehmetkrdn/Code-Journey.git
```

Klasöre girin:

```bash
cd code-journey
```

Bağımlılıkları yükleyin:

```bash
npm install
```

---

# 🔑 Ortam Değişkenleri

`.env.example` dosyasını kopyalayarak `.env` oluşturun.

```bash
cp .env.example .env
```

Windows kullanıyorsanız dosyayı manuel olarak da kopyalayabilirsiniz.

---

# ▶️ Projeyi Çalıştırma

Geliştirme ortamı:

```bash
npm run start:dev
```

---

# 🗄️ Veritabanı

Prisma Client oluşturma:

```bash
npx prisma generate
```

Migration çalıştırma:

```bash
npx prisma migrate dev
```

Prisma Studio:

```bash
npx prisma studio
```

---

# 📁 Proje Yapısı

```
src
├── auth
├── users
├── profile
├── progression
├── hearts
├── coins
├── streak
├── prisma
└── common
```

---

# 🚧 Geliştirme Aşamasındaki Modüller

- 📚 Lesson System
- 📝 Quiz System
- 🏆 Achievement System
- 📊 Leaderboard
- 🎯 Daily Missions
- 🛒 Shop System
- 🎁 Rewards System

---




# 📌 Lisans

Bu proje eğitim ve kişisel gelişim amacıyla geliştirilmektedir.
