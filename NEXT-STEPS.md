# Следующие шаги по плану разработки U2 v0.8.6

**Дата:** 2025-11-18  
**Статус:** Завершено M2.2 (серверная часть), готовимся к M2.3-M6  
**Источник:** `docs/specs/gameplay/spec_u2_dev_plan_v086_minimal.md`

---

## Исполнительное резюме

**Текущее состояние:**

- ✅ **M0.1-M0.3**: Фундамент (репозиторий, математика, ECS) — ЗАВЕРШЕНО
- ✅ **M1**: Релятивистская физика и офлайн симуляция — ЗАВЕРШЕНО
- ✅ **M2.1**: Protobuf протокол (190/190 тестов) — ЗАВЕРШЕНО
- ⚠️ **M2.2**: UDP транспорт — ЧАСТИЧНО (только сервер)

**Критический блокер:**

- ❌ **Client-side prediction и reconciliation** — требует TypeScript/JavaScript клиента

**Рекомендуемые следующие шаги:**

1. **M2.3** (ПРИОРИТЕТ 🔴): Клиентская часть сети (prediction + reconciliation)
2. **M3**: Flight Assist ON/OFF + Stabilized ассистент
3. **M4**: Минимальный HUD
4. **M5**: Заглушки (урон, боты)
5. **M6**: Оптимизация и платформы

---

## M2.3: Client-Side Prediction & Reconciliation (Следующий этап)

### Цель

Завершить сетевую инфраструктуру, реализовав клиентскую часть для responsive multiplayer gameplay.

### Приоритет

🔴 **КРИТИЧНО** — блокирует DoD verification для M2.2 и дальнейшую разработку онлайн-геймплея.

### Требования ТЗ

Из `spec_u2_dev_plan_v086_minimal.md` (строки 391-407):

- ✅ UDP-транспорт сервер↔клиенты (ГОТОВО на сервере)
- ❌ **Client-side prediction** (локальная физика)
- ❌ **Reconciliation (replay)** (коррекция расхождений)
- ⚠️ Фиксированные частоты: ~30 Hz команды (не контролируется)
- ✅ Фиксированные частоты: ~15 Hz снапшоты (ГОТОВО на сервере)
- ❌ **DoD**: 2 игрока онлайн «нормально»
- ❌ **DoD**: RTT 50 ms всё гладко
- ❌ **DoD**: RTT 200 ms стабилизация 1-2 сек

### Архитектура клиента

#### 1. TypeScript/JavaScript Client (Browser-Based)

**Технологический стек:**

```typescript
// Framework
- Vite + TypeScript (уже используется)
- Canvas 2D / WebGL для рендеринга

// Network
- WebSocket (для надёжности handshake)
- WebRTC Data Channel (опционально, для лучшей производительности)

// Protobuf
- protobuf.js (JavaScript implementation)

// Physics
- Портированная логика из C# (GameWorld.Execute)
```

**Структура проекта:**

```
src/
  client/
    network/
      UdpClient.ts          // WebSocket wrapper
      MessageHandler.ts     // Protobuf routing
      ConnectionManager.ts  // Connection state
    
    physics/
      LocalPhysics.ts       // Client-side physics copy
      PredictionManager.ts  // Input buffering + prediction
      ReconciliationManager.ts  // Server sync + replay
    
    rendering/
      Renderer.ts           // Canvas 2D rendering
      Camera.ts             // Viewport management
    
    input/
      InputManager.ts       // WASD/Mouse controls
      
    game/
      GameClient.ts         // Main client loop
```

#### 2. Client-Side Prediction

**Принцип работы:**

```typescript
class PredictionManager {
  private inputHistory: PlayerInput[] = [];
  private localEntity: GameEntity;
  private localPhysics: LocalPhysics;
  private sequenceNumber: number = 0;
  
  // Обработка локального input
  handleLocalInput(input: ControlState): void {
    // 1. Сохранить input в историю с sequence number
    const playerInput: PlayerInput = {
      sequenceNumber: this.sequenceNumber++,
      timestampMs: Date.now(),
      controlState: input,
      flightAssist: this.localEntity.flightAssist
    };
    this.inputHistory.push(playerInput);
    
    // 2. Применить input локально (немедленный отклик)
    this.applyInputLocally(playerInput);
    
    // 3. Отправить на сервер
    this.sendToServer(playerInput);
    
    // 4. Выполнить локальный physics tick
    this.localPhysics.execute(deltaTime);
  }
  
  private applyInputLocally(input: PlayerInput): void {
    // Копия серверной логики MessageProcessor.ApplyPlayerInput
    this.localEntity.controlState = input.controlState;
    this.localEntity.flightAssist = input.flightAssist;
  }
}
```

**Ключевые компоненты:**

- **Input History Buffer**: Хранит последние N inputs (обычно ~60-120, 2-4 секунды @ 30 Hz)
- **Local Physics Simulation**: Точная копия серверной PhysicsSystem
- **Sequence Numbers**: Монотонно растущие ID для каждого input

#### 3. Reconciliation (Replay)

**Принцип работы:**

```typescript
class ReconciliationManager {
  private predictionManager: PredictionManager;
  private localEntity: GameEntity;
  private readonly POSITION_TOLERANCE = 0.5; // метры
  
  reconcileWithServer(serverSnapshot: EntitySnapshot): void {
    // 1. Найти расхождение между локальной prediction и server state
    const localPos = this.localEntity.position;
    const serverPos = serverSnapshot.position;
    const divergence = Vector2.distance(localPos, serverPos);
    
    // 2. Если расхождение в пределах допуска — игнорируем (небольшое отклонение)
    if (divergence < this.POSITION_TOLERANCE) {
      this.cleanOldInputs(serverSnapshot.lastProcessedInput);
      return;
    }
    
    // 3. Rewind: Откатываемся к серверному состоянию
    this.localEntity.position = serverSnapshot.position;
    this.localEntity.rotation = serverSnapshot.rotation;
    this.localEntity.velocity = serverSnapshot.velocity;
    
    // 4. Replay: Повторно применяем inputs после последнего обработанного сервером
    const inputsToReplay = this.predictionManager.inputHistory.filter(
      input => input.sequenceNumber > serverSnapshot.lastProcessedInput
    );
    
    for (const input of inputsToReplay) {
      this.predictionManager.applyInputLocally(input);
      this.localPhysics.execute(deltaTime);
    }
    
    // 5. Очистка старых inputs
    this.cleanOldInputs(serverSnapshot.lastProcessedInput);
  }
  
  private cleanOldInputs(lastProcessed: number): void {
    // Удаляем inputs, которые сервер уже обработал
    this.predictionManager.inputHistory = 
      this.predictionManager.inputHistory.filter(
        input => input.sequenceNumber > lastProcessed
      );
  }
}
```

**Важные детали:**

- **Tolerance Threshold**: Небольшие расхождения (<0.5м) игнорируются для плавности
- **Replay Physics**: Должна быть **идентична** серверной (детерминизм)
- **Input Cleanup**: Удаляем старые inputs для экономии памяти

#### 4. Контроль частоты 30 Hz Input Rate

**Клиентская сторона:**

```typescript
class InputSender {
  private readonly INPUT_RATE_HZ = 30;
  private readonly INPUT_INTERVAL_MS = 1000 / 30; // 33.33 ms
  private lastSendTime = 0;
  
  start(): void {
    // Фиксированный интервал отправки
    setInterval(() => {
      this.collectAndSendInput();
    }, this.INPUT_INTERVAL_MS);
  }
  
  private collectAndSendInput(): void {
    const input = this.inputManager.getCurrentState();
    this.predictionManager.handleLocalInput(input);
  }
}
```

**Серверная сторона (опционально — защита от спама):**

```csharp
// В MessageProcessor.cs
public class RateLimiter {
  private Dictionary<uint, long> _lastInputTime = new();
  
  public bool ShouldAcceptInput(uint clientId, long nowMs) {
    const long MIN_INTERVAL_MS = 25; // 40 Hz max (защита)
    
    if (_lastInputTime.TryGetValue(clientId, out var lastTime)) {
      if (nowMs - lastTime < MIN_INTERVAL_MS) {
        return false; // Слишком часто
      }
    }
    
    _lastInputTime[clientId] = nowMs;
    return true;
  }
}
```

### Изменения в серверном коде

**1. Добавить lastProcessedInput в EntitySnapshot:**

```protobuf
// В game.proto
message EntitySnapshot {
  uint32 entity_id = 1;
  Vec2 position = 2;
  float rotation = 3;
  Vec2 velocity = 4;
  bool flight_assist = 5;
  uint32 last_processed_input = 6;  // НОВОЕ: для reconciliation
}
```

**2. Сохранять sequence_number в MessageProcessor:**

```csharp
// В MessageProcessor.cs
private void HandlePlayerInput(PlayerInputProto input, IPEndPoint endpoint) {
  // ... существующий код ...
  
  // Сохранить последний обработанный sequence number
  var connection = _connectionManager.GetClient(endpoint);
  if (connection != null) {
    connection.LastProcessedSequence = input.SequenceNumber;
  }
  
  ApplyPlayerInput(connection.EntityId.Value, input);
}
```

**3. Включить lastProcessedInput в WorldSnapshot:**

```csharp
// В NetworkGameLoop.cs
private async Task BroadcastWorldSnapshot() {
  var snapshot = new WorldSnapshotProto { /* ... */ };
  
  foreach (var entity in entities) {
    var entitySnapshot = EntitySerializer.ToSnapshot(entity);
    
    // Найти connection для этого entity и добавить lastProcessedInput
    var connection = _connectionManager.GetClientByEntityId(entity.id);
    if (connection != null) {
      entitySnapshot.LastProcessedInput = connection.LastProcessedSequence;
    }
    
    snapshot.Entities.Add(entitySnapshot);
  }
  
  // ... broadcast ...
}
```

### DoD Verification (Definition of Done)

**1. Интеграционный тест: 2 игрока онлайн**

```typescript
test('2 players can connect and play together', async () => {
  // 1. Запустить тестовый сервер
  const server = new TestServer({ port: 7777 });
  await server.start();
  
  // 2. Подключить двух клиентов
  const client1 = new GameClient('Player1');
  const client2 = new GameClient('Player2');
  
  await client1.connect('localhost:7777');
  await client2.connect('localhost:7777');
  
  // 3. Симулировать геймплей (5 секунд @ 30 Hz = 150 inputs)
  for (let i = 0; i < 150; i++) {
    client1.sendInput({ thrust: 1.0, strafeX: 0, strafeY: 0, yawInput: 0 });
    client2.sendInput({ thrust: -1.0, strafeX: 0, strafeY: 0, yawInput: 0 });
    await delay(33); // 30 Hz
  }
  
  // 4. Проверить, что оба клиента видят друг друга
  expect(client1.worldState.entities).toHaveLength(2);
  expect(client2.worldState.entities).toHaveLength(2);
  
  // 5. Проверить, что корабли двигаются в противоположных направлениях
  const player1Entity = client1.worldState.entities[0];
  const player2Entity = client2.worldState.entities[1];
  
  expect(player1Entity.velocity.x).toBeGreaterThan(50); // двигается вперёд
  expect(player2Entity.velocity.x).toBeLessThan(-50);   // двигается назад
});
```

**2. Тест: RTT 50 ms — плавный геймплей**

```typescript
test('RTT 50ms produces smooth gameplay', async () => {
  const server = new TestServer({ networkDelay: 25 }); // 25ms в каждую сторону
  const client = new GameClient('Player1');
  await client.connect(server);
  
  // Измерить prediction error (расхождение между predicted и server position)
  const errors: number[] = [];
  
  for (let i = 0; i < 100; i++) {
    // Получить predicted position ДО получения server snapshot
    const predictedPos = client.localEntity.position;
    
    // Подождать server snapshot
    await delay(66); // 15 Hz snapshots
    
    // Получить server position из snapshot
    const serverPos = client.serverEntity.position;
    
    // Измерить ошибку
    const error = Vector2.distance(predictedPos, serverPos);
    errors.push(error);
  }
  
  // Среднее отклонение должно быть < 1 метр (приемлемо для RTT 50ms)
  const avgError = errors.reduce((a, b) => a + b) / errors.length;
  expect(avgError).toBeLessThan(1.0);
  
  // 95% измерений должны быть < 2 метра
  const errors95 = errors.sort((a, b) => a - b)[94]; // 95-й перцентиль
  expect(errors95).toBeLessThan(2.0);
});
```

**3. Тест: RTT 200 ms — стабилизация за 1-2 секунды**

```typescript
test('RTT 200ms converges within 1-2 seconds', async () => {
  const server = new TestServer({ networkDelay: 100 }); // 100ms в каждую сторону
  const client = new GameClient('Player1');
  await client.connect(server);
  
  // 1. Создать искусственное расхождение
  client.localEntity.position = new Vector2(100, 0);
  server.setEntityPosition(client.entityId, new Vector2(0, 0));
  
  // 2. Начать отправку inputs
  client.startSendingInputs({ thrust: 0, strafeX: 0, strafeY: 0, yawInput: 0 });
  
  // 3. Измерить время до конвергенции
  const startTime = Date.now();
  let converged = false;
  
  while (!converged && Date.now() - startTime < 3000) {
    await delay(16); // 60 FPS
    
    const divergence = Vector2.distance(
      client.localEntity.position,
      client.serverEntity.position
    );
    
    if (divergence < 0.1) { // Сошлись с точностью 10 см
      converged = true;
    }
  }
  
  const convergenceTime = Date.now() - startTime;
  
  expect(converged).toBe(true);
  expect(convergenceTime).toBeLessThan(2000); // < 2 секунд
});
```

### Оценка времени

| Задача | Сложность | Время |
|--------|-----------|-------|
| TypeScript клиент (каркас) | Средняя | 1-2 дня |
| WebSocket transport | Низкая | 0.5 дня |
| Protobuf integration (JS) | Низкая | 0.5 дня |
| Local physics (порт с C#) | Высокая | 2-3 дня |
| Client-side prediction | Средняя | 1-2 дня |
| Reconciliation/replay | Средняя | 1-2 дня |
| 30 Hz input rate control | Низкая | 0.5 дня |
| DoD интеграционные тесты | Средняя | 1 день |
| Отладка и баг-фиксы | - | 1-2 дня |
| **ИТОГО** | - | **8-13 дней** |

**С учётом буфера 20%:** 10-16 дней (~2-3 недели)

---

## M3: FA:ON/OFF и Stabilized Ассистент

### Цель

Реализовать переключение режимов Flight Assist и Stabilized ассистент для FA:ON.

### Приоритет

🟡 **ВЫСОКИЙ** — ключевая фича v0.8.6, но не блокирует M2.3

### Требования ТЗ

Из `spec_u2_dev_plan_v086_minimal.md` (строки 410-486):

**FA:OFF (свободный полёт):**

- Команды → прямо в тягу/момент
- Максимальные ускорения из `physics`
- Скорости **НЕ ограничиваются** (кроме 0.999c′)
- Летит по инерции

**FA:ON (стабилизированный полёт):**

- Автопилот стабилизирует
- Те же ускорения из `physics`
- Скорости **ограничиваются** `flightAssistLimits.linearSpeedMax_mps`
- Не превышает `crewGLimit.linear_g`
- Гасит скорость при отпускании управления

### Архитектура

#### 1. Переключение FA:ON/OFF (M3.1, 1 неделя)

**Клиентский input:**

```typescript
// В InputManager.ts
class InputManager {
  private flightAssistEnabled = true;
  
  handleKeyPress(key: string): void {
    if (key === 'z' || key === 'Z') {
      this.flightAssistEnabled = !this.flightAssistEnabled;
      
      // Отправить на сервер
      this.sendFlightAssistToggle(this.flightAssistEnabled);
      
      // Обновить HUD
      this.updateHUD();
    }
  }
}
```

**Серверная обработка:**

```csharp
// MessageProcessor уже обрабатывает PlayerInputProto.FlightAssist
// Изменений не требуется
```

**HUD индикация:**

```typescript
// В HUD.ts
updateFlightAssist(enabled: boolean): void {
  this.faText.text = enabled ? "FA: ON" : "FA: OFF";
  this.faText.color = enabled ? "#00FF00" : "#FFFF00";
}
```

**DoD:**

- ✅ Клавиша Z переключает режим
- ✅ HUD показывает текущий режим
- ✅ Сервер применяет корректный режим

#### 2. Stabilized Ассистент (M3.2, 2-3 недели)

**FlightAssistSystem на сервере:**

```csharp
// src/shared/ECS/Systems/FlightAssistSystem.cs
public class FlightAssistSystem : IExecuteSystem {
  private readonly float _c_prime;
  private readonly float _dt;
  
  public void Execute() {
    var entities = _contexts.game.GetEntities(GameMatcher.FlightAssist);
    
    foreach (var entity in entities) {
      if (entity.flightAssist.enabled) {
        StabilizeFA_ON(entity);
      }
      // FA:OFF: ничего не делаем (свободный полёт)
    }
  }
  
  private void StabilizeFA_ON(GameEntity entity) {
    var config = entity.shipConfig.config;
    var limits = config.FlightAssistLimits;
    
    // 1. Ограничение линейных скоростей
    LimitLinearSpeeds(entity, limits);
    
    // 2. Стабилизация вращения (PD-контроллер)
    StabilizeRotation(entity, limits);
    
    // 3. Damping при отпущенном управлении (остановка)
    ApplyDamping(entity, limits);
  }
  
  private void LimitLinearSpeeds(GameEntity entity, FlightAssistLimits limits) {
    // Преобразовать скорость из мировых координат в локальные
    var rot = entity.transform2D.rotation;
    var velWorld = entity.velocity.linear;
    var velLocal = WorldToLocal(velWorld, rot);
    
    // Проверить превышение лимитов
    bool exceeded = false;
    
    if (velLocal.x > limits.LinearSpeedMax.Forward) {
      velLocal.x = limits.LinearSpeedMax.Forward;
      exceeded = true;
    }
    else if (velLocal.x < -limits.LinearSpeedMax.Reverse) {
      velLocal.x = -limits.LinearSpeedMax.Reverse;
      exceeded = true;
    }
    
    if (Math.Abs(velLocal.y) > limits.LinearSpeedMax.Lateral) {
      velLocal.y = Math.Sign(velLocal.y) * limits.LinearSpeedMax.Lateral;
      exceeded = true;
    }
    
    // Если превысили — применить ограниченную скорость
    if (exceeded) {
      var velWorldLimited = LocalToWorld(velLocal, rot);
      entity.ReplaceVelocity(velWorldLimited, entity.velocity.angular);
      
      // Скорректировать momentum для консистентности
      var gamma = RelativisticMath.Gamma(velWorldLimited.Magnitude / _c_prime);
      var momentum = velWorldLimited * (entity.mass.mass_kg * gamma);
      entity.ReplaceMomentum(momentum, entity.momentum.angular);
    }
  }
  
  private void StabilizeRotation(GameEntity entity, FlightAssistLimits limits) {
    var control = entity.controlState;
    var currentOmega = entity.velocity.angular;
    
    // Целевая угловая скорость из команды
    var targetOmega = control.yaw_input * limits.AngularSpeedMax.Yaw;
    
    // PD-контроллер
    const float Kp = 5.0f; // Пропорциональный коэффициент
    const float Kd = 1.0f; // Дифференциальный коэффициент (damping)
    
    var error = targetOmega - currentOmega;
    var torque = Kp * error - Kd * currentOmega;
    
    // Ограничить torque физическими возможностями корабля
    var maxTorque = entity.shipConfig.config.Physics.AngularAcceleration.Yaw 
                    * entity.mass.inertia_kg_m2;
    torque = Math.Clamp(torque, -maxTorque, maxTorque);
    
    // Применить torque
    entity.ReplaceMomentum(
      entity.momentum.linear,
      entity.momentum.angular + torque * _dt
    );
  }
  
  private void ApplyDamping(GameEntity entity, FlightAssistLimits limits) {
    var control = entity.controlState;
    
    // Если управление отпущено — гасим скорость
    const float DEADZONE = 0.01f;
    
    bool noThrust = Math.Abs(control.thrust) < DEADZONE;
    bool noStrafe = Math.Abs(control.strafe_x) < DEADZONE 
                     && Math.Abs(control.strafe_y) < DEADZONE;
    
    if (noThrust && noStrafe) {
      // Применить damping (постепенная остановка)
      const float DAMPING_FACTOR = 0.95f; // 5% скорости теряется каждый тик
      
      var vel = entity.velocity.linear;
      var dampedVel = vel * DAMPING_FACTOR;
      
      entity.ReplaceVelocity(dampedVel, entity.velocity.angular);
      
      // Скорректировать momentum
      var gamma = RelativisticMath.Gamma(dampedVel.Magnitude / _c_prime);
      var momentum = dampedVel * (entity.mass.mass_kg * gamma);
      entity.ReplaceMomentum(momentum, entity.momentum.angular);
    }
  }
  
  // Утилиты преобразования координат
  private Vector2 WorldToLocal(Vector2 world, float rotation) {
    float cos = MathF.Cos(-rotation);
    float sin = MathF.Sin(-rotation);
    return new Vector2(
      world.x * cos - world.y * sin,
      world.x * sin + world.y * cos
    );
  }
  
  private Vector2 LocalToWorld(Vector2 local, float rotation) {
    float cos = MathF.Cos(rotation);
    float sin = MathF.Sin(rotation);
    return new Vector2(
      local.x * cos - local.y * sin,
      local.x * sin + local.y * cos
    );
  }
}
```

**Интеграция в GameWorld:**

```csharp
// В GameWorld.cs
public class GameWorld {
  private FlightAssistSystem _flightAssistSystem;
  
  public void Initialize() {
    // ... существующий код ...
    
    _flightAssistSystem = new FlightAssistSystem(_contexts, _speedOfLight_mps, _deltaTime);
    
    _systems.Add(_flightAssistSystem);
  }
}
```

**DoD:**

- ✅ FA:ON: при отпускании управления вращение гасится < 2 сек
- ✅ FA:ON: скорость ограничена лимитами
- ✅ FA:ON: при превышении лимита скорость уменьшается плавно
- ✅ FA:OFF: летит по инерции, скорости не ограничиваются
- ✅ Тесты: 10+ unit tests для FlightAssistSystem

### Оценка времени

| Задача | Время |
|--------|-------|
| M3.1: Переключение FA:ON/OFF | 3-5 дней |
| M3.2: Stabilized ассистент | 10-15 дней |
| Тестирование | 2-3 дня |
| **ИТОГО** | **15-23 дня (3-4 недели)** |

---

## M4: Минимальный HUD

### Цель

Базовая информация для пилота (скорость, ускорение, курс, FA статус).

### Приоритет

🟢 **СРЕДНИЙ** — улучшает UX, но не критично для функциональности

### Требования ТЗ

Из `spec_u2_dev_plan_v086_minimal.md` (строки 489-525):

**Обязательные элементы:**

- Скорость (м/с)
- Ускорение (g)
- Курс (градусы)
- FA статус (ON/OFF)

**Опционально (отладка):**

- FPS
- RTT (ping)

### Архитектура

**Canvas-based HUD (TypeScript):**

```typescript
// src/client/ui/HUD.ts
export class HUD {
  private ctx: CanvasRenderingContext2D;
  private player: GameEntity;
  
  render(): void {
    // Очистка области HUD
    this.clearHUD();
    
    // 1. Скорость (верхний левый угол)
    const speed = this.player.velocity.magnitude;
    this.drawText(`${speed.toFixed(0)} м/с`, 20, 30, '20px monospace', '#00FF00');
    
    // 2. Ускорение (под скоростью)
    const accel = this.calculateAcceleration();
    const g = accel / 9.81;
    this.drawText(`${g.toFixed(1)} g`, 20, 60, '20px monospace', '#00FF00');
    
    // 3. Курс (верхний правый угол)
    const heading = (this.player.rotation * 180 / Math.PI) % 360;
    this.drawText(`${heading.toFixed(0)}°`, this.canvas.width - 100, 30, '20px monospace', '#00FF00');
    
    // 4. FA статус (нижний левый угол)
    const faText = this.player.flightAssist ? "FA: ON" : "FA: OFF";
    const faColor = this.player.flightAssist ? "#00FF00" : "#FFFF00";
    this.drawText(faText, 20, this.canvas.height - 20, '24px monospace', faColor);
    
    // 5. Отладка (F3)
    if (this.debugMode) {
      this.drawDebugInfo();
    }
  }
  
  private drawDebugInfo(): void {
    const x = this.canvas.width - 200;
    let y = this.canvas.height - 100;
    
    this.drawText(`FPS: ${this.fps.toFixed(0)}`, x, y, '16px monospace', '#FFFFFF');
    y += 20;
    this.drawText(`RTT: ${this.rtt.toFixed(0)} ms`, x, y, '16px monospace', '#FFFFFF');
    y += 20;
    this.drawText(`Divergence: ${this.divergence.toFixed(2)} m`, x, y, '16px monospace', '#FFFFFF');
  }
  
  private drawText(text: string, x: number, y: number, font: string, color: string): void {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }
}
```

**DoD:**

- ✅ HUD читаем и информативен
- ✅ Нет падения FPS из-за рендеринга
- ✅ F3 показывает/скрывает отладочную информацию

### Оценка времени

**5-10 дней (1-2 недели)**

---

## M5: Заглушки для будущего

### Цель

Простые модули-заглушки для демонстрации расширяемости.

### Приоритет

🟢 **НИЗКИЙ** — не влияет на core gameplay

### M5.1: Примитивный урон (1 неделя)

**Система урона:**

```csharp
// src/shared/Combat/SimpleDamageSystem.cs
public interface IDamageSystem {
  void ApplyDamage(uint targetId, float damage);
}

public class SimpleDamageSystem : IDamageSystem, IExecuteSystem {
  public void ApplyDamage(uint targetId, float damage) {
    var target = _gameWorld.GetEntityById((int)targetId);
    if (target == null) return;
    
    var health = target.health;
    health.current_HP -= damage;
    
    target.ReplaceHealth(health.current_HP, health.max_HP);
    
    if (health.current_HP <= 0) {
      target.isDestroyed = true;
    }
  }
  
  public void Execute() {
    // Удалить уничтоженные entities
    var destroyed = _contexts.game.GetEntities(GameMatcher.Destroyed);
    foreach (var entity in destroyed) {
      entity.Destroy();
    }
  }
}
```

**Protobuf сообщение:**

```protobuf
message FireCommand {
  uint32 shooter_id = 1;
  uint32 target_id = 2;
  float damage = 3; // фиксированный урон
}
```

**DoD:**

- ✅ Стрельба работает (команда → урон)
- ✅ HP снижается
- ✅ Корабль уничтожается при HP=0

### M5.2: Примитивные боты (1-2 недели)

**Random movement bot:**

```csharp
public class RandomBotSystem : IExecuteSystem {
  private System.Random _random = new();
  
  public void Execute() {
    var bots = _contexts.game.GetEntities(GameMatcher.BotAI);
    
    foreach (var bot in bots) {
      // Случайное управление (изменяется каждые 1-2 секунды)
      if (_random.NextDouble() < 0.02) { // 2% вероятность каждый тик @ 60 Hz ≈ 1 раз в секунду
        bot.ReplaceControlState(
          thrust: (float)(_random.NextDouble() * 2 - 1),    // -1..1
          strafeX: (float)(_random.NextDouble() * 2 - 1),
          strafeY: (float)(_random.NextDouble() * 2 - 1),
          yawInput: (float)(_random.NextDouble() * 2 - 1)
        );
      }
      
      // Случайная стрельба (редко)
      if (_random.NextDouble() < 0.001) { // 0.1% @ 60 Hz ≈ 1 раз в 1.5 секунды
        var targets = GetNearbyEnemies(bot);
        if (targets.Length > 0) {
          SendFireCommand(bot.creationIndex, targets[0].creationIndex);
        }
      }
    }
  }
}
```

**DoD:**

- ✅ Боты двигаются
- ✅ Боты иногда стреляют
- ✅ 8 ботов работают без лагов

### Оценка времени

**10-15 дней (2-3 недели)**

---

## M6: Оптимизация и платформы

### Цель

Стабильная производительность и поддержка основных платформ.

### Приоритет

🟡 **ВЫСОКИЙ** — необходимо для релиза

### M6.1: Оптимизация (2 недели)

**Профилирование:**

- Unity Profiler (если используется Unity)
- Chrome DevTools Performance (для браузерной версии)
- dotnet-trace (для серверной части)

**Основные оптимизации:**

1. **Пулы объектов** (снаряды, эффекты)
2. **Батчинг спрайтов** (рендеринг)
3. **Оптимизация сериализации** (protobuf object pooling)
4. **Spatial culling** (не отправлять далёкие entities)

**DoD:**

- ✅ FPS 60 @ 1080p
- ✅ Сеть < 50 кбит/с на клиента
- ✅ Server tick < 25 мс (при 10+ игроках)

### M6.2: Платформы (1-2 недели)

**Поддерживаемые платформы:**

- ✅ ПК (Windows/Linux)
- ✅ WebGL (браузер)

**Что НЕ делаем:**

- ❌ Мобильные (пока)
- ❌ Геймпад (только клавиатура/мышь)

**DoD:**

- ✅ ПК сборка работает
- ✅ WebGL сборка работает
- ✅ Онлайн работает на обеих платформах

### Оценка времени

**15-20 дней (3-4 недели)**

---

## Общий timeline

### Критический путь (минимум для играбельного прототипа)

| Этап | Приоритет | Время | Зависимости |
|------|-----------|-------|--------------|
| **M2.3** | 🔴 КРИТИЧНО | 2-3 недели | M2.2 (готово) |
| **M3** | 🟡 ВЫСОКИЙ | 3-4 недели | M2.3 |
| **M4** | 🟢 СРЕДНИЙ | 1-2 недели | M3 |
| **M5** | 🟢 НИЗКИЙ | 2-3 недели | M3 |
| **M6** | 🟡 ВЫСОКИЙ | 3-4 недели | M4, M5 |

**Параллельная разработка:**

- M4 и M5 можно делать параллельно (независимы)
- M6.1 можно начинать сразу после M3 (не ждать M4/M5)

**Оптимистичный сценарий (с параллелизацией):**

- M2.3: 2 недели
- M3: 3 недели
- M4 + M5 параллельно: 3 недели (max из двух)
- M6: 3 недели
- **ИТОГО: 11 недель (~2.5 месяца)**

**Реалистичный сценарий (с буфером 30%):**

- M2.3: 3 недели
- M3: 4 недели
- M4 + M5: 3 недели
- M6: 4 недели
- **ИТОГО: 14 недель (~3.5 месяца)**

**Пессимистичный сценарий (последовательно + баг-фиксы):**

- M2.3: 3 недели
- M3: 4 недели
- M4: 2 недели
- M5: 3 недели
- M6: 4 недели
- Баг-фиксы и интеграция: 2 недели
- **ИТОГО: 18 недель (~4.5 месяца)**

---

## Рекомендации по выполнению

### 1. Начать с M2.3 немедленно

**Почему:**

- Блокирует завершение M2.2 DoD
- Необходим для тестирования M3 (онлайн геймплей)
- Критический риск проекта (новая технология — TypeScript клиент)

**Действия:**

1. Создать issue "M2.3: Client-Side Prediction & Reconciliation"
2. Настроить TypeScript проект (Vite уже есть)
3. Портировать физику с C# на TypeScript
4. Реализовать prediction → reconciliation → DoD тесты

### 2. M3 можно начать параллельно (после M2.3 основа готова)

**Почему:**

- FlightAssistSystem — серверная логика (не зависит от клиента напрямую)
- Можно тестировать офлайн (M1 клиент)

**Действия:**

1. Реализовать FlightAssistSystem.cs
2. Добавить в GameWorld.Initialize()
3. Unit-тесты для FA:ON/OFF логики
4. Интеграция с M2.3 клиентом для финального тестирования

### 3. M4/M5 можно делегировать или откладывать

**Почему:**

- Не критично для core механик
- M4 (HUD) — UI/UX, можно сделать базовый вариант быстро
- M5 (заглушки) — демонстрационные фичи, не обязательны для MVP

**Действия:**

1. Сделать минимальный HUD (1 неделя вместо 2)
2. M5 отложить на потом (после M6) или пропустить совсем

### 4. M6 начать как можно раньше

**Почему:**

- Оптимизация выявляет архитектурные проблемы
- Лучше исправлять их раньше, чем позже

**Действия:**

1. Профилирование после M2.3 (найти узкие места)
2. Оптимизация сети после M3 (когда FA:ON/OFF работает)
3. Финальная оптимизация перед релизом

---

## Метрики успеха

### M2.3 (Client-Side)

- ✅ 2 игрока онлайн работает стабильно
- ✅ RTT 50ms: prediction error < 1м (среднее)
- ✅ RTT 200ms: конвергенция < 2 сек
- ✅ Нет видимых "прыжков" кораблей

### M3 (Flight Assist)

- ✅ FA:ON/OFF переключается корректно
- ✅ FA:ON: скорость ограничена лимитами
- ✅ FA:ON: вращение гасится < 2 сек
- ✅ FA:OFF: полёт по инерции

### M4 (HUD)

- ✅ Все показатели корректны (скорость, ускорение, курс, FA)
- ✅ Нет падения FPS

### M5 (Заглушки)

- ✅ Стрельба работает
- ✅ 8 ботов без лагов

### M6 (Оптимизация)

- ✅ FPS 60 @ 1080p
- ✅ Сеть < 50 кбит/с на клиента
- ✅ Server tick < 25 мс

---

## Риски и митигация

### Риск 1: TypeScript физика не совпадает с C #

**Вероятность:** Высокая  
**Влияние:** Критическое (reconciliation не работает)

**Митигация:**

- Автоматические тесты: сравнение C# vs TypeScript результатов
- Property-based тесты (те же inputs → те же outputs)
- Детерминизм: фиксированный deltaTime, никакого `float.Epsilon`

### Риск 2: Reconciliation вызывает "прыжки"

**Вероятность:** Средняя  
**Влияние:** Высокое (плохой UX)

**Митигация:**

- Tolerance threshold (игнорировать маленькие расхождения)
- Smooth interpolation (плавное сближение вместо резкого rewind)
- Адаптивный replay (только если расхождение > порога)

### Риск 3: FA:ON ограничения слишком агрессивны

**Вероятность:** Средняя  
**Влияние:** Среднее (плохой геймплей)

**Митигация:**

- Параметризация (лёгкая настройка констант)
- Playtesting (ручное тестирование геймплея)
- Логи и телеметрия (собирать данные о поведении)

### Риск 4: Производительность недостаточна

**Вероятность:** Низкая  
**Влияние:** Высокое (не релизабельно)

**Митигация:**

- Профилирование на ранней стадии (после M2.3)
- Architectural reviews (избегать O(n²) алгоритмов)
- Постепенная оптимизация (не ждать M6)

---

## Заключение

**Статус проекта:** Фундамент готов (M0-M2.2 server), переходим к онлайн геймплею.

**Следующий шаг:** **M2.3 Client-Side Prediction & Reconciliation** (2-3 недели)

**Цель проекта:** Играбельный прототип v0.8.6 с релятивистской физикой и FA:ON/OFF за 3.5-4.5 месяца.

**Вероятность успеха:** 85% (при условии фокуса на критическом пути M2.3 → M3 → M6)

---

**Документ подготовлен:** 2025-11-18  
**Автор:** AI Assistant (Claude Sonnet 4.5)  
**Версия:** 1.0  
**Статус:** ✅ Ready for implementation
