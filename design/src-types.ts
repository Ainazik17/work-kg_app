// Work KG — типы данных для UI и мок-данные из прототипа.
// Компании вымышленные. Фото — заглушки Unsplash (в проде компании загружают свои).

export type CategoryCode = string;

export interface Category { code: CategoryCode; name: string }

export interface Company {
  id: string;
  name: string;
  type: string;              // «Ресторан турецкой кухни»
  category: CategoryCode;
  colors: [string, string];  // градиент обложки/логотипа: цвет1 → цвет2
  letters: string;           // буквы логотипа, если нет картинки
  logoUrl?: string;
  rating: number | null;
  reviewsCount: number;
  paidOnTimePct: number;     // «Платит вовремя N%»
  confirmRatePct: number;    // «Подтверждает отметки сотрудников: N%»
  staff: string;             // «120+»
  since: number;             // год на Work KG
  hiredCount: number;        // «наняли здесь»
  tagline: string;           // цитата на обложке
  about: string;
  perks: string[];           // «🍽 Питание»
  photos: { url: string; caption: string }[]; // [0] — обложка
  verified: boolean;
  isMine?: boolean;          // своя компания → кнопки загрузки фото
  following?: boolean;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  salaryText: string;        // «35 000 – 45 000 сом» | «Договорная»
  salaryPeriod?: 'month' | 'shift' | 'hour';
  schedule: string;
  experience: string;
  address: string;
  distance: string;          // «1,2 км»
  postedText: string;        // «Сегодня»
  description?: string;
  saved?: boolean;
  contacted?: boolean;
}

export interface Gig {
  id: string; title: string; day: string; time: string; pay: string;
  payPeriod?: 'total' | 'hour' | 'shift';
  author: string; authorRating: number | null; distance: string; urgent?: boolean;
}

export interface Review {
  authorRole: string;        // «Официант»
  tenure: string;            // «работал 8 мес.»
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
  disputed: boolean;         // «⚖️ Компания оспорила»
}

export interface Worker {
  id: string; name: string; letter: string; color: string;
  rating: number | null; reviewsCount: number; doneCount: number;
}

// Сделки: вопрос «Работали вместе?»
export interface DealQuestion { id: string; other: string; companyId?: string; title: string; when: string }
export interface DealConfirmRequest { id: string; other: string; companyId?: string; workerId?: string; title: string; autoConfirmIn: string }
export type WorkTrust = 'confirmed' | 'contact' | 'disputed' | 'proof_review';
export interface MyWork { other: string; title: string; stars: number; when: string; trust: WorkTrust }
export interface MyListing {
  id: string; title: string; when: string;
  expiresText: string;       // «Истекает завтра» | «Ещё 12 дней» | «Разовое»
  wroteWorkerIds: string[];  // кто написал через Work KG
  hiredWorkerIds: string[]; closed: boolean;
}

export interface Profession { name: string; keywords: string }
export interface ProfessionSphere { sphere: string; items: Profession[] }

export const POINTS_RATE = 0.05;   // 1 балл = 0,05 сом (100 баллов = 5 сом)
export const MIN_WITHDRAW = 1000;  // баллов
export const FREE_CONTACTS_PER_DAY = 3;
export const CATEGORY_ROW_COUNT = 8; // «Все» + 7 сфер, остальные — в «Ещё»

export const CATEGORIES: Category[] = [
  {
    "code": "all",
    "name": "Все"
  },
  {
    "code": "rest",
    "name": "Рестораны и кафе"
  },
  {
    "code": "cafe",
    "name": "Кофейни"
  },
  {
    "code": "hotel",
    "name": "Отели"
  },
  {
    "code": "sew",
    "name": "Швейные цеха"
  },
  {
    "code": "factory",
    "name": "Производство"
  },
  {
    "code": "market",
    "name": "Супермаркеты"
  },
  {
    "code": "it",
    "name": "IT-компании"
  },
  {
    "code": "fast",
    "name": "Фастфуд"
  },
  {
    "code": "retail",
    "name": "Магазины и ТЦ"
  },
  {
    "code": "bank",
    "name": "Банки и финансы"
  },
  {
    "code": "build",
    "name": "Стройка"
  },
  {
    "code": "log",
    "name": "Логистика и склады"
  },
  {
    "code": "delivery",
    "name": "Доставка"
  },
  {
    "code": "beauty",
    "name": "Салоны красоты"
  },
  {
    "code": "med",
    "name": "Клиники и аптеки"
  },
  {
    "code": "edu",
    "name": "Школы и курсы"
  },
  {
    "code": "kids",
    "name": "Детские сады"
  },
  {
    "code": "auto",
    "name": "Автосервисы"
  },
  {
    "code": "fit",
    "name": "Фитнес и спорт"
  },
  {
    "code": "call",
    "name": "Call-центры"
  },
  {
    "code": "event",
    "name": "Ивенты и банкеты"
  },
  {
    "code": "agro",
    "name": "Агро и фермы"
  },
  {
    "code": "clean",
    "name": "Клининг"
  },
  {
    "code": "sec",
    "name": "Охрана"
  }
];

export const PROFESSIONS: ProfessionSphere[] = [
  {
    "sphere": "IT",
    "items": [
      {
        "name": "Java-разработчик",
        "keywords": "java джава программист айти it backend бэкенд spring"
      },
      {
        "name": "Frontend-разработчик",
        "keywords": "фронтенд react js javascript программист айти it веб"
      },
      {
        "name": "Python-разработчик",
        "keywords": "питон программист айти it django"
      },
      {
        "name": "Мобильный разработчик",
        "keywords": "android ios flutter программист айти it"
      },
      {
        "name": "QA-тестировщик",
        "keywords": "тестировщик qa айти it"
      },
      {
        "name": "UI/UX-дизайнер",
        "keywords": "дизайнер figma айти it веб"
      },
      {
        "name": "DevOps-инженер",
        "keywords": "девопс kubernetes айти it"
      },
      {
        "name": "Аналитик данных",
        "keywords": "sql аналитик айти it"
      },
      {
        "name": "Project-менеджер",
        "keywords": ""
      },
      {
        "name": "Техподдержка",
        "keywords": ""
      },
      {
        "name": "1С-программист",
        "keywords": "1с программист айти"
      }
    ]
  },
  {
    "sphere": "Общепит",
    "items": [
      {
        "name": "Официант",
        "keywords": "кафе ресторан"
      },
      {
        "name": "Бариста",
        "keywords": ""
      },
      {
        "name": "Повар",
        "keywords": "кухня ашпозчу"
      },
      {
        "name": "Помощник повара",
        "keywords": ""
      },
      {
        "name": "Бармен",
        "keywords": ""
      },
      {
        "name": "Хостес",
        "keywords": ""
      },
      {
        "name": "Посудомойщик",
        "keywords": ""
      },
      {
        "name": "Пекарь",
        "keywords": ""
      },
      {
        "name": "Кондитер",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Дом и семья",
    "items": [
      {
        "name": "Няня",
        "keywords": "ребенок дети бала багуучу"
      },
      {
        "name": "Сиделка",
        "keywords": "уход пожилые больные"
      },
      {
        "name": "Домработница",
        "keywords": ""
      },
      {
        "name": "Гувернантка",
        "keywords": ""
      },
      {
        "name": "Повар на дом",
        "keywords": ""
      },
      {
        "name": "Садовник",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Образование",
    "items": [
      {
        "name": "Репетитор",
        "keywords": "учитель уроки математика"
      },
      {
        "name": "Учитель английского",
        "keywords": ""
      },
      {
        "name": "Воспитатель",
        "keywords": ""
      },
      {
        "name": "Фитнес-тренер",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Производство и цеха",
    "items": [
      {
        "name": "Швея",
        "keywords": "шитье швейный цех тигуучу"
      },
      {
        "name": "Закройщик",
        "keywords": ""
      },
      {
        "name": "Технолог швейного производства",
        "keywords": ""
      },
      {
        "name": "Оператор станка",
        "keywords": ""
      },
      {
        "name": "Упаковщик",
        "keywords": "упаковка цех"
      },
      {
        "name": "Контролёр ОТК",
        "keywords": ""
      },
      {
        "name": "Мастер цеха",
        "keywords": ""
      },
      {
        "name": "Рабочий на производство",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Торговля",
    "items": [
      {
        "name": "Продавец-консультант",
        "keywords": "продажи магазин сатуучу"
      },
      {
        "name": "Кассир",
        "keywords": ""
      },
      {
        "name": "Мерчендайзер",
        "keywords": ""
      },
      {
        "name": "Товаровед",
        "keywords": ""
      },
      {
        "name": "Торговый агент",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Офис",
    "items": [
      {
        "name": "Администратор",
        "keywords": ""
      },
      {
        "name": "Бухгалтер",
        "keywords": "1с учет"
      },
      {
        "name": "Менеджер по продажам",
        "keywords": ""
      },
      {
        "name": "Оператор call-центра",
        "keywords": ""
      },
      {
        "name": "HR-менеджер",
        "keywords": ""
      },
      {
        "name": "Секретарь",
        "keywords": ""
      },
      {
        "name": "Юрист",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Маркетинг и медиа",
    "items": [
      {
        "name": "SMM-специалист",
        "keywords": ""
      },
      {
        "name": "Таргетолог",
        "keywords": ""
      },
      {
        "name": "Копирайтер",
        "keywords": ""
      },
      {
        "name": "Фотограф",
        "keywords": ""
      },
      {
        "name": "Видеомонтажёр",
        "keywords": ""
      },
      {
        "name": "Мобилограф",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Красота",
    "items": [
      {
        "name": "Парикмахер",
        "keywords": ""
      },
      {
        "name": "Мастер маникюра",
        "keywords": ""
      },
      {
        "name": "Косметолог",
        "keywords": ""
      },
      {
        "name": "Массажист",
        "keywords": ""
      },
      {
        "name": "Визажист",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Стройка и ремонт",
    "items": [
      {
        "name": "Разнорабочий",
        "keywords": ""
      },
      {
        "name": "Электрик",
        "keywords": ""
      },
      {
        "name": "Сантехник",
        "keywords": ""
      },
      {
        "name": "Сварщик",
        "keywords": ""
      },
      {
        "name": "Маляр",
        "keywords": ""
      },
      {
        "name": "Плиточник",
        "keywords": ""
      },
      {
        "name": "Сборщик мебели",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Транспорт и склад",
    "items": [
      {
        "name": "Курьер",
        "keywords": "доставка яндекс глово"
      },
      {
        "name": "Водитель",
        "keywords": "шофер машина"
      },
      {
        "name": "Водитель такси",
        "keywords": ""
      },
      {
        "name": "Грузчик",
        "keywords": "переезд"
      },
      {
        "name": "Кладовщик",
        "keywords": ""
      },
      {
        "name": "Экспедитор",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Медицина",
    "items": [
      {
        "name": "Медсестра",
        "keywords": ""
      },
      {
        "name": "Фармацевт",
        "keywords": ""
      },
      {
        "name": "Врач",
        "keywords": ""
      },
      {
        "name": "Ветеринар",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Отели",
    "items": [
      {
        "name": "Администратор ресепшн",
        "keywords": ""
      },
      {
        "name": "Горничная",
        "keywords": ""
      },
      {
        "name": "Портье",
        "keywords": ""
      }
    ]
  },
  {
    "sphere": "Клининг и охрана",
    "items": [
      {
        "name": "Уборщица",
        "keywords": "клининг уборка тазалык"
      },
      {
        "name": "Клинер",
        "keywords": ""
      },
      {
        "name": "Охранник",
        "keywords": ""
      }
    ]
  }
];

export const POPULAR_PROFESSIONS: string[] = [
  "Официант",
  "Java-разработчик",
  "Няня",
  "Курьер",
  "Продавец-консультант",
  "Репетитор",
  "SMM-специалист",
  "Водитель",
  "Бариста",
  "Сиделка"
];

export const COMPANIES: Company[] = [
  {
    "id": "tash",
    "name": "Tash Kitchen",
    "type": "Ресторан турецкой кухни",
    "category": "rest",
    "colors": [
      "#2A0A09",
      "#B4161B"
    ],
    "letters": "TK",
    "rating": 4.8,
    "reviewsCount": 64,
    "paidOnTimePct": 99,
    "confirmRatePct": 97,
    "staff": "120+",
    "since": 2023,
    "hiredCount": 46,
    "tagline": "Ищем людей, которые любят гостей",
    "about": "Три ресторана в Бишкеке с открытой кухней и живым огнём. Обучаем с нуля, растим своих: 70% управляющих начинали официантами.",
    "perks": [
      "🍽 Питание",
      "👔 Форма",
      "💸 Чаевые",
      "📈 Рост до менеджера"
    ],
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=70&auto=format&fit=crop",
        "caption": "Зал на Тыналиева"
      },
      {
        "url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=70&auto=format&fit=crop",
        "caption": "Кухня"
      },
      {
        "url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&q=70&auto=format&fit=crop",
        "caption": "Терраса"
      },
      {
        "url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=70&auto=format&fit=crop",
        "caption": ""
      }
    ],
    "verified": true
  },
  {
    "id": "nomad",
    "name": "Nomad Coffee",
    "type": "Сеть кофеен · 9 точек",
    "category": "cafe",
    "colors": [
      "#1E130C",
      "#9A6A43"
    ],
    "letters": "N",
    "rating": 4.7,
    "reviewsCount": 38,
    "paidOnTimePct": 100,
    "confirmRatePct": 97,
    "staff": "80+",
    "since": 2022,
    "hiredCount": 31,
    "tagline": "Кофе, который знают по имени",
    "about": "Обжариваем зерно сами и учим бариста в собственной академии. Гибкий график для студентов.",
    "perks": [
      "☕ Бесплатный кофе",
      "🎓 Академия бариста",
      "🕒 Гибкий график"
    ],
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&q=70&auto=format&fit=crop",
        "caption": "Обжарочный цех"
      },
      {
        "url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=70&auto=format&fit=crop",
        "caption": "Кофейня в ЦУМе"
      },
      {
        "url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&q=70&auto=format&fit=crop",
        "caption": "Академия"
      },
      {
        "url": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&q=70&auto=format&fit=crop",
        "caption": ""
      }
    ],
    "verified": true
  },
  {
    "id": "orda",
    "name": "Orda Hotel",
    "type": "Отель 5★",
    "category": "hotel",
    "colors": [
      "#0B1626",
      "#2F5F8F"
    ],
    "letters": "O",
    "rating": 4.9,
    "reviewsCount": 22,
    "paidOnTimePct": 100,
    "confirmRatePct": 97,
    "staff": "200+",
    "since": 2024,
    "hiredCount": 18,
    "tagline": "Сервис мирового уровня",
    "about": "Отель для деловых гостей в центре Бишкека. Стандарты международной сети, обучение английскому за счёт компании.",
    "perks": [
      "🍽 Питание",
      "🚐 Развозка",
      "🇬🇧 Английский",
      "🩺 Медстраховка"
    ],
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=70&auto=format&fit=crop",
        "caption": "Лобби"
      },
      {
        "url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=70&auto=format&fit=crop",
        "caption": "Номер"
      },
      {
        "url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=70&auto=format&fit=crop",
        "caption": "Ресторан"
      },
      {
        "url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=70&auto=format&fit=crop",
        "caption": ""
      }
    ],
    "verified": true
  },
  {
    "id": "alatoo",
    "name": "Alatoo Tech",
    "type": "IT-продукт · финтех",
    "category": "it",
    "colors": [
      "#0F0F14",
      "#4F46E5"
    ],
    "letters": "A",
    "rating": 4.6,
    "reviewsCount": 17,
    "paidOnTimePct": 100,
    "confirmRatePct": 97,
    "staff": "60",
    "since": 2024,
    "hiredCount": 9,
    "tagline": "Строим платежи для Центральной Азии",
    "about": "Продуктовая команда: платёжный шлюз и B2B-решения для банков. Java, Kafka, PostgreSQL, Kubernetes.",
    "perks": [
      "🏠 Гибрид",
      "💻 MacBook",
      "📚 Бюджет на обучение",
      "🩺 Медстраховка"
    ],
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=70&auto=format&fit=crop",
        "caption": "Офис"
      },
      {
        "url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=70&auto=format&fit=crop",
        "caption": "Опен-спейс"
      },
      {
        "url": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&q=70&auto=format&fit=crop",
        "caption": "Переговорная"
      },
      {
        "url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=70&auto=format&fit=crop",
        "caption": ""
      }
    ],
    "verified": true
  },
  {
    "id": "kok",
    "name": "Kök Market",
    "type": "Сеть супермаркетов",
    "category": "market",
    "colors": [
      "#052E22",
      "#0E9F6E"
    ],
    "letters": "K",
    "rating": 4.4,
    "reviewsCount": 91,
    "paidOnTimePct": 96,
    "confirmRatePct": 97,
    "staff": "500+",
    "since": 2023,
    "hiredCount": 120,
    "tagline": "Свежее каждый день",
    "about": "24 магазина по городу. Берём без опыта, обучаем за неделю, официальное оформление с первого дня.",
    "perks": [
      "📄 Официально",
      "🛒 Скидка 15%",
      "🚐 Развозка"
    ],
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=900&q=70&auto=format&fit=crop",
        "caption": "Магазин"
      },
      {
        "url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=70&auto=format&fit=crop",
        "caption": "Склад"
      },
      {
        "url": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=900&q=70&auto=format&fit=crop",
        "caption": "Касса"
      },
      {
        "url": "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=900&q=70&auto=format&fit=crop",
        "caption": ""
      }
    ],
    "verified": true
  },
  {
    "id": "akjol",
    "name": "Ak-Jol Textile",
    "type": "Швейный цех · экспорт",
    "category": "sew",
    "colors": [
      "#1F1235",
      "#7C3AED"
    ],
    "letters": "AJ",
    "rating": 4.5,
    "reviewsCount": 47,
    "paidOnTimePct": 97,
    "confirmRatePct": 97,
    "staff": "300+",
    "since": 2023,
    "hiredCount": 64,
    "tagline": "Шьём для Европы и России",
    "about": "Швейное производство полного цикла. Сдельная оплата, выплаты каждые 2 недели, обучаем швей с нуля.",
    "perks": [
      "🍽 Обеды",
      "🚐 Развозка",
      "📄 Официально",
      "💰 Сдельная"
    ],
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=70&auto=format&fit=crop",
        "caption": "Цех"
      },
      {
        "url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=70&auto=format&fit=crop",
        "caption": "Раскрой"
      },
      {
        "url": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=70&auto=format&fit=crop",
        "caption": "ОТК"
      },
      {
        "url": "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=900&q=70&auto=format&fit=crop",
        "caption": ""
      }
    ],
    "verified": true
  },
  {
    "id": "shifa",
    "name": "Shifa Clinic",
    "type": "Многопрофильная клиника",
    "category": "med",
    "colors": [
      "#062A30",
      "#0891B2"
    ],
    "letters": "S",
    "rating": 4.7,
    "reviewsCount": 26,
    "paidOnTimePct": 100,
    "confirmRatePct": 97,
    "staff": "90",
    "since": 2024,
    "hiredCount": 14,
    "tagline": "Медицина с заботой",
    "about": "Клиника на 40 кабинетов: диагностика, стоматология, педиатрия. Помогаем с повышением квалификации.",
    "perks": [
      "🩺 Медстраховка",
      "🎓 Обучение",
      "📄 Официально"
    ],
    "photos": [
      {
        "url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=900&q=70&auto=format&fit=crop",
        "caption": "Ресепшн"
      },
      {
        "url": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=900&q=70&auto=format&fit=crop",
        "caption": "Кабинет"
      },
      {
        "url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=70&auto=format&fit=crop",
        "caption": "Лаборатория"
      },
      {
        "url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=900&q=70&auto=format&fit=crop",
        "caption": ""
      }
    ],
    "verified": true
  }
];

export const JOBS: Job[] = [
  {
    "id": "j7",
    "companyId": "akjol",
    "title": "Швея",
    "salaryText": "45 000 – 80 000 сом",
    "schedule": "5/2",
    "experience": "Обучим",
    "address": "Кара-Жыгач",
    "distance": "4,2 км",
    "postedText": "Сегодня"
  },
  {
    "id": "j8",
    "companyId": "shifa",
    "title": "Медсестра",
    "salaryText": "50 000 сом",
    "schedule": "2/2",
    "experience": "от 1 года",
    "address": "Ахунбаева",
    "distance": "2,6 км",
    "postedText": "Вчера"
  },
  {
    "id": "j1",
    "companyId": "tash",
    "title": "Официант",
    "salaryText": "35 000 – 45 000 сом",
    "schedule": "2/2",
    "experience": "от 1 года",
    "address": "Тыналиева, 93",
    "distance": "1,2 км",
    "postedText": "Сегодня"
  },
  {
    "id": "j2",
    "companyId": "nomad",
    "title": "Бариста",
    "salaryText": "40 000 – 55 000 сом",
    "schedule": "Сменный",
    "experience": "Обучим",
    "address": "ЦУМ",
    "distance": "0,6 км",
    "postedText": "Сегодня"
  },
  {
    "id": "j3",
    "companyId": "orda",
    "title": "Администратор ресепшн",
    "salaryText": "60 000 сом",
    "schedule": "2/2",
    "experience": "от 1 года",
    "address": "Центр",
    "distance": "2,0 км",
    "postedText": "Вчера"
  },
  {
    "id": "j4",
    "companyId": "alatoo",
    "title": "Java-разработчик",
    "salaryText": "150 000 – 250 000 сом",
    "schedule": "Гибрид",
    "experience": "от 3 лет",
    "address": "Ала-Тоо",
    "distance": "3,1 км",
    "postedText": "Вчера"
  },
  {
    "id": "j5",
    "companyId": "tash",
    "title": "Повар горячего цеха",
    "salaryText": "70 000 сом",
    "schedule": "2/2",
    "experience": "от 2 лет",
    "address": "Тыналиева, 93",
    "distance": "1,2 км",
    "postedText": "2 дня назад"
  },
  {
    "id": "j6",
    "companyId": "kok",
    "title": "Кассир",
    "salaryText": "35 000 сом",
    "schedule": "5/2",
    "experience": "Без опыта",
    "address": "Асанбай",
    "distance": "1,8 км",
    "postedText": "3 дня назад"
  }
];

export const GIGS: Gig[] = [
  {
    "id": "g1",
    "title": "Грузчики на переезд",
    "day": "Сегодня",
    "time": "15:00",
    "pay": "1 500 сом",
    "author": "Айгерим К.",
    "authorRating": 4.9,
    "distance": "0,8 км"
  },
  {
    "id": "g2",
    "title": "Официант на банкет",
    "day": "Сб",
    "time": "18:00",
    "pay": "2 000 сом",
    "author": "Tash Kitchen",
    "authorRating": 4.8,
    "distance": "1,2 км"
  },
  {
    "id": "g3",
    "title": "Собрать шкаф-купе",
    "day": "Завтра",
    "time": "10:00",
    "pay": "800 сом",
    "author": "Тимур А.",
    "authorRating": null,
    "distance": "1,5 км"
  }
];

/** Отзывы по id компании; ключ 'def' — для остальных компаний */
export const REVIEWS: Record<string, Review[]> = {
  "tash": [
    {
      "authorRole": "Официант",
      "tenure": "работал 8 мес.",
      "stars": 5,
      "text": "Чаевые делятся честно, график всегда заранее. Шеф строгий, но учит.",
      "disputed": false
    },
    {
      "authorRole": "Хостес",
      "tenure": "работала 1 год",
      "stars": 5,
      "text": "Зарплата день в день, кормят хорошо. Выросла до старшего администратора.",
      "disputed": false
    },
    {
      "authorRole": "Бармен",
      "tenure": "работал 3 мес.",
      "stars": 4,
      "text": "Хороший коллектив, но в выходные очень много гостей — нужно быть готовым.",
      "disputed": false
    },
    {
      "authorRole": "Помощник на кухню",
      "tenure": "1 смена",
      "stars": 2,
      "text": "Обещали 1500 за смену, заплатили 1000.",
      "disputed": true
    }
  ],
  "def": [
    {
      "authorRole": "Сотрудник",
      "tenure": "работал 6 мес.",
      "stars": 5,
      "text": "Всё как в описании вакансии, оформили официально.",
      "disputed": false
    },
    {
      "authorRole": "Сотрудник",
      "tenure": "работала 1 год",
      "stars": 4,
      "text": "Хорошие условия и обучение, иногда задерживают смены.",
      "disputed": false
    }
  ]
};

export const WORKERS: Worker[] = [
  {
    "id": "w1",
    "name": "Даниэл Базарбаев",
    "letter": "Д",
    "color": "#2563EB",
    "rating": 4.9,
    "reviewsCount": 21,
    "doneCount": 23
  },
  {
    "id": "w3",
    "name": "Нурик",
    "letter": "Н",
    "color": "#7C3AED",
    "rating": null,
    "reviewsCount": 0,
    "doneCount": 0
  },
  {
    "id": "w4",
    "name": "Айдай Тологонова",
    "letter": "А",
    "color": "#DB2777",
    "rating": 4.7,
    "reviewsCount": 9,
    "doneCount": 12
  },
  {
    "id": "w5",
    "name": "Бекзат Маратов",
    "letter": "Б",
    "color": "#0E9F6E",
    "rating": 4.8,
    "reviewsCount": 15,
    "doneCount": 18
  }
];

export const MOCK_QUESTIONS: DealQuestion[] = [
  { id: 'a1', other: 'Tash Kitchen', companyId: 'tash', title: 'Официант на банкет', when: 'Смена прошла в субботу' },
  { id: 'a2', other: 'Айгерим К.', title: 'Грузчики на переезд', when: 'Вчера, 15:00' }
];
export const MOCK_CONFIRMS: DealConfirmRequest[] = [
  { id: 'c1', other: 'Nomad Coffee', companyId: 'nomad', title: 'Бариста', autoConfirmIn: '31 ч' }
];
export const MOCK_EMPLOYER_CONFIRMS: DealConfirmRequest[] = [
  { id: 'e1', other: 'Даниэл Базарбаев', workerId: 'w1', title: 'Мойка окон в офисе', autoConfirmIn: '40 ч' }
];
export const MOCK_MY_WORKS: MyWork[] = [
  { other: 'Orda Hotel', title: 'Помощник на банкет', stars: 2, when: 'сен.', trust: 'disputed' },
  { other: 'Тимур А.', title: 'Собрать шкаф-купе', stars: 5, when: '3 нояб.', trust: 'confirmed' },
  { other: 'Kök Market', title: 'Кассир', stars: 4, when: 'окт.', trust: 'contact' }
];
export const MOCK_MY_LISTINGS: MyListing[] = [
  { id: 'mv1', title: 'Официант на банкет', when: 'Сб, 18:00', expiresText: 'Истекает завтра', wroteWorkerIds: ['w1','w3','w4','w5'], hiredWorkerIds: [], closed: false },
  { id: 'mv2', title: 'Повар горячего цеха', when: 'Постоянная · 2/2', expiresText: 'Ещё 12 дней', wroteWorkerIds: ['w5'], hiredWorkerIds: [], closed: false }
];

/** Склонение: plural(2, ['вакансия','вакансии','вакансий']) → «2 вакансии» */
export const plural = (n: number, [one, few, many]: [string, string, string]) => {
  const m = n % 10, h = n % 100;
  return `${n} ${m === 1 && h !== 11 ? one : m >= 2 && m <= 4 && (h < 12 || h > 14) ? few : many}`;
};
/** 62.5 → «62,50 сом» */
export const formatSom = (v: number) => v.toFixed(2).replace('.', ',') + ' сом';
/** 1250 → «1 250» */
export const formatInt = (v: number) => v.toLocaleString('ru-RU');
