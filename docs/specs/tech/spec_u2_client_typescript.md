# U2 — Спецификация TypeScript-клиента

Версия: 1.0 (для ИИ-агентов)

Данный документ описывает технические детали реализации основного клиента U2 на TypeScript для браузера.

**Цель:** предоставить ИИ-агентам полное описание архитектуры, технологий и подходов для разработки браузерного клиента игры U2.

------

## 1. Обзор

TypeScript-клиент является основной платформой для игры U2. Он работает в браузере и обеспечивает:

- Визуализацию игрового мира (2D/3D).
- Интерфейс управления кораблём.
- Клиентское предсказание для плавного геймплея.
- Сетевое взаимодействие с авторитарным сервером.

**Ключевые принципы:**

1. Минимальные требования к пользователю (работает в браузере).
2. Переиспользование общей логики с сервером (через TypeScript-порт или WASM).
3. Использование стандартных библиотек и инструментов.

------

## 2. Технологический стек

### 2.1. Основные технологии

| Компонент          | Технология          | Назначение                                       |
| ------------------ | ------------------- | ------------------------------------------------ |
| Язык               | TypeScript          | Типобезопасная разработка                        |
| Сборщик            | Vite                | Быстрая разработка и оптимизированная сборка     |
| 3D-рендер          | Three.js            | WebGL-рендеринг 3D-сцены                         |
| 2D-рендер          | Canvas 2D API       | HUD, радары, отладочная информация               |
| Сетевой транспорт  | WebSocket           | Двусторонняя связь с сервером                    |
| Сериализация       | Protobuf.js         | Эффективная сериализация сообщений               |
| Физика (shared)    | TypeScript или WASM | Клиентское предсказание с общей логикой          |

### 2.2. Дополнительные библиотеки

- **Тестирование:** Vitest (модульные и интеграционные тесты).
- **Линтинг:** ESLint с TypeScript-правилами.
- **Форматирование:** Prettier (опционально).

------

## 3. Архитектура клиента

### 3.1. Основные модули

```
src/
├── core/           # Ядро клиента
│   ├── GameLoop.ts      # Главный игровой цикл
│   ├── InputManager.ts  # Обработка ввода
│   └── StateManager.ts  # Управление состоянием
├── network/        # Сетевое взаимодействие
│   ├── WebSocketClient.ts  # WebSocket-клиент
│   ├── ProtobufCodec.ts    # Кодирование/декодирование Protobuf
│   └── MessageHandler.ts   # Обработка входящих сообщений
├── physics/        # Физика и предсказание
│   ├── ShipPhysics.ts      # Физика корабля
│   ├── Prediction.ts       # Клиентское предсказание
│   └── Reconciliation.ts   # Сверка с сервером
├── render/         # Отрисовка
│   ├── ThreeRenderer.ts    # 3D-рендер через Three.js
│   ├── HudRenderer.ts      # HUD на Canvas 2D
│   └── Camera.ts           # Управление камерой
├── entities/       # Игровые сущности
│   ├── Ship.ts             # Корабль игрока
│   ├── Projectile.ts       # Снаряды
│   └── Location.ts         # Игровая локация
└── shared/         # Общий код (порт с сервера)
    ├── Vector2.ts          # 2D-векторы
    ├── ShipState.ts        # Структуры состояния
    └── Constants.ts        # Константы
```

### 3.2. Главный игровой цикл

Клиент использует фиксированный таймстеп для физики и переменную частоту кадров для рендера:

1. **Обработка ввода** — чтение клавиатуры, мыши, геймпада.
2. **Сетевой обмен** — получение снимков состояния от сервера, отправка команд управления.
3. **Физика и предсказание** — обновление локального состояния с фиксированным шагом (например, 50 Гц).
4. **Reconciliation** — сверка предсказанного состояния с авторитарным состоянием сервера.
5. **Рендер** — отрисовка интерполированного состояния (60+ FPS).

------

## 4. 3D-рендеринг с Three.js

### 4.1. Основы

Three.js предоставляет высокоуровневый API для работы с WebGL:

- **Scene** — контейнер для всех объектов.
- **Camera** — точка обзора (PerspectiveCamera для 3D-вида).
- **Renderer** — отрисовка сцены в Canvas.
- **Mesh** — 3D-объекты (геометрия + материал).

### 4.2. Визуализация космоса

**Фон:**

- Звёздное небо (Skybox или шейдер с процедурными звёздами).
- Планеты, астероиды (low-poly модели или билборды).

**Корабли:**

- Простые 3D-модели (начать с примитивов: Box, Cone).
- Ориентация корабля отражается через `rotation` объекта Mesh.
- Эффекты двигателей (Particle systems или Trail renderer).

**Снаряды и лучи:**

- Line segments для трассеров.
- Billboard спрайты для вспышек попаданий.

### 4.3. Камера

Камера следует за кораблём игрока:

- **Позиция:** смещена выше и позади корабля (вид «сверху с перспективой»).
- **Поворот:** плавно следует за направлением корабля (с инерцией).
- **Зум:** регулируется для удобства обзора (от 5 до 20 км видимости).

------

## 5. Сетевой протокол и Protobuf

### 5.1. WebSocket

Клиент устанавливает WebSocket-соединение с сервером:

```typescript
const ws = new WebSocket('ws://localhost:8080/game');

ws.onopen = () => {
  console.log('Connected to server');
};

ws.onmessage = (event) => {
  const data = new Uint8Array(event.data);
  // Декодирование Protobuf
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from server');
};
```

### 5.2. Protobuf.js

Protobuf-схемы описывают структуру сообщений (клиент ↔ сервер):

**Пример схемы (`messages.proto`):**

```protobuf
syntax = "proto3";

message ClientInput {
  uint64 sequence = 1;
  float thrust = 2;
  float rotation = 3;
  bool fire = 4;
}

message ServerSnapshot {
  uint64 tick = 1;
  repeated ShipState ships = 2;
}

message ShipState {
  uint32 id = 1;
  float x = 2;
  float y = 3;
  float rotation = 4;
  float velocity_x = 5;
  float velocity_y = 6;
}
```

**Использование в TypeScript:**

```typescript
import { ClientInput, ServerSnapshot } from './generated/messages';

// Кодирование
const input = ClientInput.create({
  sequence: 123,
  thrust: 0.8,
  rotation: 1.5,
  fire: true
});
const buffer = ClientInput.encode(input).finish();
ws.send(buffer);

// Декодирование
ws.onmessage = (event) => {
  const snapshot = ServerSnapshot.decode(new Uint8Array(event.data));
  console.log('Received tick:', snapshot.tick);
};
```

------

## 6. Клиентское предсказание и Reconciliation

### 6.1. Проблема задержки

Сетевая задержка (ping 50-100 мс) делает прямое управление неотзывчивым. Клиентское предсказание решает эту проблему:

1. Клиент мгновенно применяет ввод игрока к локальному состоянию.
2. Клиент отправляет ввод на сервер.
3. Сервер обрабатывает ввод и возвращает авторитарное состояние.
4. Клиент сверяет локальное состояние с серверным (reconciliation).

### 6.2. Реализация

**Хранение истории:**

Клиент сохраняет историю команд управления и локальных состояний:

```typescript
interface InputRecord {
  sequence: number;
  thrust: number;
  rotation: number;
  timestamp: number;
}

const inputHistory: InputRecord[] = [];
```

**Отправка ввода:**

```typescript
function sendInput(thrust: number, rotation: number) {
  const input: InputRecord = {
    sequence: nextSequence++,
    thrust,
    rotation,
    timestamp: Date.now()
  };
  
  inputHistory.push(input);
  
  // Отправка на сервер
  const message = ClientInput.create(input);
  ws.send(ClientInput.encode(message).finish());
  
  // Локальное применение
  applyInputToShip(myShip, input);
}
```

**Reconciliation:**

Когда приходит снимок состояния от сервера:

```typescript
function onServerSnapshot(snapshot: ServerSnapshot) {
  const serverShip = snapshot.ships.find(s => s.id === myShipId);
  
  // Найти последний подтверждённый ввод
  const lastAck = snapshot.lastAcknowledgedInput;
  
  // Удалить старые команды из истории
  inputHistory = inputHistory.filter(i => i.sequence > lastAck);
  
  // Установить состояние корабля из серверного снимка
  myShip.setState(serverShip);
  
  // Переприменить неподтверждённые команды
  for (const input of inputHistory) {
    applyInputToShip(myShip, input);
  }
}
```

### 6.3. Shared-физика

Для корректного предсказания клиент должен использовать ту же физику, что и сервер:

**Вариант 1: TypeScript-порт**

- Вручную портировать C#-код физики на TypeScript.
- Проще в отладке, но требует синхронизации изменений.

**Вариант 2: WASM**

- Скомпилировать C#-библиотеку в WASM (через Blazor AOT или аналоги).
- Полная идентичность с сервером, но сложнее в настройке.

**Рекомендация:** начать с TypeScript-порта для простоты, перейти на WASM при необходимости.

------

## 7. HUD и 2D-интерфейс

### 7.1. Canvas 2D API

HUD рисуется на отдельном Canvas-элементе поверх 3D-рендера:

```html
<canvas id="webgl-canvas"></canvas>
<canvas id="hud-canvas"></canvas>
```

### 7.2. Элементы HUD

**Скорость:**

```typescript
ctx.fillStyle = 'white';
ctx.font = '16px monospace';
ctx.fillText(`Speed: ${Math.round(shipSpeed)} m/s`, 10, 30);
```

**Радар:**

Мини-карта с отображением ближайших объектов (кораблей, астероидов):

```typescript
function drawRadar(ctx: CanvasRenderingContext2D, ships: Ship[]) {
  const radarX = canvas.width - 150;
  const radarY = 50;
  const radarSize = 100;
  
  // Фон радара
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(radarX, radarY, radarSize, radarSize);
  
  // Корабли
  for (const ship of ships) {
    const relX = ship.x - myShip.x;
    const relY = ship.y - myShip.y;
    
    const dotX = radarX + radarSize / 2 + relX / 100;
    const dotY = radarY + radarSize / 2 + relY / 100;
    
    ctx.fillStyle = ship.isEnemy ? 'red' : 'green';
    ctx.fillRect(dotX - 2, dotY - 2, 4, 4);
  }
}
```

**Прицел:**

Простой перекрестие в центре экрана:

```typescript
ctx.strokeStyle = 'lime';
ctx.lineWidth = 2;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

ctx.beginPath();
ctx.moveTo(centerX - 10, centerY);
ctx.lineTo(centerX + 10, centerY);
ctx.moveTo(centerX, centerY - 10);
ctx.lineTo(centerX, centerY + 10);
ctx.stroke();
```

------

## 8. Оптимизация и производительность

### 8.1. Рендер

- **Frustum Culling:** не рисовать объекты вне поля зрения (встроено в Three.js).
- **LOD (Level of Detail):** упрощённые модели для дальних объектов.
- **Object Pooling:** переиспользовать объекты (снаряды, эффекты) вместо создания новых.

### 8.2. Сеть

- **Delta Compression:** отправлять только изменения состояния (не полные снимки).
- **Приоритизация:** важные объекты (ближайшие корабли) обновляются чаще.
- **Интерполяция:** плавный переход между снимками состояния.

### 8.3. Физика

- **Фиксированный таймстеп:** физика обновляется с постоянной частотой (50 Гц), независимо от FPS.
- **Spatial Partitioning:** для проверки коллизий (если потребуется).

------

## 9. Тестирование

### 9.1. Модульные тесты (Vitest)

Тестирование отдельных модулей без браузерного окружения:

```typescript
import { describe, it, expect } from 'vitest';
import { Vector2 } from '../src/shared/Vector2';

describe('Vector2', () => {
  it('should add two vectors', () => {
    const v1 = new Vector2(1, 2);
    const v2 = new Vector2(3, 4);
    const result = v1.add(v2);
    
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });
});
```

### 9.2. Интеграционные тесты

Тестирование взаимодействия модулей (например, сетевого обмена с mock-сервером):

```typescript
import { describe, it, expect, vi } from 'vitest';
import { WebSocketClient } from '../src/network/WebSocketClient';

describe('WebSocketClient', () => {
  it('should connect to server', async () => {
    const mockWs = vi.fn();
    const client = new WebSocketClient('ws://localhost:8080', mockWs);
    
    await client.connect();
    
    expect(client.isConnected()).toBe(true);
  });
});
```

------

## 10. Развёртывание

### 10.1. Сборка продакшн-версии

```bash
npm run build
```

Vite создаёт оптимизированный бандл в директории `dist/`:

- Минификация кода.
- Tree-shaking (удаление неиспользуемого кода).
- Code splitting (разделение на чанки для быстрой загрузки).

### 10.2. Хостинг

Статические файлы из `dist/` можно разместить на:

- **GitHub Pages** (для быстрого прототипа).
- **Vercel / Netlify** (для продакшена с CI/CD).
- **Nginx / Apache** (собственный сервер).

------

## 11. Будущие улучшения

**В следующих версиях планируется:**

- Поддержка мобильных устройств (touch-управление).
- Продвинутая графика (шейдеры, post-processing эффекты).
- Звуковое сопровождение (Web Audio API).
- Многопользовательский чат (WebRTC для голоса).
- Прогрессивное веб-приложение (PWA) для установки на рабочий стол.

------

## 12. Ссылки и ресурсы

- **Three.js документация:** <https://threejs.org/docs/>
- **Protobuf.js:** <https://github.com/protobufjs/protobuf.js>
- **Vite документация:** <https://vitejs.dev/>
- **Vitest:** <https://vitest.dev/>
- **Руководство по клиентскому предсказанию:** <https://www.gabrielgambetta.com/client-server-game-architecture.html>

------

## 13. Заключение

TypeScript-клиент обеспечивает максимальную доступность игры U2, работая в любом современном браузере. Использование Three.js для 3D-рендера, Protobuf для сети и shared-физики для предсказания даёт надёжную основу для разработки.

Следуя данной спецификации, ИИ-агенты могут создать полнофункциональный клиент, готовый к интеграции с авторитарным сервером.
