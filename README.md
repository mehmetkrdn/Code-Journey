# Code Journey

Code Journey, programlama öğrenimini oyunlaştıran mobil eğitim uygulamasıdır.

Kullanıcılar kısa dersler, mini görevler ve oyun mekanikleri ile programlama öğrenirken XP kazanır, seviyelerini yükseltir ve dünya haritasında ilerler.

---

# Teknolojiler

## Mobile

- React Native
- Expo SDK 54
- TypeScript

## Backend

- NestJS
- Prisma ORM
- PostgreSQL

## Infrastructure

- Docker
- Docker Compose

---

# Proje Yapısı

```
code-journey
│
├── apps
│   ├── api
│   └── mobile
│
├── infrastructure
│
├── docs
│
└── README.md
```

---

# Kurulum

## 1. Repository

```bash
git clone https://github.com/mehmetkrdn/Code-Journey.git

cd Code-Journey
```

---

## 2. PostgreSQL

```bash
cd infrastructure

docker compose up -d
```

---

## 3. Backend

```bash
cd apps/api

npm install

npx prisma generate

npm run start:dev
```

Backend varsayılan olarak aşağıdaki adreste çalışır.

```
http://localhost:3001
```

---

## 4. Mobile

```bash
cd apps/mobile

npm install

npx expo start --clear
```

Telefon ve bilgisayar aynı Wi-Fi ağına bağlı olmalıdır.

Expo Go uygulaması ile QR kod okutularak proje çalıştırılır.

---

# Environment Variables

## Backend (.env)

```
NODE_ENV=development

PORT=3001

DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME"

JWT_ACCESS_SECRET="YOUR_ACCESS_SECRET"

JWT_REFRESH_SECRET="YOUR_REFRESH_SECRET"

JWT_ACCESS_EXPIRES_IN="15m"

JWT_REFRESH_EXPIRES_IN="7d"
```

---

## Mobile (.env)

```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001/api
```

Örnek

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
```

> Fiziksel cihaz kullanıldığı için **localhost yerine bilgisayarın IPv4 adresi kullanılmalıdır.**

---

# Tamamlanan Özellikler

- React Native mobil uygulaması oluşturuldu.
- Expo SDK 54 kurulumu tamamlandı.
- NestJS backend oluşturuldu.
- PostgreSQL Docker ortamı kuruldu.
- Prisma ORM yapılandırıldı.
- Backend ile PostgreSQL bağlantısı sağlandı.
- Health Check endpoint'i oluşturuldu.
- Mobil uygulama ile backend bağlantısı doğrulandı.

---

# Health Check

```
GET /api/health
```

URL

```
http://localhost:3001/api/health
```

Başarılı cevap

```json
{
  "success": true,
  "service": "code-journey-api",
  "status": "healthy",
  "database": "connected"
}
```

---

# Sonraki Adımlar

- Users Module
- Authentication (JWT)
- Register / Login
- User Progress
- XP Sistemi
- Dünya Haritası
- Ders Sistemi
- Challenge Sistemi

---

