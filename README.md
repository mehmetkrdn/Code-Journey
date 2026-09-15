# Code Journey

Code Journey, programlama öğrenimini oyunlaştırılmış bir mobil deneyime dönüştürmeyi amaçlayan eğitim uygulamasıdır.

Kullanıcılar kursları ve dersleri takip edebilir, etkileşimli kodlama challenge'larını çözebilir, XP ve coin kazanabilir, seviye atlayabilir ve günlük çalışma serilerini koruyabilir.

En güncel geliştirmeler `feature/challenge-system` branchinde yer almaktadır.

## Kullanılan Teknolojiler

### Mobil

- React Native
- Expo SDK 54
- Expo Router
- TypeScript

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Swagger / OpenAPI
- JWT
- bcrypt
- Docker

## Proje Yapısı

```text
code-journey/
├── apps/
│   ├── api/            # NestJS backend
│   └── mobile/         # React Native mobil uygulama
├── infrastructure/     # Docker Compose ve altyapı dosyaları
├── README.md
└── .gitignore
```

## Tamamlanan Sistemler

### Authentication

- Kullanıcı kaydı
- E-posta veya kullanıcı adıyla giriş
- bcrypt ile parola hashleme
- JWT access token
- JWT refresh token
- Refresh token rotation
- Logout
- Korumalı endpoint yapısı
- Swagger Bearer Authentication

### User System

- Profil görüntüleme
- Profil güncelleme
- XP ve level sistemi
- Hearts sistemi
- Coin sistemi
- Günlük streak sistemi
- En uzun streak takibi

### Course ve Lesson System

- Course, Section ve Lesson veri modelleri
- Yayınlanmış kursları listeleme
- Kurs detaylarını getirme
- Ders içeriğini görüntüleme
- Kullanıcıya özel ders ilerlemesi
- Ders tamamlama sistemi
- İlk tamamlamada XP ve coin ödülü
- Aynı dersten tekrar ödül kazanmayı engelleme
- Kurs ilerleme yüzdesi
- Sonraki ders bilgisi
- Ders kilitleme sistemi
- Prisma seed sistemi

### Challenge System

- Derslere bağlı challenge yapısı
- Kullanıcı challenge denemelerinin kaydedilmesi
- Backend tarafında cevap doğrulama
- Doğru cevabın istemciden gizlenmesi
- İlk doğru cevapta XP ve coin ödülü
- Aynı challenge üzerinden tekrar ödül kazanmayı engelleme
- Challenge bazlı kullanıcı ilerlemesi
- Ders bazlı challenge ilerleme yüzdesi
- İlk tamamlanma zamanının takibi
- Deneme ve doğru cevap sayısının takibi

Desteklenen challenge türleri:

- `MULTIPLE_CHOICE`
- `FILL_IN_THE_BLANK`
- `ORDER_CODE`
- `FIND_BUG`
- `OUTPUT_PREDICTION`

## Eğitim Yapısı

```text
Course
└── Section
    └── Lesson
        ├── UserLessonProgress
        └── Challenge
            ├── ChallengeOption
            └── UserChallengeAttempt
```

Örnek:

```text
Java
└── Java Temelleri
    ├── Java Değişkenleri
    │   ├── Çoktan Seçmeli
    │   ├── Boşluk Doldurma
    │   ├── Kod Sıralama
    │   ├── Hata Bulma
    │   └── Çıktı Tahmini
    ├── Java Veri Tipleri
    └── Java Operatörleri
```

### Course

Bir eğitim yolunu temsil eder.

Örnek:

```text
Java
Python
JavaScript
```

### Section

Kurs içindeki konu gruplarını temsil eder.

Örnek:

```text
Java Temelleri
Kontrol Yapıları
Nesne Yönelimli Programlama
```

### Lesson

Dersin başlığını, içeriğini, sırasını ve ödüllerini tutar.

Ders ödülleri:

- XP
- Coin

### UserLessonProgress

Kullanıcının bir dersi tamamlayıp tamamlamadığını tutar.

Aşağıdaki birleşik benzersiz kural kullanılır:

```prisma
@@unique([userId, lessonId])
```

Bu kural sayesinde aynı kullanıcı için aynı derse ait ikinci bir ilerleme kaydı oluşturulamaz.

### Challenge

Bir derse ait etkileşimli soruyu temsil eder.

Challenge içerisinde:

- Soru tipi
- Soru
- Kod parçası
- Sıra
- XP ödülü
- Coin ödülü
- Doğru cevap
- Açıklama

bilgileri tutulabilir.

Doğru cevap `correctAnswer` alanında tutulur ve normal challenge listeleme endpointlerinde istemciye gönderilmez.

### ChallengeOption

Seçenek veya sıralanabilir kod parçalarını tutar.

Örneğin `MULTIPLE_CHOICE` challenge'larında cevap seçenekleri, `ORDER_CODE` challenge'larında ise sıralanacak kod satırları için kullanılır.

### UserChallengeAttempt

Kullanıcının challenge için yaptığı her denemeyi kaydeder.

Kaydedilen temel bilgiler:

- Gönderilen cevap
- Cevabın doğru veya yanlış olması
- Kazanılan XP
- Kazanılan coin
- Deneme zamanı

Bir kullanıcı aynı challenge'ı birden fazla kez deneyebilir ancak ödül yalnızca ilk doğru cevapta verilir.

## Ders Tamamlama Akışı

```text
Dersin yayın durumu kontrol edilir
        ↓
Dersin kilitli olup olmadığı kontrol edilir
        ↓
İlerleme kaydı oluşturulur
        ↓
XP ve coin eklenir
        ↓
Kullanıcının seviyesi yeniden hesaplanır
        ↓
Sonraki ders açılır
```

Ders ilerlemesi ve ödül işlemleri Prisma transaction içinde gerçekleştirilir. Böylece işlemlerden biri başarısız olursa diğer veritabanı değişiklikleri de geri alınır.

## Ders Kilitleme Sistemi

İlk ders her zaman açıktır.

Sonraki dersin açılması için önceki dersin tamamlanmış olması gerekir.

```text
1. Ders → Açık
2. Ders → 1. ders tamamlandıysa açık
3. Ders → 2. ders tamamlandıysa açık
```

Kilitli bir ders tamamlanmaya çalışılırsa API:

```text
403 Forbidden
```

cevabı döndürür.

## Challenge Akışı

Challenge'lar derslere bağlı olarak çalışır.

```text
Ders
 ↓
Challenge
 ↓
Kullanıcı cevabı
 ↓
Backend cevap kontrolü
 ↓
UserChallengeAttempt
 ↓
Doğru cevap
 ↓
İlk doğru cevap mı?
 ├── Evet → XP + Coin
 └── Hayır → Ödül verilmez
```

Doğru cevap kontrolü backend tarafında gerçekleştirilir.

Normal challenge listeleme işlemlerinde:

```text
correctAnswer
explanation
```

alanları istemciye gönderilmez.

`explanation`, kullanıcı cevabını gönderdikten sonra gösterilir.

## Challenge Türleri

### MULTIPLE_CHOICE

Kullanıcı verilen seçeneklerden doğru cevabı seçer.

### FILL_IN_THE_BLANK

Kullanıcı kod veya metin içerisindeki eksik bölümü tamamlar.

### ORDER_CODE

Kullanıcı karışık halde verilen kod satırlarını doğru sıraya getirir.

### FIND_BUG

Kullanıcı hatalı kodu inceleyerek doğru halini gönderir.

### OUTPUT_PREDICTION

Kullanıcı verilen kodu çalıştırmadan programın çıktısını tahmin eder.

## Challenge Progress

Challenge ilerlemesi kullanıcı bazlı takip edilir.

Tek bir challenge için:

- Tamamlanma durumu
- Toplam deneme sayısı
- Doğru deneme sayısı
- İlk tamamlanma zamanı
- Kazanılan XP
- Kazanılan coin

bilgileri hesaplanabilir.

Ders bazında ise:

```text
Toplam Challenge
Tamamlanan Challenge
Kalan Challenge
İlerleme Yüzdesi
Tamamlanma Durumu
```

hesaplanır.

Örneğin:

```text
5 Challenge
3 Tamamlandı
2 Kaldı
%60 İlerleme
```

## Prisma Seed

Başlangıç kurs, ders ve challenge verileri `prisma/seed.ts` dosyası üzerinden eklenir.

Seed işlemi:

```bash
npx prisma db seed
```

Seed dosyasında `upsert` kullanılır. Böylece seed komutu tekrar çalıştırıldığında aynı kayıtlar ikinci kez oluşturulmaz.

Örnek içerik:

```text
Java
└── Java Temelleri
    ├── Java Değişkenleri
    │   ├── MULTIPLE_CHOICE
    │   ├── FILL_IN_THE_BLANK
    │   ├── ORDER_CODE
    │   ├── FIND_BUG
    │   └── OUTPUT_PREDICTION
    ├── Java Veri Tipleri
    └── Java Operatörleri
```

## API Endpointleri

### Health

```http
GET /api/health
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Profile

```http
GET   /api/profile
PATCH /api/profile
```

### Progression

```http
GET  /api/progression/me
POST /api/progression/test-xp
```

### Hearts

```http
GET  /api/hearts/me
POST /api/hearts/use
POST /api/hearts/test-restore
```

### Coins

```http
GET  /api/coins/me
POST /api/coins/spend
POST /api/coins/test-add
```

### Streak

```http
GET  /api/streak/me
POST /api/streak/check-in
```

### Courses

```http
GET /api/courses
GET /api/courses/:slug
GET /api/courses/:slug/progress
```

### Lessons

```http
GET  /api/lessons/:id
GET  /api/lessons/:id/progress
POST /api/lessons/:id/complete
```

### Challenges

```http
GET  /api/lessons/:lessonId/challenges
POST /api/challenges/:id/submit
GET  /api/challenges/:id/progress
GET  /api/lessons/:lessonId/challenges/progress
```

Challenge cevaplama ve kullanıcı ilerleme endpointleri JWT Access Token ile korunmaktadır.

## Ortam Değişkenleri

Backend için `apps/api/.env` dosyası oluşturulmalıdır.

Örnek:

```env
NODE_ENV="development"
PORT=3001

DATABASE_URL="postgresql://KULLANICI_ADI:PAROLA@localhost:5432/code_journey?schema=public"

JWT_ACCESS_SECRET="GUCLU_ACCESS_TOKEN_SECRET"
JWT_ACCESS_EXPIRES_IN="15m"

JWT_REFRESH_SECRET="GUCLU_REFRESH_TOKEN_SECRET"
JWT_REFRESH_EXPIRES_IN="7d"
```

Mobil uygulama için `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://BILGISAYAR_IP_ADRESI:3001/api
```

## Backend Kurulumu

Backend klasöründe:

```bash
cd apps/api
```

Paketleri yükle:

```bash
npm install
```

PostgreSQL container'ını çalıştır:

```bash
cd ../../infrastructure
docker compose up -d
```

Backend klasörüne dön:

```bash
cd ../apps/api
```

Prisma Client oluştur:

```bash
npx prisma generate
```

Migration'ları uygula:

```bash
npx prisma migrate dev
```

Örnek verileri ekle:

```bash
npx prisma db seed
```

Backend'i başlat:

```bash
npm run start:dev
```

## API Adresleri

Backend:

```text
http://localhost:3001/api
```

Swagger:

```text
http://localhost:3001/api/docs
```

## Teknik Tercihler

### NestJS

Module, controller, service, dependency injection ve guard yapılarını hazır sunduğu için tercih edildi.

### Prisma

PostgreSQL işlemlerini type-safe şekilde yapmak ve veritabanı değişikliklerini migration dosyalarıyla takip etmek için kullanıldı.

### PostgreSQL

Kullanıcılar, kurslar, bölümler, dersler, challenge'lar ve ilerleme kayıtları arasında ilişkisel yapı bulunduğu için tercih edildi.

### bcrypt

Parolaların ve refresh tokenların düz metin olarak saklanmasını engellemek için kullanıldı.

### JWT

Mobil uygulamadaki kullanıcı oturumlarını ve korumalı endpoint erişimini yönetmek için kullanıldı.

### Swagger

Backend endpointlerini mobil arayüz tamamlanmadan önce tarayıcı üzerinden test etmek için kullanıldı.

### Prisma Transaction

Ders tamamlama ve challenge ödüllendirme gibi birden fazla veritabanı işleminin birlikte güvenli şekilde gerçekleştirilmesi için kullanıldı.
