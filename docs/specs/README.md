# U2 — каталог спецификаций v0.8.x
Тип документа: каталог / индекс  
Версия: 0.8.x (черновик)  
Краткое описание: навигация по актуальным спецификациям U2 и соглашения по именованию файлов в `docs/specs`.  
Связанные документы: [INDEX.md](../INDEX.md)

## Соглашения по названиям файлов
- Все спецификации в этой папке используют префикс `spec_`.
- Слова в имени файла разделяются символом `_`, без пробелов и без кириллицы.
- Версия указывается через суффикс вида `vNN`/`vNNN` (например, `v08`, `v082`, `v086`) и, при необходимости, дополнительные маркеры (`_minimal`, `_stabilized` и т.п.).
- Имя файла отражает область документа (`u2_architecture`, `ship_tech_specs`, `tech_stack_unity` и др.).

Пример: `spec_u2_architecture_v086_minimal.md` — архитектурная спецификация U2 версии 0.8.6 (вариант Minimal).

## Структура каталога
- `gameplay/` — геймплейные спецификации, Definition of Fun, формулы боя и dev‑plan’ы.
- `tech/` — архитектура, технический стек, конфигурация кораблей, визуальный стиль.
- `audit/` — отчёты и планы по аудиту документации (не игровые/технические спецификации).

## Спецификации геймплея (`gameplay/`)
- [gameplay/spec_u2_dev_plan_v086_minimal.md](gameplay/spec_u2_dev_plan_v086_minimal.md) — минимальный dev‑plan для версии 0.8.6, фокус на базовый игровой цикл.
- [gameplay/spec_u2_dev_plan_v086_extended.md](gameplay/spec_u2_dev_plan_v086_extended.md) — расширенный dev‑plan и геймдизайн 0.8.6 (детализация флоу, HUD, прогрессия).
- [gameplay/spec_u2_combat_formulas_v08.md](gameplay/spec_u2_combat_formulas_v08.md) — базовые формулы урона/точности и зависимость от дистанции для U2 v0.8.
- [gameplay/spec_definition_of_fun_v082_stabilized.md](gameplay/spec_definition_of_fun_v082_stabilized.md) — Definition of Fun и ТЗ режима Stabilized для версии 0.8.2.

## Технические спецификации (`tech/`)
- [tech/spec_u2_architecture_v086_minimal.md](tech/spec_u2_architecture_v086_minimal.md) — архитектура U2 v0.8.6 Minimal (клиент/сервер, основные подсистемы).
- [tech/spec_ship_tech_specs_v086_minimal.md](tech/spec_ship_tech_specs_v086_minimal.md) — технические характеристики кораблей и runtime‑конфиг (Minimal).
- [tech/spec_u2_tech_stack_unity_v086.md](tech/spec_u2_tech_stack_unity_v086.md) — технологический стек, платформа и инфраструктура (Unity, .NET, ECS и сопутствующие сервисы).
- [tech/spec_u2_visual_style_unity.md](tech/spec_u2_visual_style_unity.md) — визуальный стиль, артовое и UI‑ТЗ для аркадного Space Simulator в Unity.

## Папка `audit/`
Подпапка [`audit/`](audit/README.md) содержит отчёты и планы по аудиту документации:
- `u2-audit-report.md`, `u2-audit-summary.md`, `u2-risk-matrix.md`, `u2-action-plan.md` и др.

Эти файлы описывают состояние документации, риски и планы улучшений, а не игровые/технические спецификации сами по себе.

