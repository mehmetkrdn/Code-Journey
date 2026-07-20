
````md
# Code Journey

Code Journey, kullanıcıların programlama öğrenmesini oyunlaştırılmış bir yapı ile destekleyen mobil eğitim uygulamasıdır.

Kullanıcılar dersleri tamamlayabilir, XP kazanabilir, seviye atlayabilir, günlük serilerini koruyabilir ve ilerlemelerini takip edebilir.

## Kullanılan Teknolojiler

### Mobil

- React Native
- Expo
- Expo Router
- TypeScript

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- Swagger

## Proje Yapısı

```text
code-journey/
├── apps/
│   ├── api/       # NestJS backend
│   └── mobile/    # React Native mobil uygulama
├── README.md
└── package.json
````

## Tamamlanan Backend Özellikleri

* PostgreSQL bağlantısı
* Prisma yapılandırması
* Health check endpoint'i
* Kullanıcı modülü
* Kullanıcı kayıt sistemi
* E-posta veya kullanıcı adıyla giriş
* Bcrypt ile parola hashleme
* JWT access token
* JWT refresh token
* Refresh token rotation
* Korumalı endpoint yapısı
* Logout işlemi
* DTO doğrulama
* Swagger dokümantasyonu

## Authentication Yapısı

Authentication sistemi access token ve refresh token kullanır.

### Kayıt

Kullanıcı şifresi doğrudan veritabanına kaydedilmez.

Şifre bcrypt ile hashlenir:

```ts
const passwordHash = await bcrypt.hash(password, 12);
```

Veritabanında yalnızca `passwordHash` saklanır.

### Giriş

Kullanıcı e-posta adresi veya kullanıcı adıyla giriş yapabilir.

Girilen parola şu şekilde doğrulanır:

```ts
const isPasswordValid = await bcrypt.compare(
  password,
  user.passwordHash,
);
```

Parola doğruysa access token ve refresh token oluşturulur.

### Access Token

Access token, korumalı endpoint'lere erişmek için kullanılır.

Varsayılan geçerlilik süresi:

```text
15 dakika
```

İsteklerde şu başlıkla gönderilir:

```http
Authorization: Bearer ACCESS_TOKEN
```

Access token kısa süreli tutulur. Böylece token ele geçirilse bile kullanım süresi sınırlı olur.

### Refresh Token

Refresh token, access token süresi dolduğunda yeni token üretmek için kullanılır.

Varsayılan geçerlilik süresi:

```text
7 gün
```

Refresh token doğrudan veritabanına kaydedilmez. Yalnızca hashlenmiş hali saklanır:

```ts
const refreshTokenHash = await bcrypt.hash(
  refreshToken,
  12,
);
```

### Refresh Token Rotation

Her token yenileme işleminde yeni bir refresh token oluşturulur.

Eski refresh token geçersiz hale gelir ve veritabanındaki hash yeni değerle değiştirilir.

```text
Eski refresh token doğrulanır
        ↓
Yeni access token oluşturulur
        ↓
Yeni refresh token oluşturulur
        ↓
Refresh token hash güncellenir
```

### Logout

Logout sırasında kullanıcının refresh token hash'i silinir:

```ts
refreshTokenHash: null
```

Böylece kullanıcı mevcut refresh token ile yeni access token üretemez.

## Access Token Guard

Korumalı endpoint'lerde `AccessTokenGuard` kullanılır.

Guard şu işlemleri yapar:

1. Authorization başlığını okur.
2. Bearer token'ı ayırır.
3. Token imzasını doğrular.
4. Token süresini kontrol eder.
5. Kullanıcı bilgilerini `request.user` içine ekler.

Örnek:

```ts
@Get('me')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
getProfile(@Req() request: AuthenticatedRequest) {
  return {
    userId: request.user.sub,
    email: request.user.email,
    username: request.user.username,
  };
}
```

## Neden Bu Teknolojiler Kullanıldı?

### NestJS

NestJS; module, controller, service, dependency injection ve guard yapılarını hazır sunduğu için tercih edildi.

Bu yapı backend kodunun daha düzenli ve büyütülebilir olmasını sağlar.

### Prisma ORM

Prisma, PostgreSQL işlemlerini type-safe şekilde yapmak için kullanılır.

Ayrıca migration sistemi sayesinde veritabanı değişiklikleri takip edilebilir.

### PostgreSQL

PostgreSQL, kullanıcılar, dersler, ilerleme bilgileri ve ödüller arasındaki ilişkileri yönetmek için kullanılır.

### bcrypt

Bcrypt, kullanıcı şifrelerini güvenli şekilde hashlemek için kullanılır.

Salt ve cost factor desteği sayesinde parola saklamak için uygundur.

### JWT

JWT, kullanıcı kimliğini doğrulamak ve korumalı endpoint'lere erişim sağlamak için kullanılır.

Access token kısa süreli, refresh token ise daha uzun süreli tutulur.

### class-validator

DTO alanlarını doğrulamak için kullanılır.

Örnek kontroller:

* E-posta formatı
* Minimum şifre uzunluğu
* Zorunlu alanlar
* Maksimum karakter uzunluğu

### Swagger

Swagger, API endpoint'lerini tarayıcı üzerinden görüntülemek ve test etmek için kullanılır.

## Authentication Endpoint'leri

| Method | Endpoint             | Açıklama                        | Yetki        |
| ------ | -------------------- | ------------------------------- | ------------ |
| POST   | `/api/auth/register` | Yeni kullanıcı oluşturur        | Public       |
| POST   | `/api/auth/login`    | Kullanıcı girişi yapar          | Public       |
| POST   | `/api/auth/refresh`  | Tokenları yeniler               | Public       |
| POST   | `/api/auth/logout`   | Oturumu kapatır                 | Bearer Token |
| GET    | `/api/auth/me`       | Giriş yapan kullanıcıyı getirir | Bearer Token |

## Kurulum

Backend klasörüne geçin:

```bash
cd apps/api
```

Paketleri yükleyin:

```bash
npm install
```

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
copy .env.example .env
```

PostgreSQL servisini başlatın:

```bash
docker compose up -d
```

Migration'ları çalıştırın:

```bash
npx prisma migrate dev
```

Prisma Client'ı oluşturun:

```bash
npx prisma generate
```

Backend'i başlatın:

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

## Ortam Değişkenleri

```env
PORT=3001

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/code_journey?schema=public"

JWT_ACCESS_SECRET="CHANGE_WITH_A_STRONG_ACCESS_SECRET"
JWT_ACCESS_EXPIRES_IN="15m"

JWT_REFRESH_SECRET="CHANGE_WITH_A_STRONG_REFRESH_SECRET"
JWT_REFRESH_EXPIRES_IN="7d"
```

Gerçek secret değerleri GitHub'a gönderilmemelidir.

## Güvenlik Notları

* Şifreler düz metin olarak saklanmaz.
* Şifre hash'leri API cevaplarında dönmez.
* Refresh token'ın yalnızca hashlenmiş hali saklanır.
* Access ve refresh token farklı secret değerleri kullanır.
* Access token kısa süreli tutulur.
* Geçersiz kullanıcı ve yanlış parola için aynı hata mesajı döner.
* `.env` dosyaları Git tarafından takip edilmez.

## Mevcut Sınırlama

Şu anda her kullanıcı için tek bir `refreshTokenHash` saklanır.

Bu nedenle kullanıcı başka bir cihazdan giriş yaptığında eski cihazın refresh token'ı geçersiz hale gelir.

İleride çoklu cihaz desteği için ayrı bir `UserSession` tablosu kullanılabilir.

## Sonraki Aşamalar

* Kullanıcı profil sistemi
* Rol ve yetkilendirme
* Ders ve bölüm modelleri
* İlerleme sistemi
* XP ve seviye sistemi
* Kalp ve coin sistemi
* Günlük seri sistemi
* Başarımlar
* Otomatik testler

```
```
