# Code-Journey

## Challenge System

Code Journey içerisinde dersleri etkileşimli hale getirmek için Challenge System geliştirilmiştir.

### Desteklenen Challenge Türleri

- `MULTIPLE_CHOICE` — Çoktan seçmeli sorular
- `FILL_IN_THE_BLANK` — Boşluk doldurma
- `ORDER_CODE` — Kod satırlarını doğru sıralama
- `FIND_BUG` — Hatalı kodu bulma ve düzeltme
- `OUTPUT_PREDICTION` — Kod çıktısını tahmin etme

### Challenge Akışı

Kullanıcı bir derse ait challenge'ları görüntüler ve cevabını API üzerinden gönderir.

Cevap kontrolü backend tarafında gerçekleştirilir. `correctAnswer` normal challenge response'larında kullanıcıya gönderilmez.

```text
Challenge
   ↓
Kullanıcı cevabı
   ↓
Backend doğrulaması
   ↓
UserChallengeAttempt
   ↓
Doğru cevap
   ↓
XP + Coin

Bir challenge birden fazla kez cevaplanabilir ancak XP ve coin ödülü yalnızca kullanıcının ilk doğru cevabında verilir.

Challenge Progress

Kullanıcının challenge bazlı ilerlemesi takip edilir:

Deneme sayısı
Doğru deneme sayısı
Tamamlanma durumu
İlk tamamlanma zamanı
Kazanılan XP
Kazanılan coin

Ayrıca ders içerisindeki challenge ilerlemesi hesaplanır:

Toplam challenge
Tamamlanan challenge
Kalan challenge
İlerleme yüzdesi
Ders challenge tamamlanma durumu
Challenge API
GET  /api/lessons/:lessonId/challenges
POST /api/challenges/:id/submit
GET  /api/challenges/:id/progress
GET  /api/lessons/:lessonId/challenges/progress

Cevap gönderme ve progress endpointleri JWT Access Token ile korunmaktadır.

Challenge Güvenliği

Challenge'ın doğru cevabı Prisma üzerinde correctAnswer alanında tutulur ancak challenge listeleme endpointinde istemciye gönderilmez.

Doğru cevap kontrolü yalnızca backend tarafında yapılır. Açıklama (explanation) ise kullanıcı cevabını gönderdikten sonra döndürülür.
