# Thinking People: эксплуатация

- Сайт: http://82.26.91.140/
- Plasmic host: http://82.26.91.140/plasmic-host/
- Strapi: http://82.26.91.140:1337/admin (development).
- Next.js: `/home/bsadmin/tp_site`; systemd: `tp-site`.
- Strapi: `/home/bsadmin/my-strapi`; systemd: `strapi`; PostgreSQL: `tp_strapi`.

## Next.js

Под пользователем `bsadmin`:

```sh
/home/bsadmin/bin/build-tp-site-prod-release
# Короткий псевдоним той же команды:
tp-site
# Сборка текущих локальных исходников без fetch:
tp-site --local
```

Команда делает fetch и fast-forward из main, но не уничтожает локальные изменения. Если есть локальные изменения, команда сообщает об этом и собирает текущие файлы без перезаписи из GitHub. `--local` также пропускает fetch. Каждый релиз получает собственные зависимости и standalone-сервер. Рабочий путь `/home/bsadmin/runtime/tp-site` переключается атомарно после сборки; проверка HTTP запускает откат при ошибке. Хранятся последние три релиза и предыдущий рабочий релиз, если он старше.

Изображения Next.js: `/home/bsadmin/shared/tp-site/image-cache`, симлинк из `.next/standalone/.next/cache/images` каждого релиза. Это именно кэш `next/image`; обработчик `/api/optimized-image` сохраняет исходное поведение HTTP-кэширования.

Настройки: `/home/bsadmin/shared/tp-site/app.env` (600). После изменения `NEXT_PUBLIC_*` обязательна новая сборка. Остальные настройки применяются после перезапуска. Ключ revalidate новый, доступен в этом файле.

```sh
journalctl -u tp-site -n 100 --no-pager
sudo systemctl restart tp-site
```

## Формы

Перенесён `FormWebhookBridge`, подключён глобально в `_app`. В Plasmic форме задайте класс `js-lead-form`; структура полей должна соответствовать bridge. API: `/api/lead/`, диагностика `/api/lead-client-event/`. Сохраняются токен формы, минимальное время заполнения, captcha, защита повторной отправки и события `lead-form-success`.

```sh
tail -f /home/bsadmin/logs/tp-leads.txt
journalctl -u tp-site --since today
```

Логи ротируются ежедневно (30 архивов); защита повторов находится в `/home/bsadmin/shared/tp-site/lead-guard`. Исторические заявки BS не копируются. Webhook и ключи капчи задаются через env. Новый IP необходимо разрешить в настройках SmartCaptcha. Реальная отправка в CRM при проверке развёртывания не выполняется.

## Revalidate

Только POST. Авторизация `Authorization: Bearer <REVALIDATE_SECRET>` (совместимый query-параметр `secret` также поддерживается). Тело: `{"path":"/"}` либо `{"paths":["/","/blog/example/"]}`. Некорректный секрет возвращает 401; частичные ошибки — 207.

## Strapi

Чистая база: модели, контент и администраторы BS не переносятся. Создайте первого администратора в UI. GraphQL установлен для будущего использования `lib/strapi-static-pages.ts`.

```sh
sudo deploy-strapi-production
```

Команда собирает отдельный релиз, останавливает запись на время backup PostgreSQL и uploads, переключает Strapi на production и проверяет `/_health`. Shared uploads и `.env` сохраняются. Backups: `/var/backups/tp-strapi/<timestamp>`. При ошибке старый runtime и режим восстанавливаются; изменения схемы БД автоматически не откатываются. Резервные копии сохраняются без автоматического удаления.

Пока у Strapi нет отдельного Git remote, команда собирает текущие локальные модели. После настройки remote origin обновляет main только через fast-forward и требует чистое рабочее дерево.

Для возврата в разработку (root): остановите `strapi`, переключите `/home/bsadmin/runtime/strapi` на `/home/bsadmin/my-strapi`, запишите `NODE_ENV=development` и `STRAPI_MODE=develop` в `/home/bsadmin/shared/strapi/runtime.env`, запустите `strapi`.

## Статические страницы Strapi

`lib/strapi-static-pages.ts` перенесён с pagination, обработкой slug и проверкой showOnSite. Старые страницы зависели от макетов Plasmic BS: их исходники сохранены в `docs/strapi-page-templates/*.tsx.example`. Перед активацией замените BS Plasmic imports на макеты TP и создайте соответствующие коллекции `articles`, `events`, `programs`, `experts` с полями `slug` и `showOnSite`.

Создайте read-only API token Strapi и задайте `STRAPI_BEARER_TOKEN`. В `STRAPI_ENABLED_COLLECTIONS` перечислите готовые коллекции через запятую. Пока список пуст, sitemap содержит только главную страницу TP.

## Сервисы и порты

nginx: 80 (TP), 1337 (Strapi). Next.js: loopback 3000; Strapi: loopback 8080; PostgreSQL: локально. Для домена обновите nginx, SITE_URL, PUBLIC_URL Strapi, allowlist изображений и настройки капчи, затем включите HTTPS и пересоберите приложения.

Файлы в `deploy/` — воспроизводимые конфигурации. `install-services.sh` предназначен для начальной установки: повторный запуск возвращает Strapi в development.

## Git and deployment recovery (2026-10-28)

An interrupted pull left the worktree partially updated. A source archive and repaired lockfile are saved under /var/backups/tp-site/git-repair-20261028; the original worktree is also kept in git stash. The matching upstream Plasmic sync was applied with fast-forward.

The GraphQL and Embed CSS packages imported by generated code are explicit dependencies. The fetch package's old host peer range is overridden to the same host 2.0.20 used by react-web, keeping one Plasmic context instance.

The locale page statically generates /en/ and /lv/ (current Strapi locales); / redirects temporarily to /en/. Add newly introduced languages to supportedLocales in pages/[locale].tsx.

The normal tp-site command now stops with an explanation if there are uncommitted changes; commit/stash first, or use tp-site --local deliberately. It never silently ignores upstream updates. Deployment health checks follow the root redirect.
