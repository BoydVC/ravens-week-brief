# Ravens Week-Of Brief

Saturday / Sunday household sports card desk for Boyd’s Ravens week.

**URL:** http://127.0.0.1:4338/  
**Path:** `/workspace/tokenmax/ravens-week-brief`  
**Jim lane:** #3 (Ravens week-of · Bengals collapse signal · Lamar toward Buffalo · Sunday 107)

## What it is

One local web app that folds into a single card:

1. **Week card** — opponent, kickoff (America/New_York), weather stub, prior-week signal  
2. **Injury / practice board** — official Ravens report + Bills watch list  
3. **Betting / line context** — every figure labeled **LIVE** or **SYNTHETIC** with source + ET fetch stamp  
4. **Bill Simmons / House cards** — format seeded from Jim research; Week 8 locks stay SYNTHETIC until the episode drops  
5. **Sunday mode** — 107 fifth-pick habit checklist (localStorage only — **never auto-posts**)

## Run

```bash
./run.sh
./smoke_test.sh
```

Smoke expects the server already up on `:4338`.

## Labels

- **LIVE** — pulled from a public source this session (or Jim local file with path citation)  
- **SYNTHETIC** — household angle, stale scrape, or awaiting episode — never presented as official injury status  

Injury rule: if unsure, mark **SYNTHETIC**. Never invent LIVE game statuses.

## Design

Charcoal + gold + white. One Ravens-purple accent max (mark underline / Sunday tab ring). See `DESIGN.md`.

## Data

| File | Role |
|------|------|
| `data/week_card.json` | Matchup, weather, prior week |
| `data/injuries.json` | Practice / game status board |
| `data/lines.json` | Spread / total / ML |
| `data/simmons_house.json` | Format + Week 8 cards |
| `data/sunday107.json` | Checklist template |
| `data/meta.json` | Fetch stamp + port |

## Out of scope

No cloud agents, no Boyd messages, no KPD, no payments, no outbound-as-Boyd.

## Brief folds

| Brief | Role |
|-------|------|
| **brief-013** | Sports Week Desk — LIVE vs SYNTHETIC, never auto-bet, odds/injury honesty, kids conflict flags (`/api/household`, `data/household_week.json`) |
| **brief-023** | Carpool Apply/notify — Hold→Apply→notify-only; `auto_assign_coverage=0` / `auto_notify=0`; never auto-assign Chris/Beth/Melody/team parents; no grandparents auto-text; Pam school / Boyd sports (`GET /api/brief023` + live_check; POST `/api/coverage-auto-assign`, `/api/carpool-auto-notify`, `/api/grandparent-auto-text` → 403) |

See `BRIEF013_FOLD.md` and `BRIEF023_FOLD.md`.


## Brief-054 fold — Family fantasy football / sports pick'em (2026-10-27 ET)

- Law: `data/brief054.json` (from `agent-brief-forge/out/brief-054.md` + peer-review/citations-054). Scorecard all 0: `auto_bet`, `fabricate_odds`, `fabricate_score`, `auto_lock_picks`, `auto_settle_pool`, `auto_charge_stakes`, `auto_text_kids`, `kids_real_money`, `burn_outbound`.
- API: `GET /api/brief054` (+ `live_check`, ET stamp).
- 403 (GET+POST): `/api/auto-bet`, `/api/fabricate-odds`, `/api/fabricate-score`, `/api/auto-lock-picks`, `/api/auto-settle-pool`, `/api/auto-charge-stakes`, `/api/auto-text-kids`, `/api/kids-real-money`, `/api/burn-outbound`.
- UI tab: **Brief-054 law · Family fantasy pick'em**. Pairs brief-013 Sports Week + brief-047 Chelsea + Oscar spend rails (brief-015). Kids fun_only. Not KPD.

## Brief-078 fold — Family sports ticket Hold (2026-10-27 ET)

- Law: `data/brief078.json` (from `agent-brief-forge/out/brief-078.md` + peer-review/citations-078). Scorecard all 0: `auto_buy_tickets`, `fabricate_ticket_price`, `auto_charge_card`, `auto_buy_ticket`, `fabricate_inventory`, `fake_live_tickets`, `hold_timeout_buy`, `burn_outbound`, `auto_text_kids`, `auto_checkout`.
- EXAMPLE/SYNTHETIC ticket board (Ravens/Terps/Chelsea); LIVE price/inventory only with this-session marketplace proof. Buy Hold default `review_private` / `export_idea`.
- Cousin brief-054 Pick'em: `merge_apply=false`. Pairs brief-013 Sports Week + Oscar spend rails.
- API: `GET /api/brief078` (+ `live_check`, ET stamp). health/meta `briefs_folded` includes brief-078.
- 403 (GET+POST): `/api/auto-buy-tickets`, `/api/fabricate-ticket-price`, `/api/auto-charge-card`, `/api/auto-buy-ticket`, `/api/fabricate-inventory`, `/api/fake-live-tickets`, `/api/hold-timeout-buy`, `/api/auto-text-kids`, `/api/auto-checkout`, `/api/burn-outbound`, `/api/tickets/auto-buy`, `/api/tickets/auto-checkout`. Prefer brief-078 body on ticket gates; `also_refused_by` brief-054/013 on overlaps.
- UI tab: **Brief-078 law · Family sports ticket Hold**. Idea first. Hold the cart. Never auto-buy. Not KPD.
