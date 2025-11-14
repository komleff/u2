# U2 — Flight Dynamics (Decoupled)
Статус: актуален (ветка 0.7.x)
Версия: 0.7.4 (резюме)
Источник: [u_2_v_0_7.md](../archive/u_2_v_0_7.md)

## Обзор
Режим Decoupled — инерциальный полёт: управление импульсами тяги и RCS без автоматической стабилизации курса. Фокус на расчётах инерций, доступных капов по ускорениям/угловым скоростям и бюджете микродвигателей.

## Термины и обозначения
- `ShipConfig` — схема параметров корабля (0.7.x);
- Классификация: `snub|small|medium|heavy|capital`, тип, stealth;
- Геометрия: `length_m`, `width_m`, `height_m`; масса: `dry_t`;
- Сигнатуры: `IR/EM/CS` (1–5);
- Производительность: `accel_fwd_mps2`, `strafe_mps2{x,y,z}`, `omega_cap_dps{pitch,yaw,roll}`.

## Требования (кратко)
- Расчёт предельных угловых скоростей на основе инерций и бюджета RCS;
- Связь `main_thrust_MN = dry_t * accel_fwd_mps2 / 1000`;
- Определение `rcs_budget_MN = main_thrust_MN * ratio(size)` (snub/small/medium=0.30, heavy/capital=0.20);
- Корректная аппроксимация моментов инерции для прямоугольного параллелепипеда.

## Модель и формулы (резюме)
- Моменты инерции (кг·м²):
  - `Ix = (1/12) m (h^2 + l^2)`, `Iy = (1/12) m (w^2 + l^2)`, `Iz = (1/12) m (w^2 + h^2)`;
  - где `m = dry_t * 1000`, `l/w/h` — длина/ширина/высота (м).
- Плечи для RCS:
  - `r_pitch ≈ 0.5 * width`, `r_yaw ≈ 0.5 * length`, `r_roll ≈ 0.5 * height`.
- Моменты/угловые ускорения:
  - `Torque_axis (N·m) = (rcs_axis_MN * 1e6) * r_axis`;
  - `alpha_axis = Torque_axis / I_axis`;
  - связь с `omega_cap_dps` через интеграцию/каппинг.
- Продольная тяга/страйф: проверка целевых `m/s²` для классов/пресетов.

### Пример расчёта (набросок)
```
Вход: class=small, dry_t=18 т, l=22 м, w=16 м, h=6 м,
      accel_fwd=18 m/s² → main_thrust = 18*18/1000 = 0.324 MN,
      ratio(size=small)=0.30 → rcs_budget=0.0972 MN.

Инерции (кг·м²):
  m = 18000
  Ix = 1/12 * 18000 * (6^2 + 22^2)  = 1/12 * 18000 * (36 + 484) = 1/12 * 18000 * 520 = 780000
  Iy = 1/12 * 18000 * (16^2 + 22^2) = 1/12 * 18000 * (256 + 484) = 1/12 * 18000 * 740 = 1,110,000
  Iz = 1/12 * 18000 * (16^2 + 6^2)  = 1/12 * 18000 * (256 + 36)  = 1/12 * 18000 * 292 = 438,000

Плечи: r_pitch=0.5*w=8 м; r_yaw=0.5*l=11 м; r_roll=0.5*h=3 м.
Допустим, распределение RCS по осям равное (по 1/3):
  rcs_axis = 0.0972/3 MN → 0.0324e6 N на ось.
  Torque_yaw = 0.0324e6 * 11 ≈ 356,400 N·m → alpha_yaw = 356,400 / 1,110,000 ≈ 0.321 rad/s².

Далее выводим cap по угл. скорости `omega_cap_dps` по ограничениям дизайна класса.
```

## Данные и конфигурация
- `ShipConfig` v0.7.4: схема полей, единицы измерения, допустимые диапазоны;
- Пресеты: `Sport|Rally|F1|Truck|Industrial|Warship|Liner|Balanced|Recon` (назначение и типичные капы);
- Правила валидаторов (warning при геометрических/массовых несоответствиях).

## Тесты и верификация
- Согласованность инерций, соответствие капов `omega_cap_dps` ожиданиям;
- Консистентность `main_thrust/rcs_budget` с заданными `accel/strafe`;
- Границы классов по габаритам и массе.

## Changelog
- 0.7.4: уточнение формул инерций, бюджетов RCS, добавлены пресеты и валидаторы.

---

## Приложение A — полный текст источника (v0.7.x)


---

## Приложение A — полный текст источника (v0.7.x)

# ТЗ: обновление ТТХ кораблей, номиналов, редактора и флай‑теста (U2 v0.7.4, decoupled)

## 1. Цели и рамки
- Ввести эталонные ТТХ без ограничений скорости (нет `SCM/Vmax`).
- Перейти на физически однозначные параметры: линейные ускорения и бюджет RCS вместо угловых скоростей как первичных величин.
- Обновить ShipConfig, Nominals, ShipEditor и FlightTest под режим **decoupled**.  
- Режимы **break**/**coupled**: только хуки и метрики в FlightTest; параметры ассистов добавим отдельной версией (0.7.5+).

## 2. Версионирование и артефакты
- **ShipConfig**: `schema` v0.7.4  
- **Nominals**: v0.7.4 (decoupled) — подготовленные файлы:  
  `U2_Nominals_v0.7.4_decoupled.json`, `U2_Nominals_v0.7.4_decoupled.csv`, `nominals.v0.7.4.js`  
- **ShipEditor**: v0.7.4  
- **FlightTest**: v0.7.4

## 3. Параметрическая модель ТТХ (decoupled)

### 3.1 Обязательные поля (на корабль)
- `classification`: `{ size: snub|small|medium|heavy|capital, type: <архетип>, stealth: standard|stealth }`
- `geometry`: `{ length_m, width_m, height_m }`
- `mass`: `{ dry_t }`  — *сухая масса* (для фрейтеров/танкеров учитывать пустой объём)
- `signatures`: `{ IR, EM, CS }` — шкала 1–5 (реф.)
- `performance`:
  - `accel_fwd_mps2`
  - `strafe_mps2`: `{ x, y, z }`
  - `omega_cap_dps`: `{ pitch, yaw, roll }` — **лимиты** (не первичная физика)
- `propulsion`:
  - `main_thrust_MN` = `dry_t * accel_fwd_mps2 / 1000`
  - `rcs_budget_MN` = `main_thrust_MN * ratio(size)`; ratio: snub/small/medium = 0.30; heavy/capital = 0.20
- `payload`: `{ cargo_scu, crew }`
- `weapons`: `{ summary }`
- `preset`: `Sport|Rally|F1|Truck|Industrial|Warship|Liner|Balanced|Recon`

### 3.2 Размерные классы: контроль габаритов (валидатор редактора)
- **snub**: L≤15, W≤12, H≤5  
- **small**: L 16–35, W 12–24, H 4–10  
- **medium**: L 36–80, W 20–40, H 8–18  
- **heavy**: L 81–150, W 35–70, H 15–35  
- **capital**: L≥150 (типовые поддиапазоны по архетипам)
- Если габариты выходят за диапазон выбранного размера — **warning** (не запрет), с подсветкой.

### 3.3 Угловая динамика (для симулятора/тестов)
- Момент инерции для прямоугольного параллелепипеда:
  - `Ix = (1/12) m (h^2 + l^2)`, `Iy = (1/12) m (w^2 + l^2)`, `Iz = (1/12) m (w^2 + h^2)`, где m= `dry_t*1000` кг, l/w/h — в метрах.
- Преобразование RCS-бюджета в доступный крутящий момент по осям:
  - Распределить `rcs_budget_MN` на оси (по умолчанию равномерно 1/3).  
  - Рычаг по оси: `r_pitch ≈ 0.5*width`, `r_yaw ≈ 0.5*length`, `r_roll ≈ 0.5*height`.  
  - `Torque_axis (N·m) = (rcs_axis_MN * 1e6) * r_axis`  
  - Угл. ускорение: `alpha_axis = Torque_axis / I_axis` (рад/с²); ограничить `omega_cap_dps` в рантайме.
- Стрейфы — применяются как чистые линейные ускорения по локальным осям.

## 4. Архетипы/пресеты (ключевые)
- **Industrial**: miner, salvager, repair — приоритет точности на низких скоростях, высокие `strafe` (особенно `x,z`), умеренный `accel_fwd`.
- **Truck**: freighter, tanker, dropship — низкие `strafe`/угл. манёвренность, линейный разгон умеренный.
- **Sport/Rally/F1**: fighter/interceptor/courier — высокий `accel_fwd` и `strafe`, tight `omega_cap`.
- **Warship**: gunship/bomber/corvette/frigate/destroyer/carrier/dreadnought — низкие ускорения, акцент на RCS‑момент/стабильность.
- **Liner**: passenger — комфорт, низкие ускорения.
- **Balanced**: shuttle/exploration — средние значения.
- **Recon**: recon/stealth — пониженные сигнатуры (-1 к IR/EM/CS), сглаженные лимиты.

## 5. ShipConfig v0.7.4 — изменения схемы

### 5.1 Что удалить
- `performance.scm_mps` — удалить
- `performance.vmax_mps` — удалить

### 5.2 Что добавить/уточнить
```json
{
  "classification": { "size": "snub|small|medium|heavy|capital", "type": "string", "stealth": "standard|stealth" },
  "performance": {
    "accel_fwd_mps2": "number",
    "strafe_mps2": { "x": "number", "y": "number", "z": "number" },
    "omega_cap_dps": { "pitch": "number", "yaw": "number", "roll": "number" }
  },
  "propulsion": {
    "main_thrust_MN": "number",
    "rcs_budget_MN": "number"
  }
}
```

### 5.3 Миграция 0.6 → 0.7.4 (авто)
- Если в конфиге были `scm_mps`/`vmax_mps` — игнорировать, не сохранять.
- Если нет `propulsion` — вычислить по формулам (п.3.1).
- Если нет `strafe_mps2` — задать равным 0.8…1.0 от `accel_fwd_mps2` для легких/спортивных; 0.5…0.7 — для Truck/Warship; 0.6…0.8 — для Balanced/Industrial (см. номиналы).
- `omega_cap_dps` — если отсутствует: для small 70/70/120; medium 40/40/80; heavy 25/16/25; capital 18/12/20 (типовые, затем тюнить под архетип).

## 6. ShipEditor v0.7.4 — доработки

### 6.1 UI/формы
- Удалить поля `SCM`/`Vmax`.
- Группы:
  - **Classification**: `size` (обяз.), `type` (обяз.), `stealth` (toggle).
  - **Geometry** + **Size Check**: подсказка/индикатор соответствия размерам (warning, если вне диапазона).
  - **Mass/Propulsion**: `dry_t`, readonly расчёт `main_thrust_MN`, `rcs_budget_MN` (с кнопкой «разблокировать для ручного ввода»).
  - **Performance**: `accel_fwd_mps2`, `strafe.{x,y,z}`, `omega_cap_dps.{pitch,yaw,roll}`.
  - **Signatures**, **Payload**, **Weapons**, **Preset**.
- Кнопки:
  - **Apply Nominal**: заполнить по `size+type(+stealth)`; режимы `fill-empty` и `overwrite`.
  - **Stealth Variant**: применить -1 к IR/EM/CS, `stealth=stealth`.
  - **Recompute Propulsion**: пересчитать из `dry_t` и `accel_fwd_mps2`.

### 6.2 Валидации
- Обязательность: `size`, `type`, `dry_t`, `accel_fwd_mps2`.
- Диапазоны: неотрицательные ускорения; сигнатуры 1–5.
- Соответствие габаритов размеру (warning).
- Предупреждение при изменении `dry_t` без пересчёта `propulsion`.

### 6.3 Номиналы/пресеты
- Подключить `nominals.v0.7.4.js`:
  - `getNominals(size,type,isStealth)`; `applyNominals(ship, mode)`.
- В выпадающем списке `type` — унифицированные архетипы (формат *size type* в каталоге, но в UI отдельные поля).

### 6.4 Экспорт/импорт
- Экспорт по схеме 0.7.4.
- Импорт 0.6: прогон через мигратор; лог миграции (какие поля отброшены/восстановлены).

## 7. FlightTest v0.7.4 — сценарии и метрики

### 7.1 Инструменты
- Панель телеметрии: `v (м/с)`, `a_inst (м/с²)`, `a_cmd (м/с²)`, `a_err`, `strafe_xyz`, `omega (°/с)`, `alpha (°/с²)`, `thrust_main (MN)`, `rcs_used (MN)`, `mass_dry (т)`.
- Лог CSV: 100 Гц, с GUID корабля/конфига.

### 7.2 Тест-кейсы (decoupled)
1) **Линейный разгон**: 0→ заданный `a_cmd`; допуск `|a_inst - accel_fwd_mps2| ≤ 5%` после 0.5 с.
2) **Стрейф**: по каждой оси x/y/z; допуск `±5%`.
3) **Повороты (RCS)**: задать шаговый момент по каждой оси; измерить `alpha` и сравнить с расчётом (п.3.3); допуск `±10%` (из-за дискретного рычага).
4) **Комбинации**: разгон + поворот; проверка отсутствия несанкционированных кросс-осевых насыщений RCS (не более 20% просадки заявленного `alpha`).
5) **Break (инструментальная проверка)**: команда «Full Stop» — линейная скорость → 0 при полном использовании `main_thrust_MN` и RCS; зафиксировать пиковые `a_inst`.  
   Метрика: время остановки `t_stop ≈ v0 / accel_fwd_mps2` (±10%). Если включён форсаж-брейк (см. хук ниже) — пик `a_inst` может превысить `accel_fwd_mps2` по коэффициенту `overdrive`.

### 7.3 Хуки под ассисты (без реализации логики)
- В `assist` добавить необязательные поля (пока не отображать в UI, только в JSON):
```json
"assist": {
  "break": { "overdrive_factor": 1.0, "g_limit": 8.0 },
  "coupled": {
    "slip_limit_deg": 10,
    "yaw_bias": 0.0,
    "turn_in_gain": 0.6,
    "stability_gain": 0.8
  }
}
```
- В FlightTest добавить переключатели «логировать цели ассиста» и графы отклонений (для будущей версии).

### 7.4 Критерии приёмки (FlightTest)
- Все кейсы 1–4 укладываются в допуски.  
- Кейc 5 логирует пики и оценивает `t_stop` по формуле (±10%).  
- CSV содержит колонки с исходными/расчётными значениями и флагом «pass/fail».

## 8. Номиналы v0.7.4 — содержимое и применение
- Эталонные строки на все основные сочетания **size+type** (small/medium/heavy/capital + fighter/interceptor/courier/freighter/miner/tanker/gunship/bomber/dropship/salvager/repair/passenger/exploration/corvette/frigate/destroyer/carrier/dreadnought/shuttle).  
- Для `stealth` применять автоматическое снижение сигнатур (-1 к IR/EM/CS, минимум 1).  
- Кнопка Apply в редакторе: `fill-empty` по умолчанию; `overwrite` — с подтверждением.

## 9. Проверки качества и регресс
- **JSON-валидация** по схеме 0.7.4 (CI).  
- Юнит-тест расчёта `propulsion` из массы/ускорения.  
- Юнит-тест конвертации `rcs_budget_MN` → `alpha` vs инерция (математика из п.3.3).  
- Снапшот-тест мигратора (0.6→0.7.4) на репрезентативных конфигах.  
- Ручные кейсы FlightTest по списку 7.2.

## 10. Изменения в репозитории
- `config/shipconfig.schema.json` → v0.7.4  
- `js/nominals.js` → заменить на `nominals.v0.7.4.js`  
- `js/migrate.js` → добавить путь 0.6→0.7.4  
- `js/validator.js` → новые правила (размер/габариты, диапазоны)  
- `js/app.js` / UI → убрать `SCM/Vmax`, добавить группы и кнопки (п.6.1–6.3)  
- `flight_test/` → панель телеметрии, логгер, сценарии (п.7)  
- `docs/` → README для 0.7.4 (изменения полей, методика тестов)

## 11. Критерии приёмки (общие)
- Редактор сохраняет/открывает конфиги 0.7.4; мигрирует 0.6 без ошибок; валидатор корректно предупреждает по габаритам и диапазонам.  
- Применение номинала приводит к заполнению всех обязательных полей и корректному пересчёту `propulsion`.  
- FlightTest подтверждает заявленные ускорения/стрейфы/угловые ускорения в допусках.  
- В репозитории присутствуют все артефакты v0.7.4 и документация изменений.

—
При необходимости — мини‑спецификация ассистов (break/coupled) для 0.7.5 в том же формате.



