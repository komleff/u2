// U2 — Ship Tech Specs v0.8.6 Minimal (runtime config)
// Формат ТТХ кораблей для версии 0.8.6 (минимальная версия для ИИ-агентов).
// Используется клиентом и сервером для 2D космосима с режимами Flight Assist ON/OFF по модели Elite Dangerous.
// Все скорости и ускорения заданы в СИ (метры/секунда, м/с; метры/секунда², м/с²).

// ⚠️ IMPORTANT: Minimal подход для минимизации рисков
// Эта версия спецификации описывает МИНИМУМ, необходимый для построения фундамента игры.
// Многие системы реализованы как заглушки с интерфейсами для будущего расширения (M7+).

1. Назначение формата (Minimal версия)

- Описывает неизменяемые свойства корпуса: метаданные, класс/архетип, габариты, массу, прочность корпуса, кинематические параметры и ограничения по перегрузкам экипажа.
- Логика управления, схема кнопок и общий алгоритм Flight Assist задаются глобально (в конфиге системы управления), а не per-ship.

⚠️ ЧТО НЕ ВХОДИТ в v0.8.6 Minimal (отложено до M7+):

- ❌ Детальная тепловая модель (заглушка: температура = const)
- ❌ Щиты (концепция поменяется, заглушка с интерфейсом)
- ❌ Броня (концепция поменяется, заглушка с интерфейсом)
- ❌ ТТХ оружия и детальная стрельба (примитивный урон: фиксированный)
- ❌ Сигнатуры и сканирование (поле signature_km опционально, для будущего)
- ❌ Модули и технологии

✅ ЧТО РЕАЛИЗУЕТСЯ в v0.8.6 Minimal (M0-M6):

- ✅ Релятивистская физика с γ-фактором
- ✅ FA:ON vs FA:OFF (ключевая концепция)
- ✅ Примитивный урон (hull_HP, фиксированное значение)
- ✅ Базовая геометрия и масса

1. Общая структура JSON-конфига корабля (Minimal)

{
  "meta": { ... },
  "classification": { ... },
  "geometry": { ... },
  "hull": { ... },
  "physics": { ... },
  "flightAssistLimits": { ... },
  "media": { ... }
}

Все поля обязательны, если явно не указано обратное.

1. meta — идентификация корабля

meta: {
  "id": string,           // стабильный ID корпуса, snake_case. Пример: "origin_m50"
  "name": string,         // отображаемое имя корабля
  "manufacturer": string, // производитель/происхождение лора. Для импортированных SC-кораблей: "Star Citizen"
  "version": string       // версия конфига ТТХ, для этой схемы: "0.8.6"
}

1. classification — класс и размер

classification: {
  "size": "snub" | "light" | "medium" | "heavy" | "capital",
  "type": string,          // архетип/класс: interceptor, fighter, bomber, courier, trader, corvette, frigate, destroyer, carrier и т.п.
  "stealth"?: "standard" | "stealth", // профиль заметности корпуса (опционально, для будущего M9+)
  "variant"?: string       // человекочитаемый вариант корпуса, например "Sport Interceptor"
}

Примечания:

- В 0.8.6 значение "small" переименовано в "light".
- Остальные размеры (snub, medium, heavy, capital) без изменений.
- stealth: опционально в Minimal версии, используется только при реализации системы сканирования (M9+).

1. geometry — габариты корпуса

geometry: {
  "length_m": number,      // длина корпуса, м
  "width_m": number,       // ширина, м
  "height_m": number,      // высота, м
  "hull_radius_m"?: number // радиус аппроксимирующей сферы, для коллизий/LOD (опционально)
}

Примечания:

- hull_radius_m: опционально, для упрощённых коллизий. Можно вычислить как hypot(length, width) / 2.

1. hull — параметры корпуса (масса, прочность)

hull: {
  "dryMass_t": number,    // сухая масса корпуса (масса корабля без топлива и груза), тонн
  "hull_HP": number       // базовая прочность корпуса (HP) для примитивной системы урона
}

Примечания для Minimal версии:

- hull_HP используется для примитивной системы урона (фиксированный урон, без P_hit).
- Формула урона (M5): урон = константа (например, 100 HP за выстрел).
- Щиты и броня НЕ реализованы, будут добавлены в M8+ через расширяемые интерфейсы.

⚠️ Поле signature_km УДАЛЕНО из Minimal версии:

- Причина: нет системы сканирования в M0-M6.
- Будет добавлено в M9+ при реализации детальной системы обнаружения.
- Для будущего: signature_km = R0 * (M_t / M0)^a, где M0 = 10 т, R0 = 9.5 км, a = 0.24.

1. physics — кинематика корпуса (сырой потенциал, FA:OFF)

physics: {
  "linearAcceleration_mps2": {
    "forward": number,  // разгон вперёд при 100% маршевой тяге без буста (м/с²)
    "reverse"?: number  // торможение/разгон назад. Если не задано, редактор подставляет ~0.7 * forward
  },

  "strafeAcceleration_mps2": {
    "lateral": number,   // боковое ускорение для стрейфа в 2D (м/с²)
    "vertical"?: number  // вертикальное ускорение (м/с²); в 2D можно не задавать, тогда = lateral
  },

  "angularAcceleration_dps2": {    // управляет "резвостью" поворота корпуса
    "pitch": number,               // град/с²
    "yaw": number,
    "roll": number
  }
}

Интерпретация:

- Эти параметры описывают физический потенциал корпуса при Flight Assist OFF: максимальные линейные и угловые ускорения.
- В режиме Flight Assist OFF симуляция использует именно эти ускорения, **не накладывая ограничений на линейные и угловые скорости** (кроме глобальных предохранителей движка: 0.999c′).

1. flightAssistLimits — ограничения для экипажа и стабилизированного полёта (FA:ON)

flightAssistLimits: {
  "crewGLimit": {
    "linear_g": number // максимально допустимая для экипажа линейная перегрузка в g (1 g = 9.81 м/с²)
  },
  "linearSpeedMax_mps": {        // лимиты скорости по осям в стабилизированном режиме (м/с)
    "forward": number,           // максимально допустимая скорость вперёд
    "reverse": number,           // максимально допустимая скорость назад
    "lateral": number,           // максимально допустимая скорость вбок
    "vertical": number           // максимально допустимая скорость вверх/вниз (для 2D может совпадать с lateral)
  },
  "angularSpeedMax_dps": {       // лимиты угловой скорости в FA:ON (град/с)
    "pitch": number,
    "yaw": number,
    "roll": number
  }
}

Семантика режимов (КЛЮЧЕВАЯ КОНЦЕПЦИЯ v0.8.6):

- **Flight Assist OFF (свободный полёт):**
  - Оси управления независимы.
  - Команды игрока напрямую масштабируются в тягу/момент в пределах максимальных ускорений из блока `physics`.
  - Линейные и угловые скорости **не ограничиваются** значениями из `flightAssistLimits.linearSpeedMax_mps` и `angularSpeedMax_dps` — корабль может продолжать разгоняться, пока это допускает физика и общие защитные системы.
  - Корабль летит по инерции, не гасит скорость при отпускании управления.
  - Перегрузки экипажа рассчитываются из фактических ускорений; обработка эффектов (blackout, урон) реализуется в глобальной подсистеме и использует `crewGLimit.linear_g` как порог.

- **Flight Assist ON (стабилизированный полёт):**
  - Автопилот стабилизирует корабль, гасит скорость до выбранного целевого вектора и удерживает его.
  - Компоненты линейной скорости по осям ограничиваются полем `flightAssistLimits.linearSpeedMax_mps`:
    - вперёд — `forward`, назад — `reverse`, вбок — `lateral`, вверх/вниз — `vertical`.
  - Угловые скорости по pitch/yaw/roll ограничиваются `flightAssistLimits.angularSpeedMax_dps.*`.
  - Автопилот старается не превышать `crewGLimit.linear_g` при разгоне/торможении; при необходимости он не отдаёт полную тягу, даже если `physics.linearAcceleration_mps2` позволяет.
  - При отпускании управления корабль гасит скорость и останавливает вращение.

Таким образом:

- Для FA:OFF ядро использует **максимальные ускорения из physics**, без лимита скоростей со стороны ТТХ.
- Для FA:ON ядро использует те же ускорения physics, но автопилот режет скорость и g до значений, безопасных для экипажа и геймплея, отдельно по каждой оси.

1. media — визуальные ресурсы

media: {
  "sprite": {
    "name": string,      // имя файла спрайта
    "path"?: string,     // относительный путь до файла в проекте
    "width"?: number,    // ширина спрайта в пикселях (для редактора)
    "height"?: number,   // высота спрайта в пикселях (для редактора)
    "dataUrl"?: string   // опциональный встроенный data:image/png;base64,... для предпросмотра в редакторе
  }
}

1. Nominals v0.8.6 Minimal — эталонные классы (для редактора)

Файл nominals (TS/JS) используется редактором для автозаполнения ТТХ новых кораблей по классу.

Пример заголовка файла:

export const NOMINALS_VERSION = "0.8.6-minimal";
export const NOMINALS_MODE = "assisted"; // ED-like Flight Assist

export const NOMINALS = {
  "light interceptor": {
    classification: { size: "light", type: "interceptor" },
    hull: { dryMass_t: 10, hull_HP: 1000 },
    geometry: { length_m: 11.5, width_m: 11.0, height_m: 3.5 },
    physics: {
      linearAcceleration_mps2: { forward: 90, reverse: 70 },
      strafeAcceleration_mps2: { lateral: 85 },
      angularAcceleration_dps2: { pitch: 240, yaw: 200, roll: 325 }
    },
    flightAssistLimits: {
      crewGLimit: { linear_g: 11.0 },               // спортивный/гоночный, самый высокий допуск по g
      linearSpeedMax_mps: {
        forward: 260,
        reverse: 180,
        lateral: 220,
        vertical: 220
      },
      angularSpeedMax_dps: { pitch: 95, yaw: 80, roll: 130 }
    }
  },

  "light fighter": {
    classification: { size: "light", type: "fighter" },
    hull: { dryMass_t: 25, hull_HP: 1500 },
    geometry: { length_m: 18, width_m: 16, height_m: 5 },
    physics: {
      linearAcceleration_mps2: { forward: 70, reverse: 55 },
      strafeAcceleration_mps2: { lateral: 60 },
      angularAcceleration_dps2: { pitch: 190, yaw: 165, roll: 260 }
    },
    flightAssistLimits: {
      crewGLimit: { linear_g: 9.0 },                // боевые истребители, ниже чем спорт, выше гражданских
      linearSpeedMax_mps: {
        forward: 230,
        reverse: 150,
        lateral: 190,
        vertical: 190
      },
      angularSpeedMax_dps: { pitch: 80, yaw: 70, roll: 110 }
    }
  },

  "medium courier": {
    classification: { size: "medium", type: "courier" },
    hull: { dryMass_t: 70, hull_HP: 3000 },
    geometry: { length_m: 24, width_m: 16, height_m: 6 },
    physics: {
      linearAcceleration_mps2: { forward: 50, reverse: 40 },
      strafeAcceleration_mps2: { lateral: 35 },
      angularAcceleration_dps2: { pitch: 130, yaw: 110, roll: 180 }
    },
    flightAssistLimits: {
      crewGLimit: { linear_g: 6.0 },                // быстрый гражданский/почтовый корабль
      linearSpeedMax_mps: {
        forward: 210,
        reverse: 140,
        lateral: 160,
        vertical: 160
      },
      angularSpeedMax_dps: { pitch: 60, yaw: 50, roll: 80 }
    }
  },

  "heavy freighter": {
    classification: { size: "heavy", type: "freighter" },
    hull: { dryMass_t: 500, hull_HP: 8000 },
    geometry: { length_m: 80, width_m: 40, height_m: 20 },
    physics: {
      linearAcceleration_mps2: { forward: 20, reverse: 15 },
      strafeAcceleration_mps2: { lateral: 10 },
      angularAcceleration_dps2: { pitch: 55, yaw: 45, roll: 70 }
    },
    flightAssistLimits: {
      crewGLimit: { linear_g: 4.0 },                // грузовые суда, низкий комфортный g-лимит
      linearSpeedMax_mps: {
        forward: 150,
        reverse: 90,
        lateral: 110,
        vertical: 110
      },
      angularSpeedMax_dps: { pitch: 25, yaw: 20, roll: 30 }
    }
  },

  "capital frigate": {
    classification: { size: "capital", type: "frigate" },
    hull: { dryMass_t: 10000, hull_HP: 20000 },
    geometry: { length_m: 250, width_m: 80, height_m: 50 },
    physics: {
      linearAcceleration_mps2: { forward: 10, reverse: 8 },
      strafeAcceleration_mps2: { lateral: 5 },
      angularAcceleration_dps2: { pitch: 30, yaw: 25, roll: 40 }
    },
    flightAssistLimits: {
      crewGLimit: { linear_g: 3.0 },                // пассажирские/капитал, самые щадящие перегрузки
      linearSpeedMax_mps: {
        forward: 120,
        reverse: 70,
        lateral: 80,
        vertical: 80
      },
      angularSpeedMax_dps: { pitch: 15, yaw: 12, roll: 20 }
    }
  }
};

Градация g-лимитов по архетипам:

- Спортивные и гоночные корабли: 10–12 g.
- Боевые истребители/перехватчики: 8–10 g.
- Быстрые гражданские (courier, executive): 6–8 g.
- Грузовые и вспомогательные суда: 4–6 g.
- Пассажирские лайнеры и capital-корабли: 3–4 g.

Примечания для Minimal версии:

- Убрано поле signature_km (нет системы сканирования в M0-M6).
- hull_HP — для примитивного урона (фиксированный, без щитов/брони).

1. Пример конфига Origin M50 Interceptor (v0.8.6 Minimal)

{
  "meta": {
    "id": "origin_m50",
    "name": "Origin M50 Interceptor",
    "manufacturer": "Star Citizen",
    "version": "0.8.6"
  },
  "classification": {
    "size": "snub",
    "type": "interceptor",
    "variant": "Sport Interceptor"
  },
  "geometry": {
    "length_m": 11.5,
    "width_m": 11.0,
    "height_m": 3.5,
    "hull_radius_m": 7.96
  },
  "hull": {
    "dryMass_t": 10,
    "hull_HP": 1000
  },
  "physics": {
    "linearAcceleration_mps2": { "forward": 90, "reverse": 67.5 },
    "strafeAcceleration_mps2": { "lateral": 85 },
    "angularAcceleration_dps2": { "pitch": 240, "yaw": 200, "roll": 325 }
  },
  "flightAssistLimits": {
    "crewGLimit": { "linear_g": 11.0 },
    "linearSpeedMax_mps": {
      "forward": 260,
      "reverse": 180,
      "lateral": 220,
      "vertical": 220
    },
    "angularSpeedMax_dps": { "pitch": 95, "yaw": 80, "roll": 130 }
  },
  "media": {
    "sprite": {
      "name": "Origin M50.png",
      "path": "Origin M50.png",
      "width": 1000,
      "height": 907
    }
  }
}

Что УДАЛЕНО из примера в Minimal версии:

- ❌ "stealth": "standard" (нет системы сканирования)
- ❌ "signature_km": 9.5 (нет системы сканирования)
- ❌ "dataUrl" в sprite (опционально, для упрощения)

1. Миграция 0.6.4 → 0.8.6 Minimal (для ИИ-редактора)

- Убрать раздел control из корабельных конфигов: способ управления задаётся глобально, а не per-ship.
- Удалить techLevel из ТТХ корабля — технологический уровень будет описываться позже в отдельной системе.
- Размер "small" заменить на "light" во всех конфигурациях. Значения snub/medium/heavy/capital оставить без изменений.
- Поля performance старого формата маппятся так:
  - performance.scm_mps          → flightAssistLimits.linearSpeedMax_mps.forward
  - performance.accel_fwd_mps2   → physics.linearAcceleration_mps2.forward
  - performance.strafe_mps2.x    → physics.strafeAcceleration_mps2.lateral
  - performance.omega_cap_dps.*→ flightAssistLimits.angularSpeedMax_dps.*
- Для flightAssistLimits.linearSpeedMax_mps.reverse/lateral/vertical:
  - если в старом конфиге есть отдельные поля (scm_reverse_mps, scm_strafe_mps и т.п.), использовать их;
  - иначе брать доли от forward в зависимости от номинала класса (по умолчанию: reverse ≈ 0.7, lateral ≈ 0.85, vertical ≈ lateral).
- performance.vmax_mps в ядре 0.8.6 не используется (скорости FA:OFF не лимитируются); при необходимости может сохраняться в отдельном блоке legacy.* для справки.
- angularAcceleration_dps2 в 0.6.4 отсутствует: брать из NOMINALS по классу корабля и затем тюнить вручную под ощущения.
- hull:dryMass_t и hull:hull_HP берутся из старого mass/dryMass_t + из баланса.

⚠️ Изменения для Minimal версии:

- Убрать signature_km из миграции (нет системы сканирования).
- Щиты и броня НЕ мигрируются (будут добавлены в M8+ через интерфейсы).
- Тепловые параметры НЕ мигрируются (заглушка: температура = const).

1. Заглушки для будущего расширения (M7+)

Следующие системы реализованы как заглушки с интерфейсами в Minimal версии:

13.1. Примитивный урон (M5)

```csharp
public interface IDamageSystem {
  void ApplyDamage(uint target_id, float damage);
}

// Minimal: фиксированный урон
public class SimpleDamageSystem : IDamageSystem {
  public void ApplyDamage(uint target_id, float damage) {
    target.health.current_HP -= 100.0f;  // константа
  }
}

// Будущее (M9+): P_hit, щиты, броня, калибры
public class AdvancedDamageSystem : IDamageSystem {
  // P_hit, shield penetration, armor reduction, critical hits...
}
```

13.2. Примитивные боты (M5)

```csharp
public interface IBotAI {
  void MakeDecision(GameEntity bot);
}

// Minimal: случайное управление
public class RandomBotAI : IBotAI {
  public void MakeDecision(GameEntity bot) {
    bot.thrust = Random.Range(-1f, 1f);
    bot.yaw_input = Random.Range(-1f, 1f);
  }
}

// Будущее (M10+): тактика, кооперация, уклонение
public class TacticalBotAI : IBotAI {
  // Attack, retreat, patrol, dodge, cooperate...
}
```

13.3. Тепловая модель (заглушка, M1)

```csharp
// Minimal: температура всегда константа
public class SimpleThermalSystem {
  public void Execute() {
    // entity.heat.temperature = 300;  // всегда норма
    // НЕТ нагрева от двигателей
    // НЕТ охлаждения
    // НЕТ перегрева и троттлинга
  }
}

// Будущее (M7+): детальная модель
public class DetailedThermalSystem {
  // Нагрев от двигателей и оружия
  // Охлаждение
  // Перегрев и троттлинг
  // Повреждения от перегрева
}
```

13.4. Щиты и броня (интерфейсы, M8+)

```csharp
// Minimal: НЕ реализовано
// Будущее (M8+): новая концепция
public interface IShieldSystem {
  void AbsorbDamage(uint entity_id, float damage);
}

public interface IArmorSystem {
  float ReduceDamage(uint entity_id, float damage);
}
```

13.5. Система сканирования (M9+)

```csharp
// Minimal: НЕ реализовано
// Будущее (M9+): signature_km, стелс, обнаружение
public interface IScanningSystem {
  bool CanDetect(uint observer_id, uint target_id);
  float GetDetectionRange(uint observer_id, uint target_id);
}
```

1. Changelog v0.8.6 Minimal

**v0.8.6 Minimal (2025-11-17):**

- ✅ Убрано signature_km (нет системы сканирования в M0-M6)
- ✅ Убраны тепловые параметры (заглушка: температура = const)
- ✅ Убраны щиты и броня из спецификации (будут в M8+)
- ✅ hull_HP теперь для примитивного урона (фиксированный)
- ✅ Добавлен раздел "Заглушки для будущего расширения"
- ✅ Фокус на фундамент: FA:ON/OFF + релятивистская физика
- ✅ Минимизация рисков для ИИ-агентов

**v0.8.6 (2025-11-17):**

- Полная спецификация с signature_km, тепловыми параметрами
- Избыточна для минимального подхода

**v0.6.4:**

- Старый формат с performance, control, techLevel

---

## Приоритеты для ИИ-агентов

**Реализовать в M0-M6 (фундамент):**

1. ✅ Релятивистская физика (γ-фактор)
2. ✅ FA:ON vs FA:OFF
3. ✅ Примитивный урон (hull_HP, фиксированный)
4. ✅ Примитивные боты (случайные)
5. ✅ Базовая геометрия и масса

**Отложить до M7+ (расширения):**

1. ⏳ Детальная тепловая модель
2. ⏳ Щиты и броня (новая концепция)
3. ⏳ P_hit и ТТХ оружия
4. ⏳ Система сканирования (signature_km)
5. ⏳ Умные боты с тактикой

**Принцип:** Заглушки с чёткими интерфейсами → легко расширить позже

---

**Конец спецификации v0.8.6 Minimal**
