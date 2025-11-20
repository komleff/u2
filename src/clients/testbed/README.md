# Testbed Clients

Экспериментальные клиенты, созданные различными AI агентами для тестирования и сравнения подходов к реализации Stage 1 (M2.3).

## Структура

### `chatgpt-vite/` ✅ Production-ready
**AI Model**: ChatGPT (Codex 5.1 Max)  
**Tech Stack**: Vite + TypeScript + Canvas 2D  
**Status**: ✅ Merged to main  
**Оценка**: 9.5/10

**Особенности**:
- Client-side prediction с reconciliation
- Latency-tested (50ms/200ms RTT)
- 8 unit tests + 3 integration tests
- Bundle: 93.5 KB (20.2 KB gzip)

**Запуск**:
```bash
cd src/clients/testbed/chatgpt-vite
npm install
npm run dev
```

**Multiplayer**: ✅ Два клиента работают синхронно на одном сервере

---

### `claude-canvas/` 🔍 Under Review
**AI Model**: Claude Sonnet 4.5  
**Branch**: `copilot/setup-basic-client-build`  
**Status**: ⏳ Awaiting review

---

### `gemini-react/` ⏸️ Incomplete
**AI Model**: Gemini 3 Pro  
**Branch**: `copilot/create-basic-client-build`  
**Status**: ⚠️ Недоделан

---

## Правила наименования

Формат для testbed клиентов:
```
{ai-model}-{tech-stack}/
```

Примеры:
- `chatgpt-vite` — ChatGPT + Vite + TypeScript
- `claude-canvas` — Claude + Canvas 2D
- `gemini-react` — Gemini + React
- `copilot-threejs` — GitHub Copilot + Three.js
- `gpt4-phaser` — GPT-4 + Phaser

---

## Запланированные production клиенты

После завершения Stage 1 тестирования будут созданы:

- `src/clients/desktop-standalone/` — Unity/Godot (M6)
- `src/clients/web-client/` — WebGL build

---

**Обновлено**: 2025-11-21  
**Документация**: `/docs/`
