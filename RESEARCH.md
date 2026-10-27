# RESEARCH — Ravens Week-Of Brief (Week 8, 2026)

Fetch window: **2026-10-26 ~21:53 ET** (America/New_York).  
Desk: BAL (4-3) @ BUF (5-1), Sunday Nov 1 2026, 1:00 PM ET, Highmark Stadium.

## 1. Matchup (LIVE)

| Fact | Value | Source |
|------|-------|--------|
| Week | 8, 2026 NFL regular season | ESPN scoreboard `dates=20261101` |
| Kickoff | Sun Nov 1, 2026 · 1:00 PM ET | ESPN event `401873026` status detail |
| Venue | Highmark Stadium, Orchard Park, NY | ESPN competition.venue |
| Away record | Baltimore Ravens 4-3 | ESPN competitors.records |
| Home record | Buffalo Bills 5-1 | ESPN competitors.records |
| TV window | CBS family (confirm local Sunday AM) | NFL.com / Football Nation guide |

Citations:

- https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=20261101  
- https://www.nfl.com/games/ravens-at-bills-2026-reg-8  
- https://www.pro-football-reference.com/boxscores/202611010buf.htm  

## 2. Prior week — Bengals / Ravens collapse (LIVE)

Jim lane phrasing: “Bengals collapse.” On the field it was a **Ravens second-half collapse**: CIN trailed 13-0 at half, then scored **35 unanswered** to win 35-13 at M&T (Oct 25, 2026).

| Fact | Value | Source |
|------|-------|--------|
| Final | Bengals 35, Ravens 13 | Bengals.com recap; PFR box |
| Halftime | BAL 13, CIN 0 | PFR scoring |
| Burrow | 22/30, 292 yds, 4 TD | Bengals.com |
| Ravens QB | Tyler Huntley (Lamar out) | Recap + injury report history |
| BAL record after | 4-3, AFC North basement context | NFL.com / Yahoo preview |

Citations:

- https://www.bengals.com/news/bengals-ravens-recap-postgame-notes-quotes-stats-week-7-2026  
- https://www.pro-football-reference.com/boxscores/202610250rav.htm  

Desk note kept in `week_card.json` → `prior_week.note` so the household brief does not mis-label who collapsed.

## 3. Lamar Jackson status (LIVE)

Official Baltimore Ravens injury report (fetched 2026-10-26 via WebFetch):

| Player | Injury | Wed | Thu | Fri | Game status |
|--------|--------|-----|-----|-----|-------------|
| Lamar Jackson | Ankle | LP | LP | LP | **QUESTIONABLE** |

Supporting public color (not a status override):

- ESPN: “Ravens coach Minter optimistic QB Jackson can return vs. Bills”  
  https://www.espn.com/nfl/story/_/id/50290411/ravens-coach-minter-optimistic-qb-jackson-returns-vs-bills  
- CBS Sports betting desk (Oct 26): notes Jackson back on practice field in Week 7 cycle; Week 8 decision still open  
  https://www.cbssports.com/betting/news/nfl-odds-picks-ravens-vs-bills-chiefs-vs-broncos-among-best-spread-bets-for-week-8/  

Other LIVE Ravens game statuses from the same official table: Hawkins OUT, Tavius Robinson OUT, T.J. Tampa DOUBTFUL, Broderick Washington QUESTIONABLE.

Site quirk: the injury-report page still rendered a Bengals opponent column (Week 7 pairing). Player rows were used as published; Week 8 opponent is Buffalo.

Citation: https://www.baltimoreravens.com/team/injury-report/

## 4. Bills watch (LIVE watch list / SYNTHETIC prior board)

Week 8 practice week had **not started** at fetch (Monday Oct 26). Therefore:

- **LIVE watch list** from Yahoo Week 8 preview (Byham, Oct 26): DJ Moore (shoulder/AC), Ed Oliver (hip/knee reports vary) called out as health questions.  
  https://sports.yahoo.com/articles/buffalo-bills-open-slight-favorites-193413708.html  
- **SYNTHETIC prior scrape** from TeamRankings Week 8 injury page mixed older (Oct 16) practice stamps — kept as context only, never as Friday statuses.  
  https://www.teamrankings.com/nfl/matchup/ravens-bills-week-8-2026/injuries  

## 5. Lines (LIVE)

DraftKings via ESPN scoreboard for event `401873026` (fetched 2026-10-26 21:53:41 EDT):

| Market | Close | Open |
|--------|-------|------|
| Spread | BUF -3.5 (−102) / BAL +3.5 (−118) | BUF -2.5 |
| Total | 53.5 (O −112 / U −108) | 51.5 |
| ML | BUF −192 / BAL +160 | −135 / +114 |

Agreement checks:

- Yahoo Sports: BUF -3.5, O/U 53.5  
- CBS Sports: Bills -3.5 among Week 8 ATS leans; SportsLine cover rate cited 58%  

Disclaimer on desk: entertainment / household context only — not betting advice.

## 6. Weather stub (LIVE)

Open-Meteo public forecast for Orchard Park vicinity (`lat=42.7738, lon=-78.7870`), date 2026-11-01, timezone America/New_York:

| Field | Value |
|-------|-------|
| High / low | 61.7°F / 47.7°F |
| Precip max probability | 23% |
| Weathercode | 51 (drizzle class) |
| Summary used on card | Mild for Nov 1 · light drizzle risk |

Re-check Saturday morning for wind / lake-effect updates. Stub, not a stadium microclimate model.

API: `https://api.open-meteo.com/v1/forecast?...&start_date=2026-11-01&end_date=2026-11-01`

## 7. Simmons / House / Ringer 107

### LIVE seed (Jim local)

`/workspace/jim/bill-simmons-house-week1-bets.md` documents Week 1 2026 Bill Simmons + Joe House agreements and the Ringer 107 format (Thu contest picks + Sunday social; piggyback allowed). Segment note: Ringer 107 ~24:03 in that episode.

Also present locally:

- `/workspace/jim/bs-house-picks.txt` (transcript extract)  
- `/workspace/jim/podcast-brief/BillSimmons.xml`  
- `/workspace/feed_BillSimmons.xml`  

### Not LIVE for Week 8 BAL@BUF

Public search on 2026-10-26 did **not** surface a parseable Week 8 2026 Simmons/House episode with named Ravens–Bills locks. A 2025-dated Ringer page titled “NFL Week 8 Picks With Joe House” is a prior-season artifact and was **not** used as LIVE 2026 picks.

Therefore Week 8 cards in `simmons_house.json` are **SYNTHETIC** household angles (Lamar binary, bye vs collapse, total narrative) plus an explicit “awaiting episode” card.

Ringer 107 leaderboard shell (season contest framing only):  
https://wp.theringer.com/wp-content/uploads/2026/09/ringer107-leaderboard-embed.html

## 8. Sunday 107 household habit

Boyd habit: one Sunday social fifth pick after Saturday card review. Implemented as checklist UI + localStorage pick slot. **No auto-post** to Slack, X, email, or any outbound channel. Toggle labeled “Sunday mode · 107 fifth-pick”.

## 9. Related TokenMax desks (not cloned)

Prior Ravens toys on the box were left untouched:

- `ravens-gameday`, `ravens-opponent`, `ravens-playbook`, `ravens-sim`, `ravens-film-room`, `sports-desk`  

This ship is a **new** folder: `/workspace/tokenmax/ravens-week-brief`.

## 10. Label counts (at ship)

Computed by `/api/counts` from stamped objects in data JSON (week card, injuries, lines, Simmons cards). Expected mix: heavy LIVE on matchup/injuries/lines/weather; SYNTHETIC on Bills prior scrape + Week 8 Simmons angles.

## 11. Method notes

- Public WebFetch + `curl` only. No paid odds API keys.  
- Times reported in America/New_York with EDT label from box clock.  
- ESPN Z timestamps converted mentally to ET for kickoff display (18:00Z → 1:00 PM ET on Nov 1 2026 under EDT).  
- No Boyd messages, cloud agents, KPD, payments, or outbound-as-Boyd in this burn.

## 12. Refresh checklist (for next Saturday)

1. Re-hit Ravens official injury report + Bills official report  
2. Re-hit ESPN scoreboard for line drift  
3. Re-hit Open-Meteo for wind  
4. Check Bill Simmons Podcast / Megaphone for Week 8 House episode; promote cards LIVE only with quotes  
5. Confirm TV window on NFL.com game center  

## 13. Jim Interests handoff context

Lane #3 from Jim · Interests (agent id 9abbfaf4-f401-4e70-8619-da598173399a), Interest Journal window ~Oct 21–26. Parked items (call-agent, Vault coach, Idealab, KPD Slack→Teams) intentionally skipped.
