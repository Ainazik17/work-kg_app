// Каталог профессий из design/src-types.ts (DESIGN_SPEC 6.5). Не править вручную — синхронизировать с дизайном.
export interface Profession { name: string; keywords: string }
export interface ProfessionSphere { sphere: string; items: Profession[] }

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
