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
│  ├─ logos/           # логотип (svg + jpg)
│  ├─ icons/           # VK, Telegram
│  ├─ gallery/         # фото: team / training / events
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
- Фото взяты из папок исходного проекта (`husky-main`).

## Перед деплоем на VPS

1. **Поставить домен** (заменит плейсхолдер `husky-basketball.ru` в
   `index.html`, `robots.txt`, `sitemap.xml`):

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

- Добавить реальные фото поездок/лагеря/праздников в `assets/gallery/` и
  включить их в массив `GALLERY` в `js/main.js`.
- Заменить `og-cover.jpg` на специально свёрстанную обложку 1200×630.
- Уточнить адрес зала на карте, если нужен конкретный маркер вместо поиска.
