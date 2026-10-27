# brief-013 fold — Sports Week Desk → Ravens Week-Of (2026-10-26)
Source: agent-brief-forge/out/brief-013.md + peer-review-013.json (PR-1..PR-4).
- LIVE vs SYNTHETIC: household_week.json labels every event; kids rows SYNTHETIC (no feed wired); counted in /api/counts.
- Never auto-bet (PR-3): /api/bet|wager|place_bet → 403; all POST → 403; `auto_bet:false`.
- Odds honesty (PR-2): informational, as_of stamp, stale ≠ LIVE, 21+/1-800-GAMBLER footer.
- Injury honesty (PR-1): official vocab only; smoke asserts no "Probable".
- Kids conflicts (PR-4): server overlap math + 30-min drive buffer + duplicate-subscription flag; local only, no sends.
- TZ: Nov 1 2026 is post-DST (EST -05:00). Note: week_card kickoff_iso_et still says -04:00 (pre-existing; 1 PM ET wall-clock correct).
