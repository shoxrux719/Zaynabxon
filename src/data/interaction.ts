export type Lang = 'uz' | 'ru' | 'en';

export const interaction = {
  uz: {
    title: 'Raqamlar ortida —', accent: 'haqiqiy ishlar.',
    lead: 'Natijalar, sahifalar va grafik kartochkalar. Materialni oching — barcha tafsilotlarni yaqindan ko‘ring.',
    results: 'Natijalar', design: 'Grafik dizayn', more: 'Yana ko‘rsatish', shown: 'Ko‘rsatildi', of: '/', allShown: 'Barcha materiallar ko‘rsatildi', open: 'Materialni ochish', image: 'Statistika va sahifalar', graphic: 'Grafik kartochka', video: 'Video',
    previous: 'Oldingi', next: 'Keyingi', close: 'Yopish', zoomIn: 'Kattalashtirish', zoomOut: 'Ekranga sig‘dirish', loading: 'Yuklanmoqda', imageError: 'Material yuklanmadi. Qayta urinib ko‘ring.', retry: 'Qayta yuklash',
    logos: 'Loyihalar va ta’lim', logosHint: 'Yaqinroq tanishgan brendlar', pause: 'Lentani to‘xtatish', resume: 'Lentani davom ettirish',
    formTitle: 'Biznesingiz va marketing vazifalari haqida yozing', firstName: 'Ism', lastName: 'Familiya', optional: 'ixtiyoriy', phone: 'Telefon raqami', phoneHint: 'Namuna: +998 90 123 45 67', brief: 'Loyiha haqida', briefPlaceholder: 'Biznesingiz, auditoriyangiz va kontent orqali hal qilmoqchi bo‘lgan vazifangiz haqida qisqacha yozing.',
    submit: 'Xabar yuborish', sending: 'Yuborilmoqda…', sent: 'Yuborildi', success: 'Rahmat! Xabaringiz yetkazildi. Tez orada siz bilan bog‘lanaman.', formNote: 'Xabaringiz va aloqa ma’lumotlaringiz menga Telegram orqali yuboriladi.',
    nameError: 'Ismingizni kiriting. Harflar, bo‘sh joy va apostrofdan foydalaning.', lastNameError: 'Familiyangizni tekshiring yoki maydonni bo‘sh qoldiring.', phoneError: '9 xonali telefon raqamini to‘liq kiriting.',
    notConfigured: 'Yuborish xizmati hozir mavjud emas. Menga Telegram orqali yozishingiz mumkin.', deliveryError: 'Xabar yetkazilmadi. Qayta urinib ko‘ring yoki Telegram orqali yozing.', rateError: 'Juda ko‘p urinish. Birozdan keyin qayta urinib ko‘ring.', invalidError: 'Ism va telefon raqamini tekshiring.', direct: 'Telegram orqali yozish',
  },
  ru: {
    title: 'За цифрами —', accent: 'реальная работа.',
    lead: 'Результаты, страницы и графические карточки. Откройте материал, чтобы рассмотреть все детали.',
    results: 'Результаты', design: 'Графический дизайн', more: 'Показать ещё', shown: 'Показано', of: 'из', allShown: 'Все материалы показаны', open: 'Открыть материал', image: 'Статистика и страницы', graphic: 'Графическая карточка', video: 'Видео',
    previous: 'Предыдущий', next: 'Следующий', close: 'Закрыть', zoomIn: 'Увеличить', zoomOut: 'Вписать в экран', loading: 'Загрузка', imageError: 'Материал не загрузился. Попробуйте ещё раз.', retry: 'Повторить загрузку',
    logos: 'Проекты и обучение', logosHint: 'Бренды, с которыми знакома ближе', pause: 'Остановить ленту', resume: 'Продолжить движение ленты',
    formTitle: 'Расскажите о бизнесе и задачах маркетинга', firstName: 'Имя', lastName: 'Фамилия', optional: 'необязательно', phone: 'Номер телефона', phoneHint: 'Пример: +998 90 123 45 67', brief: 'О проекте', briefPlaceholder: 'Кратко опишите бизнес, аудиторию и задачи, которые хотите решить с помощью контента.',
    submit: 'Отправить сообщение', sending: 'Отправляем…', sent: 'Отправлено', success: 'Спасибо! Сообщение доставлено. Скоро свяжусь с вами.', formNote: 'Сообщение и ваши контактные данные придут мне в Telegram.',
    nameError: 'Введите имя. Используйте буквы, пробелы и апостроф.', lastNameError: 'Проверьте фамилию или оставьте поле пустым.', phoneError: 'Введите все 9 цифр номера после +998.',
    notConfigured: 'Отправка сейчас недоступна. Вы можете написать мне напрямую в Telegram.', deliveryError: 'Сообщение не доставлено. Попробуйте ещё раз или напишите в Telegram.', rateError: 'Слишком много попыток. Попробуйте немного позже.', invalidError: 'Проверьте имя и номер телефона.', direct: 'Написать в Telegram',
  },
  en: {
    title: 'Behind the numbers —', accent: 'real work.',
    lead: 'Analytics, pages and graphic cards. Open an item to explore every detail.',
    results: 'Results', design: 'Graphic design', more: 'Show more', shown: 'Showing', of: 'of', allShown: 'All materials are shown', open: 'Open material', image: 'Analytics & pages', graphic: 'Graphic card', video: 'Video',
    previous: 'Previous', next: 'Next', close: 'Close', zoomIn: 'Zoom in', zoomOut: 'Fit to screen', loading: 'Loading', imageError: 'This item could not load. Please try again.', retry: 'Reload',
    logos: 'Projects & education', logosHint: 'Brands I know more closely', pause: 'Pause the ribbon', resume: 'Resume the ribbon',
    formTitle: 'Tell me about your business and marketing goals', firstName: 'First name', lastName: 'Last name', optional: 'optional', phone: 'Phone number', phoneHint: 'Example: +998 90 123 45 67', brief: 'About the project', briefPlaceholder: 'Briefly describe your business, audience and the goals you want to achieve through content.',
    submit: 'Send message', sending: 'Sending…', sent: 'Sent', success: 'Thank you! Your message was delivered. I’ll get back to you soon.', formNote: 'Your message and contact details will be delivered to me through Telegram.',
    nameError: 'Enter your name using letters, spaces and apostrophes.', lastNameError: 'Check the last name or leave it blank.', phoneError: 'Enter all 9 digits after +998.',
    notConfigured: 'Delivery is unavailable right now. You can contact me directly on Telegram.', deliveryError: 'Your message was not delivered. Please try again or contact me on Telegram.', rateError: 'Too many attempts. Please try again later.', invalidError: 'Please check your name and phone number.', direct: 'Message on Telegram',
  },
} as const;
