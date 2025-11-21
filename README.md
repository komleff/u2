# U2 Flight Test Sandbox (Universe Unlimited)

> 📖 **[English](#getting-started)** | **[Русский](#начало-работы-russian)**

This repository contains a canvas‑based flight systems sandbox for the **Universe Unlimited (U2)** project.  
It is used to prototype and validate flight modes, physics constraints, HUD concepts and related gameplay for versions around **U2 v0.8.x**.

- App name: `u2-flighttest`  
- Runtime: browser (Vite + TypeScript)  
- Docs root: `docs/` (see below)

---

## Project goals

- Experiment with 2D representations of U2’s flight model (Coupled/Decoupled, FA:ON/OFF, g‑limits, etc.).
- Provide a fast sandbox for tuning ship tech specs and combat formulas.
- Serve as a living reference implementation for the design specs in `docs/specs`.

Game‑design and technical specifications live in Markdown and are treated as first‑class artifacts.

---

## Getting started

### Prerequisites

- **Node.js ≥ 18**
- **npm** (comes with Node)

### Installation

```bash
npm install
```

### Online testing (automated server startup)

For online multiplayer testing, use the automated server startup script:

```bash
npm run start:servers
```

This script automatically starts both:
- **C# backend server** (UDP on port 7777, WebSocket on port 8080)
- **Vite development client** (HTTP on port 5173)

On Windows, use:
```batch
scripts\start-servers.bat
```

See `scripts/README.md` for detailed information about the automation scripts.

### Docker (server + Vite)

��� ������:
- ��������� C# backend (UDP 7777, WebSocket 8080) � Vite dev server (http://localhost:5173/).
- ������ Compose ������ ����� �� ws://server:8080/ (��. VITE_SERVER_URL).

������� ����� ����� ��������:
`ash
./scripts/start-docker.sh       # macOS/Linux
.\\scripts\\start-docker.ps1      # Windows PowerShell
`

���� ������� �������:
`ash
docker compose up            # ���������
docker compose logs -f       # �������� ����
docker compose down          # ���������� � ������ ����������
`

�������� ��������:
1) ����� ������� ������� � ������� �� http://localhost:5173/.
2) ���������, ��� WebSocket �������� �� ws://localhost:8080/ (Network ���).
3) ���� ����� ������, ��������� �������� � docker-compose.yml (��������, 5174:5173).

������� �����:
- ������ uild ��������� SDK/Node � ����� ������ �����.
- ������: u2/server, u2/client (��. docker-compose.yml).
- ������ �� ������ � ������/volume: docker compose down --remove-orphans --volumes.

### Development server (client only)

```bash
npm run dev
```

This runs Vite’s dev server. See the terminal output for the local URL (typically `http://localhost:5173/`).

### Production build

```bash
npm run build
```

Build artifacts are emitted to `dist/`. You can preview the built app with:

```bash
npm run preview
```

---

### Client preview (M2.3 Stage 1)

- Run `npm run dev` to start the Vite client.
- Default server endpoint: `ws://localhost:8080/` (override with `VITE_SERVER_URL`).
- Controls: `WASD` thrusters, `Q`/`E` yaw, `O` toggles link, `F3` toggles HUD overlay.
- Theme: hand-drawn space opera; snapshots from the test server are rendered on the new canvas client.

---

## Testing and quality

### Linting

```bash
npm run lint
```

Runs ESLint on the TypeScript codebase with zero‑warning policy.

### Unit tests

```bash
npm test         # single run
npm run test:watch
npm run coverage # with coverage report
```

Tests are implemented with **Vitest** and run in a jsdom environment where needed.

---

## Documentation

All project documentation lives in the `docs/` directory.

- High‑level docs overview: `docs/README.md`
- Documentation index / navigation hub: `docs/INDEX.md`
- Specs catalog: `docs/specs/README.md`

Key areas:

- **Game design (GDD):** `docs/gdd/`
- **Specs (flight modes, architecture, tech stack, Definition of Fun, combat formulas):**  
  - `docs/specs/spec_pilot_assist_coupled.md`  
  - `docs/specs/spec_flight_decoupled.md`  
  - `docs/specs/gameplay/` — dev‑plans, combat formulas, Definition of Fun for v0.8.x  
  - `docs/specs/tech/` — architecture, tech stack, ship tech specs, visual style  
  - `docs/specs/audit/` — documentation audit reports and action plans
- **PvE design and analysis:** `docs/pve/`
- **Guides and practices:** `docs/guides/`
- **Archive and converted legacy docs:** `docs/archive/`, `docs/_converted/`

For naming and structure conventions, see `docs/STYLE.md`.

---

## Documentation tooling

This repo includes simple scripts to help normalize and convert documentation:

- Normalize Markdown (line endings, spaces, etc.):

  ```bash
  npm run docs:normalize
  ```

- Convert external documents (PDF/DOCX → Markdown) into `docs/_converted/`:

  ```bash
  npm run docs:convert
  ```

These scripts are primarily for maintainers of the documentation set.

---

## Contributing

1. Keep changes aligned with the existing specs in `docs/specs/`.  
2. When altering behavior that is documented, update the corresponding spec and, if applicable, its `Changelog`.  
3. Run `npm run lint` and `npm test` before submitting changes.

Bug reports and feature requests are welcome via GitHub issues.

---

## License

This project is licensed under the **MIT License**.  
See the `LICENSE` file if present, or the license section on the GitHub repository page.

---

Build prepared with Codex (GPT-5).

---

# Начало работы (Russian)

## 🎯 О проекте

Этот репозиторий содержит песочницу для тестирования систем полета проекта **Universe Unlimited (U2)**.  
Используется для прототипирования и валидации режимов полета, физических ограничений, концепций HUD и связанного геймплея для версий **U2 v0.8.x**.

## 📋 Требования

- **Node.js ≥ 18**
- **npm** (устанавливается вместе с Node.js)
- **.NET 8.0 SDK** (для backend сервера)

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск для онлайн-тестирования

Для запуска обоих серверов (backend + client) одной командой:

```bash
npm run start:servers
```

Или напрямую через скрипт:

```bash
# Linux / macOS
./scripts/start-servers.sh

# Windows
scripts\start-servers.bat
```

Это автоматически:
- ✅ Проверит все зависимости
- ✅ Соберет C# backend сервер
- ✅ Запустит UDP сервер (порт 7777)
- ✅ Запустит WebSocket relay (порт 8080)
- ✅ Запустит Vite client (порт 5173)

**После запуска:**
1. Откройте браузер
2. Перейдите на http://localhost:5173/
3. Начните тестирование!

**Остановка:** Нажмите `Ctrl+C` в терминале.

📖 **[Полная документация по скриптам](./scripts/README.ru.md)**

### 3. Запуск только клиента (для разработки)

```bash
npm run dev
```

Vite dev сервер запустится на http://localhost:5173/  
По умолчанию клиент подключается к `ws://localhost:8080/` (можно изменить через `VITE_SERVER_URL`).

### 4. Production сборка

```bash
npm run build
```

Артефакты сборки будут в каталоге `dist/`. Для предпросмотра:

```bash
npm run preview
```

## 🧪 Тестирование

### Линтинг

```bash
npm run lint
```

Запускает ESLint с политикой "zero warnings".

### Юнит-тесты

```bash
npm test              # однократный запуск
npm run test:watch    # watch режим
npm run coverage      # с отчетом покрытия
```

Тесты реализованы на **Vitest** и выполняются в jsdom окружении.

## 📚 Документация

Вся документация проекта находится в каталоге `docs/`.

- Обзор документации: `docs/README.md`
- Навигация: `docs/INDEX.md`
- Каталог спецификаций: `docs/specs/README.md`

### Основные разделы:

- **Game Design (GDD):** `docs/gdd/`
- **Спецификации:**  
  - `docs/specs/spec_pilot_assist_coupled.md` - режим Coupled
  - `docs/specs/spec_flight_decoupled.md` - режим Decoupled
  - `docs/specs/gameplay/` - игровые механики, боевые формулы
  - `docs/specs/tech/` - архитектура, технологии
  - `docs/specs/audit/` - аудиты документации
- **PvE дизайн:** `docs/pve/`
- **Руководства:** `docs/guides/`
- **Архив:** `docs/archive/`, `docs/_converted/`

## 🛠️ Управление документацией

### Нормализация Markdown файлов

```bash
npm run docs:normalize
```

### Конвертация внешних документов (PDF/DOCX → Markdown)

```bash
npm run docs:convert
```

Конвертированные файлы сохраняются в `docs/_converted/`.

## 🎮 Управление в игре

- **WASD** - двигатели
- **Q/E** - поворот (yaw)
- **O** - переключение flight link
- **F3** - переключение HUD оверлея

## 🔧 Устранение неполадок

### Порты заняты

Если появляется ошибка о занятых портах (7777, 8080, 5173):

```bash
# Найти процесс
lsof -i :7777
lsof -i :8080
lsof -i :5173

# Остановить процесс
kill -9 <PID>
```

**Windows:**
```batch
netstat -ano | findstr :7777
taskkill /PID <PID> /F
```

### Backend не запускается

1. Проверьте, что установлен .NET 8.0 SDK:
   ```bash
   dotnet --version
   ```

2. Попробуйте собрать вручную:
   ```bash
   dotnet build U2.sln
   ```

3. Проверьте логи в `logs/backend.log`

### Client не запускается

1. Переустановите зависимости:
   ```bash
   npm install
   ```

2. Проверьте логи в `logs/client.log`

📖 **[Полное руководство по устранению неполадок](./scripts/README.ru.md#устранение-неполадок)**

## 🤝 Внесение изменений

1. Изменения должны соответствовать спецификациям в `docs/specs/`
2. При изменении поведения обновите соответствующую спецификацию и её `Changelog`
3. Запустите `npm run lint` и `npm test` перед отправкой изменений

Сообщения об ошибках и предложения функций приветствуются через GitHub issues.

## 📄 Лицензия

Проект лицензирован под **MIT License**.  
См. файл `LICENSE` или страницу репозитория на GitHub.

## 🔗 Полезные ссылки

- **[Скрипты автоматизации (RU)](./scripts/README.ru.md)** - подробная документация по запуску серверов
- **[Скрипты автоматизации (EN)](./scripts/README.md)** - automation scripts documentation
- **[M2.3 План](./M2.3-PLAN.md)** - план сетевой архитектуры
- **[Дорожная карта](./ROADMAP.md)** - roadmap проекта



