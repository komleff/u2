# U2 — Pilot Assist (Coupled)
Статус: актуален (ветка 0.6.x)
Версия: 0.6.4 (резюме)
Источник: [u_2_pilot_assist_v_0_6.md](../archive/u_2_pilot_assist_v_0_6.md)

## Обзор
Режим Coupled — стабилизированный полёт с автоматическим удержанием курса и ограничениями по ускорениям/скольжению. Поддерживается «наведение» через `yaw lead` и сглаживание команд.

## Термины и обозначения
- `v` — вектор скорости, `fwd/right` — оси корпуса;
- `beta` — боковое скольжение (угол между `v` и продольной осью);
- `v_cmd` — целевая скорость/направление; `v_lim` — лимит скорости;
- LPF — низкочастотный фильтр; `slerp` — сферическая интерполяция;
- `jerk` — производная ускорения (ограничиваем для плавности);
- `cap_main` — доступный продольный «бюджет» ускорения.

## Требования (кратко)
- Удерживать курс и ограничивать боковое скольжение до порога;
- Плавное продольное ускорение (ограничение `jerk`),
- Режимы Brake/Boost влияют на лимит скорости;
- Телеметрия для HUD (углы, лимиты, cap, фильтрованные величины).

## Алгоритмы / Модель (резюме)
1) Курс и упреждение (yaw lead):
   - `dir_course = LPF(normalize(v), tau_course)`;
   - `yaw_lead = k_lead * beta_yaw + k_ff * dot(v_cmd - v, right) / max(|v|, eps)`;
   - `dir_steer = rotate(fwd, yaw_lead)`;
   - смешивание: `dir_target = slerp(dir_course, dir_steer, w_steer(|turn|, |v|))` + `oversteer_bias`.
2) Угловая стабилизация: `alpha_cmd = align(theta, dir_target, stab_gain) + k_omega * (omega_target - omega)`.
3) Боковое скольжение: ПИД по `beta` + корректировка по `dv_lat = dot(v_cmd - v, right)` с насыщением по `caps.lat_mps2`.
4) Продольное ускорение: `cap_main = assist.cap_main_coupled * caps.long_mps2 * f_cap(|e_beta|, |omega|)`;
   - `ax_star = throttle * cap_main`, `ax = jerk_limited(ax_prev → ax_star, jerk_max)`;
5) Ограничение скорости: `v_lim_f = LPF(v_lim, tau_vlim)`; при `|v| > v_lim_f` — ограничить `ax ≤ 0` (кроме намеренных режимов).

### Псевдокод Coupled Assist
```javascript
function coupledAssist(dt, state, input, cfg) {
  const { v, omega, axes, caps, vCmd, vLim, boost, brake } = state;
  const { fwd, right } = axes;
  const s = cfg.coupled;

  // 1) Курс и упреждение yaw
  const dir_course = LPF(normalize(v), s.tau_course);
  const yaw_lead = s.k_lead * omega.yaw + s.k_ff * dot(sub(vCmd, v), right) / max(length(v), EPS);
  const dir_steer = rotate(fwd, yaw_lead);
  const w = s.w_steer(Math.abs(input.turn), length(v));
  let dir_target = slerp(dir_course, dir_steer, w);
  dir_target = normalize(dir_target + s.oversteer_bias * right);
  const alpha_cmd = align(state.theta, dir_target, s.stab_gain) + s.k_omega * (state.omegaTarget - omega);

  // 2) Боковое скольжение beta
  const beta = atan2(dot(v, right), dot(v, fwd));
  const betaStar = clamp(s.beta_base + s.k_input * input.turn, -deg2rad(s.slip_lim_deg), deg2rad(s.slip_lim_deg));
  const eBeta = betaStar - beta;
  let ay = clamp(s.kp_beta * eBeta + s.kd_beta * deriv(eBeta, dt), -caps.lat, caps.lat);
  if (vCmd) {
    const dvLat = dot(sub(vCmd, v), right);
    ay += clamp(s.kp_lat * dvLat + s.kd_lat * deriv(dvLat, dt), -caps.lat, caps.lat);
  }

  // 3) Продольное ускорение и jerk-лимит
  const capMain = s.cap_main_coupled * caps.long * s.f_cap(Math.abs(eBeta), length(omega));
  const axStar = input.throttle * capMain;
  const ax = jerkLimit(state.axPrev, axStar, s.jerk_max, dt);

  // 4) Лимит скорости
  let vLimF = LPF(vLim, s.tau_vlim);
  if (brake || boost) vLimF = vLim;
  const speed = length(v);
  const axOut = speed > vLimF ? Math.min(ax, 0) : ax;

  return { ax: axOut, ay, az: 0, alpha_cmd };
}
```

## Данные и конфигурация
- Параметры Assist: `beta_base`, `k_lead`, `k_ff`, `jerk_max`, `tau_course`, `tau_vlim`, `w_steer`, `f_cap`, `stab_gain`, `k_omega`, ПИД‑наборы по `beta` и `dv_lat`;
- Капы корабля: `caps.long_mps2`, `caps.lat_mps2`;
- HUD: `beta`, `beta*`, `|e_beta|`, `yaw_lead`, `cap_main_eff`, `ax`, `ay`, `v_lim_f`, `jerk_state`.

## Тесты и верификация
- Переходы (PA‑8..PA‑11): время стабилизации по `beta*`, S‑манёвр, выход на целевую скорость, реакция на превышение `beta*`;
- Проверки лимитов ускорения и `jerk`, корректная работа `v_lim_f`.

## Changelog
- 0.6.4: уточнён `yaw lead`, добавлен LPF на лимит скорости, расширена телеметрия HUD, набор параметров Assist.

---

## Приложение A — полный текст источника (v0.6.x)


---

## Приложение A — полный текст источника (v0.6.x)

# U2 — Pilot Assist
**Версия:** 0.6.4  
**Дата:** 2025‑11‑09  
**Статус:** RC  
**Совместимость:** ShipConfig ≥ 0.6, AppConfig ≥ 0.5.3  

---

## 0. Changelog (0.6.3 → 0.6.4)
- Режим **Coupled** переведён с логики «нос по фактической скорости» на «управляемый занос» с целевым углом скольжения β*.
- Добавлены опережение по рысканию (**yaw lead**), предсказание курса и смешивание рулёжного и курсового направлений.
- Продольная тяга теперь задаётся **целевым ускорением** с **джерк‑лимитом**, а не прямой коррекцией скорости.
- Введён **динамический cap_main** в зависимости от |β| и |ω|.
- Поперечный контур: PD по β + PD по Δv_lat для устойчивости на низких скоростях.
- Лимитер скорости фильтруется LPF (**v_lim_f**) и синхронизирован с HUD.
- Добавлены телеметрия и новые тесты приёмки (PA‑8…PA‑11).
- Новые параметры Assist: `beta_base`, `k_lead`, `k_ff`, `jerk_max`, `tau_course`, `tau_vlim`, `w_steer`, `f_cap` (с дефолтами по пресетам).

---

## 1. Цель режима Coupled
Имитация управления «спорткаром в контролируемом заносе» для космического ТС: пилот задаёт ускорения газом и рулём, ассист удерживает **целевой слип β*** и ведёт нос вперёд по дуге, не «прилипая» к мгновенной скорости.

---

## 2. Обозначения
- **β** — угол скольжения: `β = atan2( dot(v, right), dot(v, fwd) )` (рад/°).
- **v_cmd** — желаемая скорость по модулю/направлению из внешних систем (автопилот, миссия) — опционально.
- **ω** — вектор угловых скоростей; **ω_yaw** — проекция по рысканию.
- **LPF(x, τ)** — экспоненциальный фильтр первого порядка с постоянной времени τ.
- **slerp(a,b,w)** — сферическая интерполяция направлений.
- **jerk_limited(x→x*, j_max)** — ограничение производной ускорения по модулю j_max.

---

## 3. Алгоритм Coupled
### 3.1. Целевая «траектория носа»
1) Курс по скорости (инерционный ориентир):
```
dir_course = LPF( normalize(v), tau_course )
```
2) Рулёжное опережение по yaw и боковой ошибке скорости:
```
yaw_lead = k_lead * ω_yaw + k_ff * dot(v_cmd - v, right) / max(|v|, ε)
dir_steer = rotate(fwd, yaw_lead)
```
3) Целевое направление носа с учётом ввода пилота:
```
w = w_steer(|input_turn|, |v|)  // 0.2…0.7 по пресетам
 dir_target = slerp( dir_course, dir_steer, w ) + oversteer_bias * right
```
4) Угловая стабилизация с опережением:
```
α_cmd = align(θ, dir_target, stab_gain) + k_omega * (ω_target - ω)
```
Где `ω_target` выводится из динамики `dir_target` (численно).

### 3.2. Управляемый слип β
```
β       = atan2( dot(v, right), dot(v, fwd) )
β_star  = clamp( β_base + k_input * input_turn, ±assist.slip_lim_deg )
e_β     = β_star - β
ay_cmd  = clamp( kp_β*e_β + kd_β*d/dt(e_β), ±caps.lat_mps2 )
```
Дополнительная стабилизация по поперечной Δv на низких скоростях:
```
Δv_lat = dot(v_cmd - v, right)
ay_cmd += clamp( kp_lat*Δv_lat + kd_lat*d/dt(Δv_lat), ±caps.lat_mps2 )
```

### 3.3. Продольная тяга и джерк
```
cap_main = assist.cap_main_coupled * caps.long_mps2 * f_cap(|e_β|, |ω|)
ax_star  = input_throttle * cap_main
ax       = jerk_limited( ax_prev → ax_star, jerk_max )
```
Интерпретация газа: пилот задаёт **ускорение**, а не целевую скорость. Малый P‑по‑скорости допускается для удержания крейса при |v|→0, но с большим τ.

### 3.4. Лимитер скорости
```
v_lim_f = LPF( v_lim, tau_vlim )
if |v| > v_lim_f: ax = min(ax, 0)  // не разгонять сверх лимита
```
При Brake/Boost фильтр можно временно обходить с плавным входом.

---

## 4. Интерфейс и поля конфигурации
### 4.1. Входы
- `input_throttle ∈ [-1,1]`, `input_turn ∈ [-1,1]`.
- `v`, `ω`, оси `fwd/right/up` (локальные), `caps.long/lat_mps2`.
- Опционально: `v_cmd`, `v_lim`, режимы Boost/Brake.

### 4.2. Выходы
- Команды ускорений в СК корабля: `ax, ay, az` (обычно az=0 в плоской модели) и угловые `α_cmd`.

### 4.3. AssistConfig.Coupled (новые и существующие)
| Поле | Тип | Диапазон | Назначение | Дефолт |
|---|---|---|---|---|
| `slip_lim_deg` | float | 2…30° | Жёсткий лимит | 15° |
| `beta_base` | float | −5…+5° | Базовый слип | 0° |
| `k_input` | float | 0.5…1.5 | Вклад руля в β* | 1.0 |
| `k_lead` | float | 0…2 | Опережение по ω_yaw | 0.6 |
| `k_ff` | float | 0…2 | Feed‑forward по Δv_lat | 0.3 |
| `kp_β` | float | 0.5…6 | P по e_β | 2.0 |
| `kd_β` | float | 0…2 | D по e_β | 0.6 |
| `kp_lat` | float | 0…6 | P по Δv_lat | 1.2 |
| `kd_lat` | float | 0…2 | D по Δv_lat | 0.3 |
| `cap_main_coupled` | float | 0.2…1.2 | Доля продол. капы | 0.9 |
| `jerk_max` | float | ≥0 | Лимит рывка (m/s³) | 12 |
| `tau_course` | float | 0.1…1.0 s | LPF по курсу | 0.35 s |
| `tau_vlim` | float | 0.1…1.0 s | LPF лимитера | 0.4 s |
| `w_steer()` | curve | [0..1]→[0.1..0.8] | Вес рулёжн. вектора | см. пресеты |
| `f_cap()` | curve | | Снижение капы при |eβ|,|ω| | см. пресеты |
| `oversteer_bias` | float | −0.1…0.1 | Лёгкое «пере» | +0.02 |
| `k_omega` | float | 0…1 | Опережение по ω | 0.25 |

---

## 5. Пресеты по архетипам
| Архетип | β* рабочий | w_steer(|turn|) | f_cap(|eβ|,|ω|) | Примечание |
|---|---|---|---|---|
| **Sport** | 8–18° | 0.3→0.7 | мягкая, −20% при |eβ|>½β* | максимально «скользит», быстрый отклик |
| **Muscle** | 6–12° | 0.25→0.55 | агрессивная, −35% при |eβ|>½β* | инертнее по газу, jerk пониже |
| **Industrial** | 4–9° | 0.2→0.4 | жёсткая, −50% при |eβ|>½β* | безопасный, без резких носовых кивков |
| **Recon** | 10–20° | 0.35→0.7 | мягкая, −15% | манёвренность и удержание дуги |

---

## 6. Телеметрия и HUD
Выводить: `β`, `β*`, `|eβ|`, `yaw_lead`, `cap_main_eff`, `ax`, `ay`, `v_lim_f`, `jerk_state`. Цветовое кодирование при приближении к лимитам.

---

## 7. Тесты приёмки (добавить к существующим)
- **PA‑8**: удержание `β*±2°` при `|v| ∈ [0.2…0.8]·v_lim_f` на постоянном `input_turn` ≥ 0.4.
- **PA‑9**: S‑дуга на `0.6·v_lim_f`: время выхода на новый `β*` ≤ 0.7 s, перерегулирование ≤ 30%.
- **PA‑10**: резкий отпуск руля при `β≈β*`: спад `|β|<3°` за < 1.0 s без разворота носа через курс.
- **PA‑11**: при `|β|>β*+5°` `cap_main_eff` снижается ≥25% в течение 0.2 s.

Методика: фиксированный сценарий, идентичные начальные условия, запись телеметрии на 120 Гц, проверка автоскриптом.

---

## 8. Процедура тюнинга
1) Настроить `tau_course` по ощущению инерции курса.  
2) Подобрать `k_lead`, затем `k_ff`, проверяя PA‑9.  
3) Выставить цели β по архетипам.  
4) Оттюнинговать `kp_β/kd_β` на средних скоростях, затем добавить `kp_lat/kd_lat` для низких.  
5) Задать `jerk_max` под «сцепление» по ощущениям.  
6) Сформовать `f_cap` так, чтобы PA‑11 срабатывал плавно.  
7) Проверить лимитер и HUD.

---

## 9. Псевдокод (референс)
```javascript
function coupledAssist(dt, state, input, cfg) {
  const {v, omega, axes, caps, vCmd, vLim, boost, brake} = state;
  const {fwd, right} = axes;
  const s = cfg.coupled;

  // 1) Курс и рулёжное опережение
  dir_course = LPF(normalize(v), s.tau_course);
  yaw_lead   = s.k_lead * omega.yaw + s.k_ff * dot(sub(vCmd, v), right) / max(length(v), EPS);
  dir_steer  = rotate(fwd, yaw_lead);
  const w    = s.w_steer(abs(input.turn), length(v));
  dir_target = slerp(dir_course, dir_steer, w);
  dir_target = normalize(dir_target + s.oversteer_bias * right);
  alpha_cmd  = align(state.theta, dir_target, s.stab_gain) + s.k_omega * (state.omegaTarget - omega);

  // 2) Управляемый слип β
  const beta    = atan2(dot(v, right), dot(v, fwd));
  const betaStar= clamp(s.beta_base + s.k_input * input.turn, -deg2rad(s.slip_lim_deg), deg2rad(s.slip_lim_deg));
  const eBeta   = betaStar - beta;
  const ayBeta  = clamp(s.kp_beta * eBeta + s.kd_beta * deriv(eBeta, dt), -caps.lat, caps.lat);

  let ay = ayBeta;
  if (vCmd) {
    const dvLat = dot(sub(vCmd, v), right);
    ay += clamp(s.kp_lat * dvLat + s.kd_lat * deriv(dvLat, dt), -caps.lat, caps.lat);
  }

  // 3) Продольная тяга с джерк‑лимитом и динамическим cap
  const capMain = s.cap_main_coupled * caps.long * s.f_cap(abs(eBeta), length(omega));
  const axStar  = input.throttle * capMain;
  const ax      = jerkLimit(state.axPrev, axStar, s.jerk_max, dt);

  // 4) Лимитер скорости
  let vLimF = LPF(vLim, s.tau_vlim);
  if (brake || boost) vLimF = vLim; // ослабить фильтр
  const speed = length(v);
  const axOut = speed > vLimF ? Math.min(ax, 0) : ax;

  return {ax: axOut, ay, az: 0, alpha_cmd};
}
```

---

## 10. Краевые случаи
- |v|→0: усиливать вклад Δv_lat‑контуров, удерживать `β*→0`, ограничить `yaw_lead`.
- Докинг: принудительно `β* = 0`, `jerk_max`↓, `cap_main`↓, `tau_course`↑.
- Boost: временно повышать `cap_main`, но фиксировать `β*` и ограничивать `yaw_lead`.
- Brake: `ax≤0`, `w_steer`↓, `β*` стремится к нулю.

---

## 11. Связанные изменения в ShipConfig ≥ 0.6
Добавить секцию `assist.presets.coupled` c профилями `sport/muscle/industrial/recon`. Для каждого: кривые `w_steer` и `f_cap`, целевые диапазоны `β*` и дефолты полей из §4.3.

---

## 12. Статус внедрения
- API не ломает Decoupled.  
- Поведение совместимо с тестовым стендом FlightTest ≥ 0.6.3 (добавить сценарии PA‑8…11).  
- Требуется обновление HUD: новые индикаторы и логирование.



