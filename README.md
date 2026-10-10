# crystal-ball-frontend

Next.js (App Router) + React + TypeScript (strict) + Tailwind UI for the **OomniEye Approvals assistant**. It was built for the Crystal Ball *Sr. Fullstack Developer — MERN + AI (Wave 2)* take-home.

The page recreates the reference *Approvals & Review* screen: the pending-approvals table plus the AI assistant widget in the lower right. All five assistant actions stream from `crystal-ball-backend` over SSE. The frontend is an independent repository; it calls the backend only over HTTP and holds no AI keys.

> The architecture, the 150–250-word AI/fallback note and the API reference live in the backend README.

## Setup

```bash
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3000 (start crystal-ball-backend first)
```

Production: `npm run build && npm start`.

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend base URL. Public by design: it is a URL, not a secret |

## What's on the page

- **Dashboard:**
  - header, icon rail and search, which filters by title, type, submitter or date
  - the *Pending approval requests* table (type pill, submitter, date, status)
  - loading skeleton, empty state, and an error state with a retry button
- **Assistant widget**, matching the reference layout:
  - **header:** avatar, title, ⓘ info (explains AI vs. fallback), expand/shrink, close
  - **sub-bar:** breadcrumb and back, plus **Replay Greeting**
  - **greeting banner and 2×2 action cards:** *Present me Summary*, *Talk to me*, *Help me*, *Teach me*
  - **footer:** the pending count
  - **floating button** to close and reopen the widget
- **Views:**
  - **Greeting:** plays when the panel opens; each replay makes a fresh backend request.
  - **Summary:** renders the validated structured summary (count, overview, suggested order, recommendations, and the "not an official urgency" note). It is the one action that doesn't stream tokens: a loading state shows until the complete summary has passed Zod and data checks (see "Streaming exception" in the backend README). No typing effect is simulated.
  - **Talk / Help / Teach:** multi-turn conversations with starter prompts, a token-by-token caret, a **Stop** button, and per-message **Try again**. *Help* shows the verified policy citations. *Teach* starts the lesson automatically.
- **Labelled fallbacks:** any answer the backend marks `source: "fallback"` gets an **Offline answer** badge. Its tooltip gives the reason, so a fallback is never presented as AI output.

## Structure

```
app/                       layout, page (renders ApprovalsDashboard)
components/approvals/      ApprovalsDashboard, ApprovalsTable, ApprovalRow
components/assistant/      AssistantPanel, AssistantHeader, AssistantActions, GreetingBanner,
                           SummaryView, ChatMessages, ChatInput, StreamingMessage
components/ui/             ErrorNotice, Thinking, SourceBadge
hooks/useApprovals.ts      approvals fetch with loading / error / reload
store/assistantStore.ts    Zustand: panel state, session, greeting, summary, per-action threads, cancel/retry
lib/sse.ts                 incremental SSE parser for fetch streams
lib/api.ts                 fetchApprovals, streamAiAction, typed ApiError
lib/contracts.ts           Zod copy of the backend contract
lib/session.ts             per-page-load session id (conversations start fresh on reload) and browser language
contract/api-contract.json JSON Schema exported by the backend (drift check)
```

The spec's planned `hooks/useAIStream.ts` was folded into the Zustand store. The streaming state has to outlive the component that started it, because switching views must not cancel or lose a reply. A per-component hook would therefore have needed a second, parallel source of state.

## Approvals table: server-driven search, filters and pagination

The table never filters or pages in the browser. `useApprovals(query)` calls `GET /api/approvals` with:
- `q` (search, debounced by 250 ms)
- `type`, `submittedBy` and `status`, as comma-separated lists
- `page` and `pageSize` (10/25/50)

Each new query aborts the previous request, and the current page stays visible (dimmed) while the next one loads. The filter menus build their options and counts from the server's `facets`. The range, page count and clamped page all come from the response. Changing the search, a filter or the page size resets to page 1.

## API integration and streaming

- The backend's AI endpoints are `POST` + SSE. `EventSource` can only send GET, so `streamAiAction` uses `fetch` with a `ReadableStream` reader.
- **`lib/sse.ts` handles:**
  - partial chunks, since events are emitted only after their blank-line terminator
  - UTF-8 characters split across chunks, using `TextDecoder` in streaming mode
  - CRLF line endings, including a CRLF split across chunks
  - comments and keep-alives, multiple events in one chunk, and multi-line `data`
  - a stream cut off mid-event, whose incomplete trailing event is dropped
- **Every event is validated** with Zod before the UI sees it. A payload that breaks the contract becomes an `invalid_response` error instead of being trusted.
- **A stream that ends without `done` or `error`** becomes a retryable `stream_interrupted` error.
- **Errors and cancellation:**
  - HTTP errors (400, 429, …) become a typed `ApiError` carrying the server's message.
  - Network failures become `network_error`.
  - Cancellation (the Stop button, a newer request for the same action, or closing over a request) aborts the fetch. The backend sees the disconnect and aborts its LLM call.
- **Event handling:**
  - `delta` appends text.
  - `result{kind:"text"}` replaces partial text, used when a stream fails midway and the server substitutes a fallback.
  - `result{kind:"summary"}` carries the validated summary.
  - `done` records whether the answer came from the AI or a fallback.

## Testing

```bash
npm test             # Vitest + Testing Library, API mocked — no backend needed
npm run typecheck
npm run lint
npm run build
```

- `tests/sse.test.ts`: the parser edge cases listed above.
- `tests/api.test.ts`: event dispatch, HTTP error mapping, contract violations, interrupted streams, network errors, abort.
- `tests/assistant.test.tsx`:
  - panel layout and open/close
  - greeting **loading → streaming → done**
  - fresh replay and the fallback badge
  - error + retry, and rate-limit errors
  - chat streaming and input lock, **Stop**
  - message-level error retry that resends the same question
  - Help citations, Teach auto-start, structured summary rendering
- `tests/dashboard.test.tsx`: table rendering, search, and the load-error retry.
- `tests/contract.test.ts`: compares every request, response and SSE schema with the backend's exported JSON Schema. To refresh it, run `npm run contract:export` in the backend and copy `contract/api-contract.json` here.

## AI tools

Built with Claude Code (Claude Opus 5.5) assisting with scaffolding, tests and implementation; every change was reviewed and committed test-first.
