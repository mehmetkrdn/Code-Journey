import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateLevel,getLevelProgress,} from '../progression/utils/level-calculator';
  
type CreateUserData = {
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        totalXp: true,
        level: true,
        CurrentStreak: true,
        longestStreak: true,
        hearts: true,
        coins: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByUsername(username: string) { //Kullanıcı adını veritabanında arar ve kullanıcıyı döndürür. Kullanıcı yoksa null döner.
    return this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  }

  async findByEmailOrUsername(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
      },
    });
  }
  async findById(id: string) { //refresh token içindeki kullanıcı kimliğine göre kullanıcıyı bulur.
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async updateRefreshTokenHash( //Login sırasında hash kaydeder.Token yenilemede eski hash’i değiştirir.Logout sırasında alanı null yapar.
    userId: string,
    refreshTokenHash: string | null,
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
      },
    });
  }
  async findProfileById(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: { //Burada özellikle select kullandık.Böylece aşağıdaki hassas alanlar yanlışlıkla API cevabına girmez: passwordHash, refreshTokenHash gibi.
        id: true,
        email: true,
        username: true,
        displayName: true,
        totalXp: true,
        level: true,
        CurrentStreak: true,
        longestStreak: true,
        hearts: true,
        coins: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile( //Kullanıcı profilini günceller. Kullanıcı kimliği ve güncellenecek verilerle birlikte çağrılır.
    userId: string,
    data: {
      displayName?: string;//görünenen ad ve username güncellenebiliyor. ekleme çıkarma yapılabilir kolon adı yazılarak.
      username?: string;
    },
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        totalXp: true,
        level: true,
        CurrentStreak: true,
        longestStreak: true,
        hearts: true,
        coins: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        totalXp: true,
        level: true,
        CurrentStreak: true,
        longestStreak: true,
        hearts: true,
        coins: true,
        createdAt: true,
      },
    });
  }

  async addXp( //Burada Prisma transaction kullanıyoruz. XP ekleme ve level güncelleme işlemleri birlikte gerçekleştirilir. İşlemlerden biri başarısız olursa diğeri de uygulanmaz.
    userId: string,
    xpAmount: number,
  ) {
    return this.prisma.$transaction(
      async (transaction) => {
        const user = await transaction.user.update({
          where: {
            id: userId,
          },
          data: {
            totalXp: {
              increment: xpAmount,
            },
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            totalXp: true,
            level: true,
          },
        });

        const calculatedLevel =
          calculateLevel(user.totalXp);

        let updatedUser = user;

        if (user.level !== calculatedLevel) {
          updatedUser =
            await transaction.user.update({
              where: {
                id: userId,
              },
              data: {
                level: calculatedLevel,
              },
              select: {
                id: true,
                username: true,
                displayName: true,
                totalXp: true,
                level: true,
              },
            });
        }

        return {
          user: updatedUser,
          progression: getLevelProgress(
            updatedUser.totalXp,
          ),
        };
      },
    );
  }

  async findHeartsByUserId(userId:string){ //kullanıcı can bilgisi getirir.
    return this.prisma.user.findUnique({
      where: {
        id:userId,//userid eşitliği olan
      },
      select: { //bunlar getirilir
        id:true,
        hearts:true,
      },
    });
  } //bu sorgu prisma orm kullanarak dbden yalnızca gerekli alanları getirir. id hearts gibi.

  async useHeart(userId:string){ //Can kullanma metodudur. Kullanıcının canı 0'dan büyükse 1 azalt, başarıyla azalttıysan güncel durumu getirir. eğer canı kalmamışsa veya kullanıcı yoksa null döndürür
    return this.prisma.$transaction( //prisma nesnesidir. işlemler zincirleme olduğu için iptal veya değişiklikte bunu kullanmak daha mantıklı. rollback işlemi için yani
      async(transaction) => {
        const updateResult=
          await transaction.user.updateMany({ //Veritabanı okuma/yazma işlemleri zaman alır. JavaScript kodunun doğrudan akıp gitmesini engellemek ve veritabanından gelecek cevabı beklemek için fonksiyonu async (asenkron) tanımlarız ve başına await koyarı
            where: {
              id:userId,
              hearts:{
                gt:0,//mevcut kalp hakkı 0dan büyükse can indirme hakkı yaparız yani - ye düşme şansı yok sınır belirleriz
              },
            },
            data: {
              hearts:{
                decrement:1,//eksiltmede kaç eksileceğini buradan belirleriz. birer birer eksilir
              },
            },
          });
        if (updateResult.count === 0){ //hem değer hem tip kontrolü yapılır. kaç kişinin güncelelndiği bilgisini verir.
          return null;
        }

        return transaction.user.findUnique({
          where: {
            id: userId,
          },
          select:{
            id: true,
            hearts: true,
          },
        });
      },
    );
  }
  
  async restoreHearts( //can yenileme metodu. kullanıcıya can ekleme işlemleri buradn yapılır
    userId:string,
    amount:number,
    maxHearts: number,
  ){
    return this.prisma.$transaction(
      async(transaction) => {
        const user=
          await transaction.user.findUnique({ //Önce kullanıcının veritabanındaki güncel hearts sayısını öğrenmek için kullanıcıyı bulur. DBde işlem uzun olabileceği için await koyaduk beklemek amaçlı
            where:{
              id: userId,
            },
            select: {
              id : true,
              hearts:true,
            },
          });
        if (!user){ //kullanıcı idsi ile uyuşmuyorsa beklemeden null değeri verir
          return null;
        }

        const restoredHearts = Math.min(
          user.hearts + amount,
          maxHearts, //ne eklenirse eklensin maxheartsla max canı sabitliyoruz 5 oluyor hearts/constsdaki değere göre
        );

        return transaction.user.update({ //Math.min ile hesaplanan yeni can değerini veritabanına yazar ve güncellenmiş nesneyi (id ve hearts) geri döndürür.
          where: {
            id: userId,
          },
          data:{
            hearts: restoredHearts,
          },
          select: {
            id: true,
            hearts: true,
          },
        });
      },
    );
  }
  async findCoinsByUserId(userId: string) { //db'den eşleşen kullanıcının id ve coins bilgisini getirir
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        coins: true,
      },
    });
  }

  async addCoins( //Veritabanında idsi gönderilen kullanıcıyı bulur, mevcut coins miktarının üzerine amount kadar coins ekler ve işlem sonucunda kullanıcının güncel id ve coins bilgisini döndürür.
    userId: string,
    amount: number,
  ) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        coins: {
          increment: amount, //Prisma'da direkt veritabanı içinde sayısal alanlarda artırma/toplama işlemi yapmaya yarar. aynı anda 2 cihazdan ekleme yapılınca çakışamyı engeller. 
        },
      },
      select: {
        id: true,
        coins: true,
      },
    });
  }
  
  async spendCoins(//jeton harcama metodu
    userId: string,
    amount: number,
  ) {
    return this.prisma.$transaction(
      async (transaction) => {
        const updateResult =
          await transaction.user.updateMany({
            where: {
              id: userId,
              coins: {
                gte: amount,//Bu, kullanıcının jetonu harcanacak miktardan büyük veya eşitse işlemin gerçekleşmesini sağlar. Bu yöntemler harcama miktarı eksiye düşmez
              },
            },
            data: {
              coins: {
                decrement: amount,
              },
            },
          });

        if (updateResult.count === 0) {
          return null;
        }

        return transaction.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            coins: true,
          },
        });
      },
    );
  }


  async findStreakByUserId(userId: string) { //kullanıcının streak sorgusu yapılır
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        CurrentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });
  }

  async updateStreak( //kullanıcının streak bilgisi güncellenir
    userId: string,
    data: {
      CurrentStreak: number;
      longestStreak: number;
      lastActivityDate: Date;
    },
  ) {
    return this.prisma.user.update({
      where: {
        id: userId, //hedef-koşulu sağlayan şeyler gibi
      },
      data: { //değişecek veriler datadır.
        CurrentStreak: data.CurrentStreak,
        longestStreak: data.longestStreak,
        lastActivityDate: data.lastActivityDate,
      },
      select: { //dönecek şeyler
        id: true,
        CurrentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
      },
    });
  }
}

//Burada create cevabında passwordHash alanını özellikle döndürmüyoruz çünkü bu alan hassas bir bilgi ve istemciye gönderilmemesi gerekiyor. Bu sayede kullanıcıların şifreleri güvenli bir şekilde saklanabilir ve istemci tarafında ifşa edilmez.