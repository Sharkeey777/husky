#!/usr/bin/env bash
# Заменяет плейсхолдер-домен на реальный во всех файлах перед деплоем.
# Использование:  ./set-domain.sh https://ваш-домен.ru
set -euo pipefail

NEW="${1:-}"
OLD="https://husky-basketball.ru"

if [ -z "$NEW" ]; then
  echo "Укажите домен: ./set-domain.sh https://ваш-домен.ru"
  exit 1
fi
NEW="${NEW%/}"  # убрать хвостовой слэш

for f in index.html robots.txt sitemap.xml; do
  # sed -i по-разному ведёт себя в GNU/BSD; используем переносимый вариант
  tmp="$(mktemp)"
  sed "s#${OLD}#${NEW}#g" "$f" > "$tmp" && mv "$tmp" "$f"
  echo "обновлён: $f"
done

echo "Готово. Домен: $NEW"
