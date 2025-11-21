# U2 — План разработки для ИИ-агентов (минимальный)

**Версия:** 0.8.6 (Minimal)  
**Дата:** 2025-11-17  
**Приоритет:** Минимизация рисков, фундамент с возможностью расширения

**Принцип:** Реализуем только то, что необходимо для проверки архитектуры v0.8.6 (релятивистская физика + FA:ON/OFF). Все остальное — заглушки с интерфейсами для будущего расширения.

---

## 0. Система единиц и ключевые концепции

### 0.1. Система СИ

- масса — килограммы (тонны)
- расстояние — метры
- скорость — м/с
- ускорение — м/с²
- угловые скорости — градусы/с
- угловые ускорения — градусы/с²

### 0.2. Flight Assist ON vs OFF (КРИТИЧНО для v0.8.6)

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

### 0.3. Что НЕ реализуем (вычеркнуто из Архитектуры 0.8.6)

❌ Детальная тепловая модель  
❌ Щиты (концепция поменяется)  
❌ Броня (концепция поменяется)  
❌ Детальная стрельба с P_hit  
❌ ТТХ оружия  
❌ Голограммы будущего  
❌ Coupled-ассистенты  
❌ Сложные боты с тактикой  

✅ Вместо этого: **заглушки с интерфейсами** для будущего расширения

---

## Структура конфига корабля v0.8.6 (минимальная)

```json
{
  "meta": {
    "id": "origin_m50",
    "name": "Origin M50 Interceptor",
    "manufacturer": "Star Citizen",
    "version": "0.8.6"
  },
  "classification": {
    "size": "light",  // snub, light, medium, heavy, capital
    "type": "interceptor"
  },
  "geometry": {
    "length_m": 11.5,
    "width_m": 11.0,
    "height_m": 3.5
  },
  "hull": {
    "dryMass_t": 10,
    "hull_HP": 1000  // для примитивного урона
  },
  "physics": {  // FA:OFF потенциал
    "linearAcceleration_mps2": { "forward": 90, "reverse": 67.5 },
    "strafeAcceleration_mps2": { "lateral": 85 },
    "angularAcceleration_dps2": { "pitch": 240, "yaw": 200, "roll": 325 }
  },
  "flightAssistLimits": {  // FA:ON лимиты
    "crewGLimit": { "linear_g": 11.0 },
    "linearSpeedMax_mps": {
      "forward": 260, "reverse": 180, "lateral": 220, "vertical": 220
    },
    "angularSpeedMax_dps": { "pitch": 95, "yaw": 80, "roll": 130 }
  },
  "media": {
    "sprite": { "name": "Origin M50.png" }
  }
}
```

**Что убрали:**

- ❌ `signature_km` (пока не нужно, нет сканирования)
- ❌ Тепловые параметры
- ❌ Щиты, броня

---

## M0. Базовая основа (4-6 недель)

### M0.1. Репозиторий и сборка (1 неделя)

**Цель:** Готовый каркас.

**Содержание:**

- Структура: `shared/`, `server/`, `client/`
- Пакеты: Protobuf, NUnit, логирование
- Code-style, EditorConfig

**DoD:**

- CI сборка работает
- Один пустой тест проходит

---

### M0.2. Shared.Math + валидация + миграция (2 недели)

**Цель:** Математика, валидация ТТХ, миграция конфигов.

**Содержание:**

1. **Векторная алгебра:**

   ```csharp
   public struct Vector2 {
     public float x, y;
     public float Magnitude { get; }
     public Vector2 Normalized { get; }
   }
   ```

2. **Релятивистская физика:**

   ```csharp
   public static class RelativisticMath {
     public static float Gamma(float beta) {
       float beta2 = beta * beta;
       if (beta2 >= 1.0f) return float.MaxValue;
       return 1.0f / MathF.Sqrt(1.0f - beta2);
     }
   }
   ```

3. **LocationConfig (фиксированное c′):**

   ```csharp
   public class LocationConfig {
     public float c_prime_mps = 5000;  // константа!
     public string name = "Test Arena";
   }
   ```

4. **Минимальная структура ShipConfig v0.8.6:**

   ```csharp
   public class ShipConfig {
     public ShipMeta Meta;
     public ShipClassification Classification;
     public ShipGeometry Geometry;
     public ShipHull Hull;
     public ShipPhysics Physics;
     public FlightAssistLimits FlightAssistLimits;
     public ShipMedia Media;
   }
   
   // Детали структур см. выше
   ```

5. **Валидация:**

   ```csharp
   public class ShipValidator {
     public static bool Validate(ShipConfig ship) {
       // Проверка размера: snub, light, medium, heavy, capital
       // Проверка формулы F = m * a (±10%)
       // Проверка g-лимита в диапазоне для класса
       return true;
     }
   }
   ```

6. **Миграция 0.6.4 → 0.8.6:**

   ```csharp
   public class ConfigMigrator {
     public static ShipConfig MigrateFrom064(OldConfig old) {
       // Удалить control, techLevel
       // "small" → "light"
       // performance.* → physics + flightAssistLimits
       // Для пропущенных полей: номиналы класса
     }
   }
   ```

**DoD:**

- γ-тесты проходят
- Все номиналы валидируются
- Миграция работает на тестовых конфигах

---

### M0.3. Entitas ECS (1-2 недели)

**Цель:** Интеграция готового ECS.

**Содержание:**

**Компоненты (минимум):**

```csharp
[Game] public sealed class Transform2DComponent : IComponent {
  public Vector2 position;
  public float rotation;
}

[Game] public sealed class VelocityComponent : IComponent {
  public Vector2 linear;
  public float angular;
}

[Game] public sealed class MassComponent : IComponent {
  public float mass_kg;
  public float inertia_kg_m2;
}

[Game] public sealed class ControlStateComponent : IComponent {
  public float thrust;      // -1..1
  public float strafe_x;
  public float strafe_y;
  public float yaw_input;
}

[Game] public sealed class FlightAssistComponent : IComponent {
  public bool enabled;  // FA:ON или FA:OFF
}

[Game] public sealed class ShipConfigComponent : IComponent {
  public ShipConfig config;
}

// Заглушки для будущего
[Game] public sealed class HealthComponent : IComponent {
  public float current_HP;
  public float max_HP;
}
```

**Системы-заглушки:**

```csharp
public class PhysicsSystem : IExecuteSystem {
  public void Execute() { /* M1 */ }
}

public class FlightAssistSystem : IExecuteSystem {
  public void Execute() { /* M3 */ }
}
```

**DoD:**

- Entities создаются/удаляются
- Сериализация работает
- Benchmark: 10k entities < 16 мс

---

## M1. Физика и офлайн-клиент (3-4 недели)

### M1.1. Серверная физика (2 недели)

**Цель:** Канонический интегратор с релятивистской кинематикой.

**Содержание:**

```csharp
public class PhysicsSystem : IExecuteSystem {
  public void Execute() {
    float dt = 1.0f / 30.0f;
    float c_prime = LocationConfig.c_prime_mps;
    
    foreach (var entity in entities) {
      // 1. Расчёт силы
      Vector2 force = CalculateForce(entity);
      
      // 2. Интеграция импульса
      entity.momentum.linear += force * dt;
      
      // 3. p → v с γ
      float v_classic = entity.momentum.linear.Magnitude / entity.mass.mass_kg;
      float beta = v_classic / c_prime;
      if (beta >= 0.999f) beta = 0.999f;
      
      float gamma = RelativisticMath.Gamma(beta);
      entity.velocity.linear = entity.momentum.linear / (gamma * entity.mass.mass_kg);
      
      // 4. Интеграция позиции
      entity.transform2D.position += entity.velocity.linear * dt;
      
      // 5. Угловая динамика (без γ)
      float torque = CalculateTorque(entity);
      entity.momentum.angular += torque * dt;
      entity.velocity.angular = entity.momentum.angular / entity.mass.inertia_kg_m2;
      entity.transform2D.rotation += entity.velocity.angular * dt;
    }
  }
}

Vector2 CalculateForce(GameEntity entity) {
  var config = entity.shipConfig.config;
  var control = entity.controlState;
  float mass = entity.mass.mass_kg;
  
  // Используем physics.* (FA:ON/OFF не важно на этом уровне)
  float thrust_accel = control.thrust > 0 
    ? control.thrust * config.Physics.LinearAcceleration.Forward
    : -control.thrust * config.Physics.LinearAcceleration.Reverse;
  
  float strafe_accel = control.strafe_x * config.Physics.StrafeAcceleration.Lateral;
  
  // Преобразование в мировые координаты
  Vector2 forward = new Vector2(MathF.Cos(entity.transform2D.rotation), 
                                MathF.Sin(entity.transform2D.rotation));
  Vector2 right = new Vector2(-forward.y, forward.x);
  
  Vector2 accel = thrust_accel * forward + strafe_accel * right;
  return accel * mass;
}
```

**Что НЕ делаем:**

- ❌ Тепловая модель (заглушка, всегда T = const)
- ❌ Перегрев и троттлинг

**DoD:**

- Корабль разгоняется от 0 до 0.5c′
- γ растёт корректно
- Не превышает 0.999c′
- Энергия сохраняется (±1%)

---

### M1.2. Офлайн-клиент (1-2 недели)

**Цель:** Визуальное тестирование физики.

**Содержание:**

- Локальная копия PhysicsSystem
- Ввод WASD/мышь (упрощённый)
- Рендеринг 2D sprites
- Камера следит за игроком
- Минимальный HUD: скорость, ускорение, курс

**Что НЕ делаем:**

- ❌ Сложный ввод с геймпадом
- ❌ Отладочные визуализации (пока)

**DoD:**

- Корабль отображается
- WASD управление работает
- FPS 60

---

## M2. Сеть и reconciliation (3-4 недели)

### M2.1. Protobuf-протокол (1 неделя)

**Минимальные сообщения:**

```protobuf
message ManeuverCommand {
  uint32 entity_id = 1;
  uint32 tick = 2;
  float thrust = 3;
  float strafe_x = 4;
  float yaw_input = 5;
  bool flight_assist = 6;  // FA:ON/OFF
}

message EntitySnapshot {
  uint32 entity_id = 1;
  Vec2 position = 2;
  float rotation = 3;
  Vec2 velocity = 4;
  bool flight_assist = 5;
}

message WorldSnapshot {
  uint32 tick = 1;
  repeated EntitySnapshot entities = 2;
}
```

**DoD:**

- Сериализация < 200 байт на 12 кораблей

---

### M2.2. UDP + reconciliation (2-3 недели)

**Содержание:**

- UDP-транспорт (сервер → клиенты)
- Client-side prediction
- Reconciliation (replay)

**Упрощения:**

- Без адаптивного битрейта
- Без компрессии
- Фиксированные частоты: 30 Hz команды, 15 Hz снимки

**DoD:**

- Онлайн 2 игрока работает
- RTT 50 мс без рывков
- RTT 200 мс стабилизируется за 1-2 сек

---

## M3. FA:ON/OFF и Stabilized (3-4 недели)

### M3.1. Переключение FA:ON/OFF (1 неделя)

**Цель:** Реализовать переключение режимов.

**Содержание:**

```csharp
// Игрок нажимает Z
if (Input.GetKeyDown(KeyCode.Z)) {
  player.flightAssist.enabled = !player.flightAssist.enabled;
}

// HUD
hudText.text = player.flightAssist.enabled ? "FA: ON" : "FA: OFF";
hudText.color = player.flightAssist.enabled ? Color.green : Color.yellow;
```

**DoD:**

- Переключение работает
- Индикация в HUD

---

### M3.2. Stabilized ассистент (2-3 недели)

**Цель:** Один режим ассистента с учётом FA:ON/OFF.

**Содержание:**

```csharp
public class FlightAssistSystem : IExecuteSystem {
  public void Execute() {
    foreach (var entity in entities) {
      if (entity.flightAssist.enabled) {
        // FA:ON: стабилизация
        StabilizeFA_ON(entity);
      } else {
        // FA:OFF: только экстренная эскалация (опционально в M5)
        // Пока ничего не делаем
      }
    }
  }
}

void StabilizeFA_ON(GameEntity entity) {
  var config = entity.shipConfig.config;
  var limits = config.FlightAssistLimits;
  
  // 1. Ограничение линейных скоростей
  Vector2 vel_local = WorldToLocal(entity.velocity.linear, entity.transform2D.rotation);
  
  // Если превышает лимит — применяем тормозящую силу
  if (vel_local.x > limits.LinearSpeedMax.Forward) {
    // Тормозим
    ApplyBrakingForce(entity, vel_local);
  }
  
  // 2. Стабилизация вращения (PD-контроллер)
  float target_omega = entity.controlState.yaw_input * limits.AngularSpeedMax.Yaw;
  float error = target_omega - entity.velocity.angular;
  float torque = Kp * error;  // упрощённо, без Kd пока
  
  ApplyTorque(entity, torque);
}
```

**Упрощения:**

- Без jerk-лимитирования (пока)
- Без контроля g-перегрузок (пока)
- Без эскалации (M5)

**DoD:**

- FA:ON: при отпускании управления вращение гасится < 2 сек
- FA:ON: скорость ограничена
- FA:OFF: летит по инерции, не гасит

---

## M4. Минимальный HUD (1-2 недели)

**Цель:** Базовая информация.

**Содержание:**

```csharp
// Скорость
float speed = player.velocity.linear.Magnitude;
speedText.text = $"{speed:F0} м/с";

// Ускорение
float g = accel.Magnitude / 9.81f;
accelText.text = $"{g:F1} g";

// Курс
float heading = player.transform2D.rotation * Mathf.Rad2Deg;
headingText.text = $"{heading:F0}°";

// FA статус
faText.text = player.flightAssist.enabled ? "FA: ON" : "FA: OFF";

// Отладка (F3)
if (Input.GetKey(KeyCode.F3)) {
  debugText.text = $"FPS: {1.0f / Time.deltaTime:F0}\n" +
                   $"RTT: {connection.RTT:F0} ms";
}
```

**Что НЕ делаем:**

- ❌ Наблюдение с задержкой света (пока не нужно)
- ❌ Голограммы
- ❌ Сложные визуализации

**DoD:**

- HUD читаем
- Нет падения FPS

---

## M5. Заглушки для будущего (2-3 недели)

### M5.1. Примитивный урон (1 неделя)

**Цель:** Заглушка модуля боя.

**Содержание:**

```csharp
public interface IDamageSystem {
  void ApplyDamage(uint target_id, float damage);
}

public class SimpleDamageSystem : IDamageSystem {
  public void ApplyDamage(uint target_id, float damage) {
    var target = GetEntity(target_id);
    target.health.current_HP -= damage;
    
    if (target.health.current_HP <= 0) {
      target.Add<DestroyedFlag>();
    }
  }
}

// Стрельба: фиксированный урон, без P_hit
message FireCommand {
  uint32 shooter_id = 1;
  uint32 target_id = 2;
}

// На сервере
if (fireCommand.Received) {
  damageSystem.ApplyDamage(cmd.target_id, 100.0f);  // фиксированный урон
}
```

**Что НЕ делаем:**

- ❌ P_hit (вероятность)
- ❌ Щиты, броня
- ❌ ТТХ оружия

**DoD:**

- Стрельба работает
- HP снижается
- Корабль уничтожается при HP=0

---

### M5.2. Примитивные боты (1-2 недели)

**Цель:** Заглушка AI.

**Содержание:**

```csharp
public class RandomBotSystem : IExecuteSystem {
  public void Execute() {
    foreach (var bot in bots) {
      // Случайное управление
      bot.controlState.thrust = Random.Range(-1f, 1f);
      bot.controlState.strafe_x = Random.Range(-1f, 1f);
      bot.controlState.yaw_input = Random.Range(-1f, 1f);
      
      // Случайная стрельба
      if (Random.value < 0.01f && bot.weapon.ready) {
        var targets = GetNearbyEnemies(bot);
        if (targets.Count > 0) {
          SendFireCommand(bot.id, targets[0].id);
        }
      }
    }
  }
}
```

**Альтернатива (чуть умнее):**

```csharp
// Патруль по случайным точкам
Vector2 waypoint = bot.ai.currentWaypoint;
if (Distance(bot, waypoint) < 100) {
  bot.ai.currentWaypoint = RandomPoint();
}
FlyTowards(bot, waypoint);
```

**Что НЕ делаем:**

- ❌ Тактика
- ❌ Кооперация
- ❌ Уклонение

**DoD:**

- Боты двигаются
- Боты иногда стреляют
- 8 ботов работают без лагов

---

## M6. Оптимизация и платформы (3-4 недели)

### M6.1. Оптимизация (2 недели)

**Содержание:**

- Профилирование (Unity Profiler)
- Пулы объектов (снаряды, эффекты)
- Батчинг спрайтов
- Оптимизация сериализации

**DoD:**

- FPS 60 (1080p)
- Сеть < 50 кбит/с
- Server tick < 25 мс

---

### M6.2. Платформы (1-2 недели)

**Содержание:**

- ПК (Windows/Linux)
- WebGL (опционально)

**Упрощения:**

- Без мобильных (пока)
- Только клавиатура/мышь

**DoD:**

- ПК сборка работает
- Онлайн работает

---

## Итоговая оценка (минимальный план)

| Этап | Недели |
|------|--------|
| M0 | 4-6 |
| M1 | 3-4 |
| M2 | 3-4 |
| M3 | 3-4 |
| M4 | 1-2 |
| M5 | 2-3 |
| M6 | 3-4 |
| **Итого** | **19-27 недель** |

**С учётом буфера 20%:** 23-32 недели (~5-8 месяцев)

**Вероятность успеха:** 90% (снизили риски)

---

## Milestones

**Milestone 1 (2-3 месяца):** Офлайн полёт  
**Milestone 2 (4-5 месяцев):** Онлайн полёт с FA:ON/OFF  
**Milestone 3 (6-8 месяцев):** Минимальный играбельный прототип

---

## Что будет расширяться позже (M7+)

После построения фундамента (M0-M6):

**M7+: Расширения (по необходимости)**

- Детальная тепловая модель
- Щиты (новая концепция)
- Броня (новая концепция)
- P_hit и ТТХ оружия
- Умные боты с тактикой
- Coupled-ассистенты
- Наблюдение с задержкой света
- Мобильные платформы

**Каждое расширение — отдельный модуль с чётким интерфейсом**

---

## Ключевые принципы для ИИ-агентов

1. **Минимум реализации, максимум интерфейсов**
   - Заглушки вместо сложной логики
   - Чёткие интерфейсы для расширения

2. **Фокус на фундаменте**
   - Релятивистская физика (проверка концепции)
   - FA:ON/OFF (ключевая фича v0.8.6)
   - Сеть + reconciliation (основа)

3. **Заглушки с расширяемостью**
   - `IDamageSystem` → позже заменим на сложный
   - `IAssistSystem` → позже добавим режимы
   - `IBotAI` → позже добавим тактику

4. **Тестируемость**
   - Каждый модуль покрыт тестами
   - Property-based тесты для физики
   - Интеграционные тесты для сети

---

## Приоритеты

**Критично (нельзя откладывать):**

- ✅ Релятивистская физика с γ
- ✅ FA:ON/OFF различие
- ✅ Reconciliation
- ✅ Stabilized ассистент

**Важно (заглушки обязательны):**

- ✅ Примитивный урон
- ✅ Примитивные боты
- ✅ Минимальный HUD

**Можно отложить (M7+):**

- ⏳ Тепло
- ⏳ Щиты/броня
- ⏳ Сложная стрельба
- ⏳ Умные боты

---

**Конец минимального плана v0.8.6**

**Целевой срок:** 6-8 месяцев до фундамента  
**Вероятность успеха:** 90%  
**Готовность:** ✅ 100%
