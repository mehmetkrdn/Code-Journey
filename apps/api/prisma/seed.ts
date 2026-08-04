import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL ortam değişkeni tanımlı değil.');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  const javaCourse = await prisma.course.upsert({
    where: {
      slug: 'java',
    },
    update: {
      title: 'Java',
      description:
        'Java programlama dilini temel seviyeden nesne yönelimli programlamaya kadar öğreten eğitim yolu.',
      icon: '☕',
      order: 1,
      isPublished: true,
    },
    create: {
      title: 'Java',
      slug: 'java',
      description:
        'Java programlama dilini temel seviyeden nesne yönelimli programlamaya kadar öğreten eğitim yolu.',
      icon: '☕',
      order: 1,
      isPublished: true,
    },
  });

  const javaBasicsSection = await prisma.section.upsert({
    where: {
      id: 'java-basics-section',
    },
    update: {
      title: 'Java Temelleri',
      description:
        'Java sözdizimi, değişkenler, veri tipleri ve temel operatörler.',
      order: 1,
      isPublished: true,
      courseId: javaCourse.id,
    },
    create: {
      id: 'java-basics-section',
      title: 'Java Temelleri',
      description:
        'Java sözdizimi, değişkenler, veri tipleri ve temel operatörler.',
      order: 1,
      isPublished: true,
      courseId: javaCourse.id,
    },
  });

  await prisma.lesson.upsert({
    where: {
      sectionId_slug: {
        sectionId: javaBasicsSection.id,
        slug: 'java-degiskenler',
      },
    },
    update: {
      title: 'Java Değişkenleri',
      description:
        'Java dilinde değişken tanımlama ve değer atama.',
      content: `
# Java Değişkenleri

Değişkenler, program içerisinde verileri bellekte saklamak için kullanılır.

## Örnek

\`\`\`java
int age = 21;
String name = "Mehmet";
double score = 85.5;
\`\`\`

Bir değişken tanımlanırken veri tipi, değişken adı ve isteğe bağlı başlangıç değeri belirtilir.
      `.trim(),
      order: 1,
      xpReward: 10,
      coinReward: 5,
      estimatedTime: 5,
      isPublished: true,
    },
    create: {
      title: 'Java Değişkenleri',
      slug: 'java-degiskenler',
      description:
        'Java dilinde değişken tanımlama ve değer atama.',
      content: `
# Java Değişkenleri

Değişkenler, program içerisinde verileri bellekte saklamak için kullanılır.

## Örnek

\`\`\`java
int age = 21;
String name = "Mehmet";
double score = 85.5;
\`\`\`

Bir değişken tanımlanırken veri tipi, değişken adı ve isteğe bağlı başlangıç değeri belirtilir.
      `.trim(),
      order: 1,
      xpReward: 10,
      coinReward: 5,
      estimatedTime: 5,
      isPublished: true,
      sectionId: javaBasicsSection.id,
    },
  });

  await prisma.lesson.upsert({
    where: {
      sectionId_slug: {
        sectionId: javaBasicsSection.id,
        slug: 'java-veri-tipleri',
      },
    },
    update: {
      title: 'Java Veri Tipleri',
      description:
        'Primitive ve referans veri tiplerinin temel kullanımı.',
      content: `
# Java Veri Tipleri

Java statik tipli bir programlama dilidir. Her değişkenin veri tipi tanımlanmalıdır.

## Primitive veri tipleri

- int
- double
- boolean
- char
- long
- float
- byte
- short

## Referans veri tipi örneği

\`\`\`java
String message = "Code Journey";
\`\`\`
      `.trim(),
      order: 2,
      xpReward: 10,
      coinReward: 5,
      estimatedTime: 6,
      isPublished: true,
    },
    create: {
      title: 'Java Veri Tipleri',
      slug: 'java-veri-tipleri',
      description:
        'Primitive ve referans veri tiplerinin temel kullanımı.',
      content: `
# Java Veri Tipleri

Java statik tipli bir programlama dilidir. Her değişkenin veri tipi tanımlanmalıdır.

## Primitive veri tipleri

- int
- double
- boolean
- char
- long
- float
- byte
- short

## Referans veri tipi örneği

\`\`\`java
String message = "Code Journey";
\`\`\`
      `.trim(),
      order: 2,
      xpReward: 10,
      coinReward: 5,
      estimatedTime: 6,
      isPublished: true,
      sectionId: javaBasicsSection.id,
    },
  });

  await prisma.lesson.upsert({
    where: {
      sectionId_slug: {
        sectionId: javaBasicsSection.id,
        slug: 'java-operatorler',
      },
    },
    update: {
      title: 'Java Operatörleri',
      description:
        'Aritmetik, karşılaştırma ve mantıksal operatörler.',
      content: `
# Java Operatörleri

Operatörler değerler üzerinde işlem yapmak için kullanılır.

## Aritmetik operatörler

\`\`\`java
int total = 10 + 5;
int difference = 10 - 5;
int product = 10 * 5;
int division = 10 / 5;
\`\`\`

## Karşılaştırma operatörü

\`\`\`java
boolean result = total >= 15;
\`\`\`
      `.trim(),
      order: 3,
      xpReward: 15,
      coinReward: 5,
      estimatedTime: 7,
      isPublished: true,
    },
    create: {
      title: 'Java Operatörleri',
      slug: 'java-operatorler',
      description:
        'Aritmetik, karşılaştırma ve mantıksal operatörler.',
      content: `
# Java Operatörleri

Operatörler değerler üzerinde işlem yapmak için kullanılır.

## Aritmetik operatörler

\`\`\`java
int total = 10 + 5;
int difference = 10 - 5;
int product = 10 * 5;
int division = 10 / 5;
\`\`\`

## Karşılaştırma operatörü

\`\`\`java
boolean result = total >= 15;
\`\`\`
      `.trim(),
      order: 3,
      xpReward: 15,
      coinReward: 5,
      estimatedTime: 7,
      isPublished: true,
      sectionId: javaBasicsSection.id,
    },
  });

  console.log('Seed işlemi başarıyla tamamlandı.');
  console.log('Java kursu, Java Temelleri bölümü ve 3 ders eklendi.');
}

main()
  .catch((error: unknown) => {
    console.error('Seed işlemi başarısız oldu:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });