# Сайт баскетбольного клуба «Хаски»

Одностраничный лендинг в бумажном / scrapbook / editorial стиле.
Чистый стек: **HTML + CSS + JavaScript**, без сборки и зависимостей.

## Запуск локально

Любой статический сервер. Например, Python:

```bash
cd husky-site
python -m http.server 4173
```

Открыть: <http://127.0.0.1:4173>

(Можно и просто открыть `index.html` в браузере, но с сервером корректнее работают
шрифты, iframe карты и относительные пути.)

## Структура

```
husky-site/
├─ index.html          # весь лендинг (10 блоков)
├─ styles/styles.css   # стили: палитра, скрапбук-компоненты, адаптив, анимации
├─ js/main.js          # reveal при скролле, галерея-мозаика, лайтбокс, меню, модалка
├─ assets/
│  ├─ branding/        # логотип студии-разработчика
│  ├─ icons/           # VK, Telegram
│  ├─ photos/gallery/  # 5 фотокатегорий по 20 оптимизированных кадров
│  ├─ partners/        # материалы партнёра Welcome Home
│  └─ ui/og-cover.jpg  # картинка для соцсетей (Open Graph)
├─ robots.txt
├─ sitemap.xml
└─ set-domain.sh       # подстановка реального домена перед деплоем
```

## Контент и факты

- Все ссылки реальные: [VK](https://vk.com/huskybasketball),
  [Telegram](https://t.me/basketbolhasku),
  [Яндекс.Карты](https://yandex.ru/maps/-/CTu0aUkq), телефон и почта клуба.
- Конкретные даты, цены и цифры **не выдумывались** (по требованию ТЗ).
  Блоки праздников/лагеря описывают регулярную жизнь клуба без ложной привязки
  к конкретным событиям на фото.
- На сайте используются реальные фотографии клуба: тренировки, турнир 3×3,
  Новый год, летний лагерь и клубная фотосессия. Изображения оптимизированы
  для веба и лежат в `assets/photos/`.

## Публикация

Сайт опубликован через GitHub Pages:
`https://sharkeey777.github.io/husky/`.

При переходе на собственный домен замените текущий адрес в `index.html`,
`robots.txt` и `sitemap.xml` либо обновите `set-domain.sh` под нужный домен.

## Вариант деплоя на VPS

1. **Поставить домен** в `index.html`, `robots.txt` и `sitemap.xml`.

   ```bash
   ./set-domain.sh https://ваш-домен.ru
   ```

2. **Залить файлы** папки `husky-site` на сервер как обычную статику
   (в корень сайта, например `/var/www/husky`).

3. **Nginx** (пример):

   ```nginx
   server {
       listen 80;
       server_name ваш-домен.ru www.ваш-домен.ru;
       root /var/www/husky;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Кэш статики
       location ~* \.(?:css|js|jpg|jpeg|png|svg|webp|woff2)$ {
           expires 30d;
           add_header Cache-Control "public, immutable";
       }

       gzip on;
       gzip_types text/css application/javascript image/svg+xml;
   }
   ```

4. **HTTPS**: подключить сертификат (например, `certbot --nginx`).

5. Проверить, что открываются: карта, соцсети, кнопка «Записаться».

## Что можно доработать позже

- Подключить собственный домен.
- Уточнить адрес зала на карте, если нужен конкретный маркер вместо поиска.
