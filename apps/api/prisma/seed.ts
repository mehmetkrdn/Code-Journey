import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL ortam değişkeni tanımlı değil.',
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  // =====================================================
  // 1. COURSE
  // =====================================================

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

  // =====================================================
  // 2. SECTION
  // =====================================================

  const javaBasicsSection =
    await prisma.section.upsert({
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

  // =====================================================
  // 3. LESSON - DEĞİŞKENLER
  // =====================================================

  const variablesLesson =
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

  // =====================================================
  // 4. LESSON - VERİ TİPLERİ
  // =====================================================

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

  // =====================================================
  // 5. LESSON - OPERATÖRLER
  // =====================================================

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

  // =====================================================
  // 6. CHALLENGE - MULTIPLE CHOICE
  // =====================================================

  const variableTypeChallenge =
    await prisma.challenge.upsert({
      where: {
        lessonId_order: {
          lessonId: variablesLesson.id,
          order: 1,
        },
      },
      update: {
        type: 'MULTIPLE_CHOICE',
        question:
          "Java'da tam sayı saklamak için aşağıdakilerden hangisi kullanılabilir?",
        description:
          'Doğru veri tipini seç.',
        order: 1,
        xpReward: 5,
        coinReward: 1,
        isPublished: true,

        correctAnswer: {
          answer: 'int',
        },

        explanation:
          'int, Java içerisinde tam sayı değerlerini saklamak için kullanılan primitive veri tiplerinden biridir.',
      },
      create: {
        type: 'MULTIPLE_CHOICE',
        question:
          "Java'da tam sayı saklamak için aşağıdakilerden hangisi kullanılabilir?",
        description:
          'Doğru veri tipini seç.',
        order: 1,
        xpReward: 5,
        coinReward: 1,
        isPublished: true,

        correctAnswer: {
          answer: 'int',
        },

        explanation:
          'int, Java içerisinde tam sayı değerlerini saklamak için kullanılan primitive veri tiplerinden biridir.',

        lessonId: variablesLesson.id,
      },
    });

  // =====================================================
  // 7. CHALLENGE OPTIONS
  // =====================================================

  const multipleChoiceOptions = [
    {
      text: 'String',
      order: 1,
    },
    {
      text: 'int',
      order: 2,
    },
    {
      text: 'boolean',
      order: 3,
    },
    {
      text: 'char',
      order: 4,
    },
  ];

  for (const option of multipleChoiceOptions) {
    await prisma.challengeOption.upsert({
      where: {
        challengeId_order: {
          challengeId:
            variableTypeChallenge.id,
          order: option.order,
        },
      },
      update: {
        text: option.text,
      },
      create: {
        text: option.text,
        order: option.order,
        challengeId:
          variableTypeChallenge.id,
      },
    });
  }

  // =====================================================
  // 8. CHALLENGE - FILL IN THE BLANK
  // =====================================================

  await prisma.challenge.upsert({
    where: {
      lessonId_order: {
        lessonId: variablesLesson.id,
        order: 2,
      },
    },
    update: {
      type: 'FILL_IN_THE_BLANK',
      question:
        'Aşağıdaki Java kodundaki boşluğu doldur.',
      description:
        'Doğru veri tipini gir.',
      codeSnippet:
        '___ age = 21;',
      order: 2,
      xpReward: 5,
      coinReward: 1,
      isPublished: true,

      correctAnswer: {
        acceptedAnswers: ['int'],
      },

      explanation:
        '21 bir tam sayı olduğu için burada int veri tipi kullanılabilir.',
    },
    create: {
      type: 'FILL_IN_THE_BLANK',
      question:
        'Aşağıdaki Java kodundaki boşluğu doldur.',
      description:
        'Doğru veri tipini gir.',
      codeSnippet:
        '___ age = 21;',
      order: 2,
      xpReward: 5,
      coinReward: 1,
      isPublished: true,

      correctAnswer: {
        acceptedAnswers: ['int'],
      },

      explanation:
        '21 bir tam sayı olduğu için burada int veri tipi kullanılabilir.',

      lessonId: variablesLesson.id,
    },
  });

  await prisma.challenge.upsert({
    where: {
      lessonId_order: {
        lessonId: variablesLesson.id,
        order: 3,
      },
    },

    update: {
      type: 'ORDER_CODE',

      question:
        'Aşağıdaki Java kod satırlarını doğru sıraya koy.',

      description:
        'Kodun çalışması için satırları mantıksal sıraya getir.',

      codeSnippet: null,

      order: 3,

      xpReward: 10,
      coinReward: 2,

      isPublished: true,

      correctAnswer: {
        order: [
          'int age = 21;',
          'String name = "Mehmet";',
          'System.out.println(age);',
        ],
      },

      explanation:
        'Değişkenler kullanılmadan önce tanımlanmalıdır. Bu nedenle önce age ve name tanımlanır, ardından age ekrana yazdırılır.',
    },

    create: {
      type: 'ORDER_CODE',

      question:
        'Aşağıdaki Java kod satırlarını doğru sıraya koy.',

      description:
        'Kodun çalışması için satırları mantıksal sıraya getir.',

      order: 3,

      xpReward: 10,
      coinReward: 2,

      isPublished: true,

      correctAnswer: {
        order: [
          'int age = 21;',
          'String name = "Mehmet";',
          'System.out.println(age);',
        ],
      },

      explanation:
        'Değişkenler kullanılmadan önce tanımlanmalıdır. Bu nedenle önce age ve name tanımlanır, ardından age ekrana yazdırılır.',

      lessonId: variablesLesson.id,
    },
  });

  const orderCodeChallenge =
    await prisma.challenge.findUniqueOrThrow({
      where: {
        lessonId_order: {
          lessonId: variablesLesson.id,
          order: 3,
        },
      },
    });

  const orderCodeOptions = [
    {
      text: 'System.out.println(age);',
      order: 1,
    },
    {
      text: 'String name = "Mehmet";',
      order: 2,
    },
    {
      text: 'int age = 21;',
      order: 3,
    },
  ];

  for (const option of orderCodeOptions) {
    await prisma.challengeOption.upsert({
      where: {
        challengeId_order: {
          challengeId:
            orderCodeChallenge.id,

          order:
            option.order,
        },
      },

      update: {
        text:
          option.text,
      },

      create: {
        challengeId:
          orderCodeChallenge.id,

        text:
          option.text,

        order:
          option.order,
      },
    });
  }

  await prisma.challenge.upsert({
    where: {
      lessonId_order: {
        lessonId: variablesLesson.id,
        order: 4,
      },
    },

    update: {
      type: 'FIND_BUG',

      question:
        'Aşağıdaki Java kodundaki hatayı bul ve doğru satırı yaz.',

      description:
        'Kodda değişkenin veri tipi ile verilen değer uyuşmuyor.',

      codeSnippet:
        'String age = 21;',

      order: 4,

      xpReward: 10,
      coinReward: 2,

      isPublished: true,

      correctAnswer: {
        acceptedAnswers: [
          'int age = 21;',
          'Integer age = 21;',
        ],
      },

      explanation:
        '21 bir tam sayı değeridir. Bu nedenle değişken int veya Integer olarak tanımlanabilir.',
    },

    create: {
      type: 'FIND_BUG',

      question:
        'Aşağıdaki Java kodundaki hatayı bul ve doğru satırı yaz.',

      description:
        'Kodda değişkenin veri tipi ile verilen değer uyuşmuyor.',

      codeSnippet:
        'String age = 21;',

      order: 4,

      xpReward: 10,
      coinReward: 2,

      isPublished: true,

      correctAnswer: {
        acceptedAnswers: [
          'int age = 21;',
          'Integer age = 21;',
        ],
      },

      explanation:
        '21 bir tam sayı değeridir. Bu nedenle değişken int veya Integer olarak tanımlanabilir.',

      lessonId: variablesLesson.id,
    },
  });

  await prisma.challenge.upsert({
    where: {
      lessonId_order: {
        lessonId: variablesLesson.id,
        order: 5,
      },
    },

    update: {
      type: 'OUTPUT_PREDICTION',

      question:
        'Aşağıdaki Java kodunun ekran çıktısı nedir?',

      description:
        'Kodu çalıştırmadan önce sonucu tahmin et.',

      codeSnippet: `
  int age = 21;
  int nextAge = age + 1;

  System.out.println(nextAge);
      `.trim(),

      order: 5,

      xpReward: 10,
      coinReward: 2,

      isPublished: true,

      correctAnswer: {
        acceptedAnswers: [
          '22',
        ],
      },

      explanation:
        'age değişkeninin değeri 21’dir. nextAge = age + 1 işlemi sonucunda nextAge 22 olur ve ekrana 22 yazdırılır.',
    },

    create: {
      type: 'OUTPUT_PREDICTION',

      question:
        'Aşağıdaki Java kodunun ekran çıktısı nedir?',

      description:
        'Kodu çalıştırmadan önce sonucu tahmin et.',

      codeSnippet: `
  int age = 21;
  int nextAge = age + 1;

  System.out.println(nextAge);
      `.trim(),

      order: 5,

      xpReward: 10,
      coinReward: 2,

      isPublished: true,

      correctAnswer: {
        acceptedAnswers: [
          '22',
        ],
      },

      explanation:
        'age değişkeninin değeri 21’dir. nextAge = age + 1 işlemi sonucunda nextAge 22 olur ve ekrana 22 yazdırılır.',

      lessonId: variablesLesson.id,
    },
  });

  // =====================================================
  // 9. LOG
  // =====================================================

  console.log(
    'Seed işlemi başarıyla tamamlandı.',
  );

  console.log(
    'Java kursu, Java Temelleri bölümü, 3 ders ve 2 challenge eklendi.',
  );
}

main()
  .catch((error: unknown) => {
    console.error(
      'Seed işlemi başarısız oldu:',
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });