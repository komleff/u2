# Инструкции Copilot для U2 Flight Test Sandbox

## Обзор проекта

U2 (Universe Unlimited) — браузерный многопользовательский космический симулятор с **релятивистской физикой** (замедленная скорость света) и предсказанием на стороне клиента. Проект использует **C# .NET backend** (Entitas ECS, UDP networking) и **TypeScript/Vite frontend** (WebSocket, canvas rendering).

**Текущий Milestone:** M2.3 Client-Side Prediction & Reconciliation (завершён)  
**Следующий Milestone:** M3.0 Flight Assist (режимы FA:ON/OFF)

## Критические архитектурные принципы

### 1. Общая конфигурация физики (`src/shared/physics.json`)

Все физические параметры ДОЛЖНЫ быть синхронизированы между C# сервером и TypeScript клиентом:

- **Маппинг C#:** `SharedPhysics.cs` загружает `physics.json` и конвертирует в `ShipConfig`
- **Маппинг TS:** `config/physics.ts` импортирует `physics.json` с fallback значениями
- **Правило:** При добавлении физических параметров обновляй ОДНОВРЕМЕННО маппинг в C# и TS + добавляй fallback в TS

Пример паттерна:
```typescript
// TypeScript client - ВСЕГДА включай fallback для обратной совместимости
pitchAccel: degToRad(sharedPhysics.physics.pitch_accel_dps2 ?? 180.0)
```

### 2. Сетевая архитектура (M2.2/M2.3)

**Транспортный уровень:**
- UDP сервер на порту 7777 (C# backend)
- WebSocket relay на порту 8080 (совместимость с браузером)
- Паттерн виртуальных endpoint'ов: WebSocket клиенты получают `127.0.0.1:50000+` для унифицированной обработки

**Тайминг игрового цикла (КРИТИЧНО):**
- Physics tick: 30 Hz (фиксированный timestep, детерминированный)
- Broadcast снапшотов: 15 Hz (оптимизация bandwidth)
- Предсказание клиента: 60 Hz (плавный рендеринг)

**Ключевые классы:**
- `NetworkGameLoop.cs`: Раздельные интервалы physics/snapshot с механизмом catch-up
- `TransportLayer.ts`: Обработка WebSocket на клиенте с порядковыми номерами
- `PredictionEngine.ts`: Предсказание и согласование на стороне клиента

### 3. Поток предсказания на стороне клиента

1. **Input:** Клиент применяет ввод локально немедленно (задержка 0ms)
2. **Buffer:** Ввод сохраняется с порядковым номером в истории
3. **Send:** Ввод отправляется на сервер с частотой 30 Hz
4. **Reconciliation:** При получении снапшота сервера клиент воспроизводит вводы, если позиция расходится

**Требования к тестированию:** Все изменения сети ДОЛЖНЫ пройти интеграционные тесты в `tests/integration/latency.spec.ts`:
- RTT 50ms: медианная ошибка предсказания < 1.6м
- RTT 200ms: время конвергенции < 2с
- 5с тест стабильности с RTT 200ms

## Рабочие процессы разработки

### Запуск проекта

**Тестирование мультиплеера (оба сервера):**
```powershell
npm run start:servers
# Запускает C# UDP сервер (7777), WebSocket relay (8080), Vite клиент (5173)
```

**Только клиент:**
```powershell
npm run dev  # Vite dev сервер на порту 5173
```

**Только сервер:**
```powershell
dotnet run --project src/server/U2.Server.csproj -- --network
```

### Команды тестирования

**Тесты C# backend (201 тест):**
```powershell
dotnet test --configuration Release
```

**Unit-тесты TypeScript:**
```powershell
npm test --workspace=src/clients/testbed/chatgpt-vite
```

**Интеграционные тесты (требуется сервер):**
```powershell
$env:U2_RUN_INTEGRATION = '1'
npm test --workspace=src/clients/testbed/chatgpt-vite
```

**Валидация синхронизации физики:**
```powershell
npm test --workspace=src/clients/testbed/chatgpt-vite -- tests/physics-sync.spec.ts
```

### Качество кода

**Линтинг (политика нулевых warning'ов):**
```powershell
npm run lint
```

**Покрытие:**
```powershell
npm run coverage --workspace=src/clients/testbed/chatgpt-vite
```

## Паттерны организации файлов

### Backend (C# .NET 8.0)

```
src/
├── server/          # Точка входа, NetworkGameLoop, UDP/WebSocket
├── shared/          # Общее между server/tests (ECS, физика, proto)
│   ├── Config/      # SharedPhysics.cs (загружает physics.json)
│   ├── ECS/         # GameWorld, PhysicsSystem (Entitas)
│   ├── Proto/       # ecs.proto (Protobuf схема)
│   ├── physics.json # ЕДИНСТВЕННЫЙ ИСТОЧНИК ИСТИНЫ для параметров физики
│   └── Tests/       # xUnit тесты (201 тест, M0-M2.3)
└── systems/         # Entitas системы (будущее расширение)
```

### Frontend (TypeScript/Vite)

```
src/clients/testbed/chatgpt-vite/
├── client/          # GameClient, ввод, рендеринг
│   ├── net/         # TransportLayer (WebSocket)
│   ├── input/       # InputManager (WASD, QE yaw)
│   └── render/      # SnapshotRenderer (canvas)
├── network/         # PredictionEngine, NetworkClient
├── config/          # physics.ts (импортирует ../../../shared/physics.json)
├── tests/
│   ├── integration/ # latency.spec.ts (M2.3 DoD тесты)
│   └── unit/        # Компонентные тесты
└── vite.config.ts
```

## Protobuf протокол

**Схема:** `src/shared/Proto/ecs.proto`

**Генерация TypeScript биндингов:**
```powershell
npm run proto:generate
```

Выходные файлы: `src/clients/testbed/chatgpt-vite/network/proto/ecs.{js,d.ts}`

**Ключевые сообщения:**
- `PlayerInputProto`: Вводы клиента с порядковым номером
- `EntitySnapshotProto`: Авторитетное состояние сущности от сервера
- `WorldSnapshotProto`: Полное состояние мира на тике сервера

## Реализация физики

### Релятивистская математика

Скорость света в зависимости от локации (`c'`):
- Зоны боя: 5,000 м/с (по умолчанию)
- γ-фактор: `1 / sqrt(1 - v²/c'²)`
- Применяется в `PhysicsSystem.cs` и клиентском `PredictionEngine.ts`

**Правило:** Физика на клиенте ДОЛЖНА точно соответствовать серверной для детерминированного предсказания.

### Режимы Flight Assist (M3.0 - будущее)

- **FA:OFF:** Прямое управление двигателями (уже реализовано в M2.3)
- **FA:ON:** Автоматическая стабилизация (запланировано M3.0)
- Клавиша переключения: `Z` (будущее)

## Структура Milestone'ов

Проект следует строгой разработке на основе milestone'ов:

- **M0.x:** Фундамент (репозиторий, математика, ECS)
- **M1:** Релятивистская физика ✅
- **M2.1:** Protobuf протокол (190/190 тестов) ✅
- **M2.2:** UDP сервер ✅
- **M2.3:** Предсказание на стороне клиента ✅ (текущий PR)
- **M3.0:** Flight Assist ON/OFF (следующий)

Каждый milestone имеет:
- `MX.X-PLAN.md`: Детальный план реализации
- `MX.X-STATUS.md`: Отслеживание прогресса
- `MX.X-README.md`: Финальное резюме

## Общие паттерны

### Добавление новых параметров физики

1. Добавь в `src/shared/physics.json`
2. Обнови маппинг в `SharedPhysics.cs`
3. Обнови `config/physics.ts` с fallback
4. Добавь тест в `SharedPhysicsTests.cs`
5. Выполни `npm run test` и `dotnet test`

### Изменение сетевого протокола

1. Обнови `ecs.proto`
2. Выполни `npm run proto:generate`
3. Обнови сериализацию C# в `MessageProcessor.cs`
4. Обнови десериализацию TS в `NetworkClient.ts`
5. Запусти интеграционные тесты с `U2_RUN_INTEGRATION=1`

### Написание интеграционных тестов

Используй `LatencySimulator` для реалистичных сетевых условий:

```typescript
const simulator = new LatencySimulator(client, 50); // 50ms RTT
simulator.enable();
// ... тестирование точности предсказания на клиенте
```

**Предпочитай медиану среднему** для метрик ошибок (устойчивость к выбросам).

## Структура документации

- `README.md`: Быстрый старт, тестирование, индекс документации
- `docs/specs/tech/`: Архитектура, технологический стек, спецификации кораблей
- `docs/specs/gameplay/`: Формулы боя, Definition of Fun
- `ROADMAP.md`: Визуальный timeline, milestone'ы
- `SUMMARY.md`: Исполнительное резюме, следующие шаги

**Соглашение об именовании:** `spec_<область>_<версия>_<вариант>.md`

## Ключевые ограничения

1. **Политика нулевых warning'ов:** Весь код должен проходить линтеры без предупреждений
2. **Обратная совместимость:** Все изменения протокола должны поддерживать старых клиентов (fallbacks)
3. **Детерминизм:** Физика клиента ДОЛЖНА давать идентичные результаты серверу
4. **Фиксированный timestep:** Физика сервера всегда работает на 30 Hz, никогда переменный dt
5. **Покрытие тестами:** Изменения физики/сети требуют интеграционных тестов

## Переменные окружения

- `VITE_SERVER_URL`: Переопределение WebSocket endpoint (по умолчанию: `ws://localhost:8080/`)
- `U2_RUN_INTEGRATION`: Включение интеграционных тестов в CI/локально

## Устранение неполадок

**Сервер логирует "client already accepted":**
- Ожидаемо для механизма повторных попыток при потере UDP пакетов
- Проверь логику retry в `MessageProcessor.cs`

**Предсказание клиента расходится:**
- Проверь синхронизацию `physics.json` между C#/TS
- Проверь отслеживание порядковых номеров в reconciliation
- Запусти `tests/physics-sync.spec.ts`

**Нестабильные тесты:**
- Используй медиану вместо среднего для метрик ошибок
- Увеличь timeout для сетевых операций
- Проверь логику physics catch-up в `NetworkGameLoop`
