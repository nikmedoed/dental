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

Без конфигурации Firebase приложение работает в локальном режиме: данные сохраняются в `localStorage` и полностью экспортируются/импортируются в JSON через раздел «Синхронизация».

## Firebase

1. Создайте Firebase-проект и включите Google Sign-In и Cloud Firestore.
2. Скопируйте `.env.example` в `.env` и заполните параметры Web App.
3. Опубликуйте `firestore.rules` командой Firebase CLI.

После этого приложение включает обязательный вход через Google, offline-кэш Firestore, синхронизацию между устройствами и временные публичные ссылки. Для GitHub Pages те же значения добавляются в GitHub Actions Secrets; workflow деплоя уже находится в `.github/workflows/deploy.yml`.

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
    dental-data.js           справочники, тестовые данные и UI-конфигурация
    dental-utils.js          форматирование и производные данные
    firebase.js              авторизация, синхронизация и временные ссылки
```

Vite компилирует `main.scss` через Dart Sass автоматически при `npm run dev` и `npm run build`.
