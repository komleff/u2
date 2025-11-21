# Каталог документации U2

Этот файл — навигационный индекс по документации проекта **Universe Unlimited (U2)**.

## Содержание

- [GDD — Game Design Documents](#gdd--game-design-documents)
- [Specs — технические спецификации](#specs--технические-спецификации)
- [PvE — режимы pve](#pve--режимы-pve)
- [Guides — руководства](#guides--руководства)
- [Конвертированные документы](#конвертированные-документы)
- [Архив](#архив)
- [С чего начать](#с-чего-начать)

---

## GDD — Game Design Documents

### Директория `gdd/`

- **`gdd/gdd_overview.md`** — общий геймдизайн‑обзор U2: цели проекта, целевая аудитория, базовые игровые петли.

---

## Specs — технические спецификации

### Директория `specs/`

#### Полётные режимы

- **`specs/spec_pilot_assist_coupled.md`** — спецификация полёта в режиме Coupled (пилот‑ассист).
- **`specs/spec_flight_decoupled.md`** — спецификация Decoupled‑полёта и связанного управления.

#### Спецификации ветки v0.8.x

Геймплей и Definition of Fun:

- **`specs/gameplay/spec_u2_dev_plan_v086_minimal.md`** — Minimal dev‑plan U2 v0.8.6 (базовый игровой цикл, минимальный объём реализации).
- **`specs/gameplay/spec_u2_dev_plan_v086_extended.md`** — расширенный dev‑plan и геймдизайн 0.8.6 (HUD, прогрессия, сценарии).
- **`specs/gameplay/spec_u2_combat_formulas_v08.md`** — формулы боя: точность, урон, влияние дистанции для версии 0.8.
- **`specs/gameplay/spec_definition_of_fun_v082_stabilized.md`** — Definition of Fun и ТЗ режима Stabilized (v0.8.2).

Архитектура, стек и контент:

- **`specs/tech/spec_u2_architecture_v086_minimal.md`** — архитектура U2 v0.8.6 Minimal (клиент/сервер, подсистемы, границы).
- **`specs/tech/spec_ship_tech_specs_v086_minimal.md`** — технические характеристики кораблей и runtime‑конфигурация.
- **`specs/tech/spec_u2_tech_stack_v086.md`** — технологический стек U2 (TypeScript/Unity, .NET, сеть, логирование и др.).
- **`specs/tech/spec_u2_client_typescript.md`** — детальная спецификация TypeScript-клиента (Three.js, Protobuf, WebSocket).
- **`specs/tech/spec_u2_visual_style_unity.md`** — визуальный стиль, UI/HUD, art‑direction для Unity‑версии.

#### Аудит документации

- **`specs/audit/README.md`** — как читать отчёты по аудиту документации.
- **`specs/audit/u2-audit-summary.md`** — краткое резюме аудита документации v0.8.6.
- **`specs/audit/u2-audit-report.md`** — подробный отчёт по аудитам архитектуры и dev‑plan’а.
- **`specs/audit/u2-action-plan.md`** — план действий по результатам аудита.
- **`specs/audit/u2-risk-matrix.md`** — риск‑матрица по документации и процессам.
- **`specs/audit/documentation-revision-report.md`** — отчёт о ревизии документации.

Более подробный каталог спецификаций — в файле `specs/README.md`.

---

## PvE — режимы PvE

### Директория `pve/`

Общие обзоры:

- **`pve/pve_systems_overview.md`** — обзор PvE‑систем и их связи с общей архитектурой.

Аналитика и аудитория:

- **`pve/pve_campaigns_analysis.md`** — анализ PvE‑кампаний и сценариев.
- **`pve/pve_audience_types.md`** — типология аудитории для PvE‑режимов.
- **`pve/pve_space_sims_review.md`** — обзор референсных космических симуляторов с точки зрения PvE.

---

## Guides — руководства

### Директория `guides/`

Содержит рабочие гайды по процессам, пайплайнам и инструментам (например, ответы на вопросы «как запускать тесты», «как собирать сборку», «как оформлять новые спеки»).

Структура постепенно уточняется; перед правками сверяйтесь с актуальной версией репозитория.

---

## Конвертированные документы

### Директория `_converted/`

Документы, полученные конвертацией из PDF/DOCX:

- **`_converted/moscow.md`** — матрица MoSCoW для основных требований.
- **`_converted/moscow-pve.md`** — MoSCoW‑приоритезация для PvE.
- **`_converted/pve.md`** — исходный PvE‑документ (описание режимов и сценариев).
- **`_converted/mmo.md`**, **`_converted/mmo-2.md`** — заметки по MMO‑подходам.
- **`_converted/document.md`**, **`_converted/document-2.md`** — общие заметки по документации и структуре требований.

Оригиналы этих документов, как правило, хранятся вне `docs/` и могут содержать дополнительные разделы.

---

## Архив

### Директория `archive/`

Здесь лежат:

- устаревшие версии спецификаций (архитектура v0.8, старые Definition of Fun и т.п.);
- промежуточные версии GDD/PvE‑документов;
- вспомогательные материалы, которые не используются напрямую в текущей разработке.

Основные точки входа:

- **`ARCHIVE.md`** — обзор содержимого архива;
- **`archive/README.md`** — подробный каталог архивных файлов.

---

## С чего начать

Если вы впервые заходите в документацию U2 и хотите быстро понять проект:

1. **Общий контекст**
   - `gdd/gdd_overview.md` — обзор целей проекта и базовых игровых петель.
2. **Полёт и управление**
   - `specs/spec_pilot_assist_coupled.md` — режим Coupled.
   - `specs/spec_flight_decoupled.md` — режим Decoupled.
3. **Архитектура и техстек**
   - `specs/tech/spec_u2_architecture_v086_minimal.md` — архитектура 0.8.6 Minimal.
   - `specs/tech/spec_u2_tech_stack_v086.md` — технологический стек.
   - `specs/tech/spec_u2_client_typescript.md` — TypeScript-клиент.
4. **Геймплей и боёвка**
   - `specs/gameplay/spec_u2_dev_plan_v086_minimal.md` — минимальный dev‑plan.
   - `specs/gameplay/spec_u2_combat_formulas_v08.md` — формулы боя.
   - `specs/gameplay/spec_definition_of_fun_v082_stabilized.md` — Definition of Fun для Stabilized.
5. **PvE‑режимы**
   - `pve/pve_systems_overview.md` — обзор PvE‑систем.
   - `pve/pve_campaigns_analysis.md` — анализ кампаний и сценариев.

Перед созданием новых документов или крупных правок обязательно сверяйтесь с `STYLE.md` и `specs/README.md`, чтобы сохранять единый стиль и структуру.
