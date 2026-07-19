# Denta

Local-first Svelte 5 SPA для ведения личной истории стоматологического лечения.

## Запуск

```bash
npm install
npm run dev
```

## Сборка для GitHub Pages

```bash
npm run build
```

Режим хранения задаётся явно через `VITE_DATA_MODE`:

```dotenv
# Только localStorage, Firebase не инициализируется даже при заполненном конфиге
VITE_DATA_MODE=local

# Google-вход, Firestore и облачная синхронизация
VITE_DATA_MODE=firebase
```

В локальном режиме данные сохраняются в `localStorage` и полностью экспортируются/импортируются в JSON через раздел «Синхронизация». Firebase-конфигурацию из `.env` удалять или комментировать при переключении не нужно. После изменения `.env` перезапустите Vite.

### Демо- и локальные данные

- `src/lib/personal-data.js` содержит только безопасный демонабор для репозитория и production-сборки.
- Если существует `.private/personal-data.local.js`, команда `npm run dev` использует его вместо демонабора. Каталог `.private/` игнорируется Git.
- `npm run build` всегда использует безопасный демонабор, даже если приватный файл есть на компьютере.
- Активный набор можно скачать целиком в JSON в разделе «Синхронизация и архив».
- После входа в Firebase этот JSON можно импортировать либо явно загрузить текущие локальные данные кнопкой «Загрузить текущие данные в облако». Загрузка заменяет историю и справочники текущего аккаунта.
- Один только вход в Firebase больше не копирует локальные или демонстрационные данные в пустую облачную базу.

## Firebase

1. Создайте Firebase-проект и Web App, затем создайте базу Cloud Firestore.
2. Скопируйте `.env.example` в `.env`, заполните параметры Web App и установите `VITE_DATA_MODE=firebase`.
3. В Firebase Console откройте **Authentication → Sign-in method**, выберите **Google**, включите провайдер, укажите support email и сохраните настройки.
4. Откройте **Authentication → Settings → Authorized domains** и добавьте домены, с которых выполняется вход:
   - `localhost` для локальной разработки (без протокола и порта);
   - домен GitHub Pages или собственный production-домен.
5. Опубликуйте правила доступа Firestore:

```bash
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules
```

### Где настраиваются разрешения

- **Authentication → Sign-in method** разрешает сам способ входа через Google. Ошибка `auth/operation-not-allowed` означает, что Google provider не включён.
- **Authentication → Settings → Authorized domains** определяет, с каких сайтов можно начинать вход. Ошибка `auth/unauthorized-domain` означает, что текущего hostname нет в этом списке.
- [`firestore.rules`](firestore.rules) определяет доступ вошедшего пользователя к данным. Сейчас `users/{uid}/...` доступны только владельцу с тем же `uid`. Публичную выписку может создать и изменить только владелец; прочитать её до истечения срока может любой, у кого есть секретная ссылка.
- **Google Cloud IAM** управляет администраторами самого Firebase/Google Cloud проекта. Обычным пользователям веб-приложения роли IAM выдавать не нужно.

Правила из репозитория не применяются автоматически при обычной сборке: их нужно отдельно развернуть указанной выше командой. Развёртывание перезаписывает активные правила проекта, поэтому изменения следует сначала проверить в Emulator Suite.

После этого приложение включает обязательный вход через Google, offline-кэш Firestore, синхронизацию между устройствами и временные публичные ссылки. Для GitHub Pages значения Firebase добавляются в GitHub Actions Secrets; workflow деплоя уже устанавливает `VITE_DATA_MODE=firebase`.

## Структура исходников

```text
src/
  App.svelte                 состояние приложения и выбор экранов
  components/
    common/                  переиспользуемые UI-элементы
    layout/                  боковая панель, верхняя и мобильная навигация
    pages/                   обзор, история, эпизоды и отчёты
    modals/                  формы и карточки поверх страниц
    screens/                 авторизация и публичная выписка
  styles/
    main.scss                единая точка компиляции Sass
    _tokens.scss             дизайн-токены и CSS variables
    _base.scss               reset и базовая типографика
    _layout.scss             основной каркас и навигация
    _common.scss             общие UI-компоненты
    _dashboard.scss          обзор и одонтограмма
    _history.scss            хронология лечения
    _episodes.scss           эпизоды лечения
    _reports.scss            отчёты и таблицы
    _modals.scss             общая оболочка модальных окон
    _forms.scss              формы добавления и редактирования
    _drawer.scss             карточка конкретного зуба
    _sharing.scss            экспорт, sharing и синхронизация
    _screens.scss            авторизация и публичная выписка
    _responsive.scss         breakpoints и печать
  lib/
    dental-data.js           справочники интерфейса и UI-конфигурация
    personal-data.js         безопасный демонабор для репозитория
    dental-utils.js          форматирование и производные данные
    firebase.js              авторизация, синхронизация и временные ссылки
```

Vite компилирует `main.scss` через Dart Sass автоматически при `npm run dev` и `npm run build`.

Актуальная структура визитов, записей по зубам, справочников и вложений описана в [`docs/data-model.md`](docs/data-model.md).
