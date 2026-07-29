#!/usr/bin/env sh
# Создаёт отдельную папку deploy с URL будущего домена.
# Использование: ./set-domain.sh https://ваш-домен.ru
exec node "$(dirname "$0")/prepare-domain.mjs" "$@"
