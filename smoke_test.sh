#!/usr/bin/env bash
# Ravens Week-Of Brief smoke — ≥16 checks (+ brief-023 carpool fold)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
BASE="${BASE_URL:-http://127.0.0.1:4338}"
PY=python3
PASS=0
FAIL=0

check() {
  local name="$1"
  shift
  if "$@"; then
    echo "PASS  $name"
    PASS=$((PASS + 1))
  else
    echo "FAIL  $name"
    FAIL=$((FAIL + 1))
  fi
}

echo "== Ravens Week-Of Brief smoke =="
echo "BASE=$BASE"

check "README.md exists" test -f "$ROOT/README.md"
check "DESIGN.md exists" test -f "$ROOT/DESIGN.md"
check "RESEARCH.md exists" test -f "$ROOT/RESEARCH.md"
check "server.py exists" test -f "$ROOT/server.py"
check "run.sh executable" test -x "$ROOT/run.sh"
check "static/index.html exists" test -f "$ROOT/static/index.html"
check "static/styles.css exists" test -f "$ROOT/static/styles.css"
check "static/app.js exists" test -f "$ROOT/static/app.js"
check "data/week_card.json exists" test -f "$ROOT/data/week_card.json"
check "data/injuries.json exists" test -f "$ROOT/data/injuries.json"
check "data/lines.json exists" test -f "$ROOT/data/lines.json"
check "data/simmons_house.json exists" test -f "$ROOT/data/simmons_house.json"
check "data/sunday107.json exists" test -f "$ROOT/data/sunday107.json"
check "data/meta.json exists" test -f "$ROOT/data/meta.json"
check "data/brief023.json exists" test -f "$ROOT/data/brief023.json"
check "data/brief054.json exists" test -f "$ROOT/data/brief054.json"
check "data/household_week.json exists" test -f "$ROOT/data/household_week.json"

check "RESEARCH.md ≥80 lines" "$PY" -c 'import pathlib; assert sum(1 for _ in open("'"$ROOT"'/RESEARCH.md"))>=80'
check "DESIGN bans purple flood / has charcoal+gold" grep -qE '121417|d4a017|Charcoal' "$ROOT/DESIGN.md"
check "CSS has charcoal bg #121417" grep -q '#121417' "$ROOT/static/styles.css"
check "CSS has gold #d4a017" grep -q '#d4a017' "$ROOT/static/styles.css"
check "CSS raven purple accent once-token" grep -q '#4a2c7a' "$ROOT/static/styles.css"
check "UI has Sunday mode toggle" grep -q 'sundayMode' "$ROOT/static/index.html"
check "UI has LIVE badge class" grep -qE '.badge.live|badge live' "$ROOT/static/styles.css"
check "week_card opponent BUF" grep -q 'Buffalo Bills' "$ROOT/data/week_card.json"
check "Lamar QUESTIONABLE LIVE" "$PY" -c 'import json; d=json.load(open("'"$ROOT"'/data/injuries.json")); p=[x for x in d["ravens"]["players"] if x["name"]=="Lamar Jackson"][0]; assert p["game_status"]=="QUESTIONABLE" and p["label"]=="LIVE"'
check "lines labeled LIVE" "$PY" -c 'import json; assert json.load(open("'"$ROOT"'/data/lines.json"))["label"]=="LIVE"'
check "spread BUF -3.5" "$PY" -c 'import json; assert json.load(open("'"$ROOT"'/data/lines.json"))["spread"]["line"]==-3.5'
check "simmons week8 has SYNTHETIC await card" "$PY" -c 'import json; cards=json.load(open("'"$ROOT"'/data/simmons_house.json"))["week8_cards"]; assert any(c["id"]=="await-episode" and c["label"]=="SYNTHETIC" for c in cards)'
check "sunday107 checklist ≥5" "$PY" -c 'import json; assert len(json.load(open("'"$ROOT"'/data/sunday107.json"))["checklist"])>=5'
check "meta port 4338" "$PY" -c 'import json; assert json.load(open("'"$ROOT"'/data/meta.json"))["port"]==4338'
check "fetched_at_et present" "$PY" -c 'import json; t=json.load(open("'"$ROOT"'/data/meta.json"))["fetched_at_et"]; assert "2026-10-26" in t and ("EDT" in t or "EST" in t)'

if curl -sf "$BASE/api/health" >/tmp/rwb-health.json; then
  check "GET /api/health ok" true
  check "health bind 4338" grep -q '4338' /tmp/rwb-health.json
  check "GET /api/brief ok" curl -sf "$BASE/api/brief" -o /tmp/rwb-brief.json
  check "GET /api/counts ok" curl -sf "$BASE/api/counts" -o /tmp/rwb-counts.json
  check "API live count > 0" "$PY" -c 'import json; assert json.load(open("/tmp/rwb-counts.json"))["live"]>0'
  check "API synthetic count > 0" "$PY" -c 'import json; assert json.load(open("/tmp/rwb-counts.json"))["synthetic"]>0'
  check "GET / index" curl -sf "$BASE/" -o /tmp/rwb-index.html
  check "index title" grep -q 'Ravens Week-Of Brief' /tmp/rwb-index.html
  check "GET /styles.css" curl -sf "$BASE/styles.css" -o /tmp/rwb-css.css
  check "GET /app.js" curl -sf "$BASE/app.js" -o /tmp/rwb-app.js
  check "GET /api/injuries" curl -sf "$BASE/api/injuries" -o /tmp/rwb-inj.json
  check "GET /api/lines" curl -sf "$BASE/api/lines" -o /tmp/rwb-lines.json
  check "GET /api/simmons" curl -sf "$BASE/api/simmons" -o /tmp/rwb-sim.json
  check "GET /api/sunday107" curl -sf "$BASE/api/sunday107" -o /tmp/rwb-s107.json
  check "brief has weather LIVE" "$PY" -c 'import json; assert json.load(open("/tmp/rwb-brief.json"))["week_card"]["weather"]["label"]=="LIVE"'
  check "GET /api/household ok" curl -sf "$BASE/api/household" -o /tmp/rwb-hh.json
  check "household flags kids OVERLAP" "$PY" -c 'import json; d=json.load(open("/tmp/rwb-hh.json")); assert any(c["type"]=="OVERLAP" for c in d["conflicts"])'
  check "household flags DUPLICATE_FEED" "$PY" -c 'import json; d=json.load(open("/tmp/rwb-hh.json")); assert any(c["type"]=="DUPLICATE_FEED" for c in d["conflicts"])'
  check "household auto_bet false + outbound false" "$PY" -c 'import json; d=json.load(open("/tmp/rwb-hh.json")); assert d["auto_bet"] is False and d["outbound"] is False'
  check "household laws never-auto-bet/odds/injury" "$PY" -c 'import json; ids={l["id"] for l in json.load(open("/tmp/rwb-hh.json"))["laws"]}; assert {"never-auto-bet","odds-honesty","injury-honesty","live-vs-synthetic"}<=ids'
  check "household every event labeled" "$PY" -c 'import json; assert all(e["label"] in ("LIVE","SYNTHETIC") for e in json.load(open("/tmp/rwb-hh.json"))["events"])'
  check "bet endpoint refuses 403" test "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/bet")" = 403
  check "POST refused 403" test "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/bet")" = 403
  check "no Probable in injuries" "$PY" -c 'import json; assert "PROBABLE" not in json.dumps(json.load(open("/tmp/rwb-inj.json"))).upper()'
  check "UI household tab + 21+ footer" grep -q 'Household week' /tmp/rwb-index.html

  check "GET /api/brief023 ok" curl -sf "$BASE/api/brief023" -o /tmp/rwb-b23.json
  check "brief023 id + scorecard zeros" "$PY" -c 'import json; b=json.load(open("/tmp/rwb-b23.json")); assert b["brief_id"]=="brief-023"; sc=b["scorecard"]; assert sc["auto_assign_coverage"]==0 and sc["auto_notify"]==0 and sc["grandparent_auto_text"]==0 and sc["burn_outbound"]==0 and sc["kpd_bleed"]==0'
  check "brief023 live_check" "$PY" -c 'import json; b=json.load(open("/tmp/rwb-b23.json")); lc=b["live_check"]; assert lc["auto_assign_coverage"]==0 and lc["auto_notify"]==0 and lc["grandparent_auto_text"]==0; assert lc["coverage_auto_assign_apis_succeed"] is False and lc["carpool_auto_notify_apis_succeed"] is False and lc["grandparent_auto_text_apis_succeed"] is False; assert lc["mutation_endpoints_policy"]=="403"; assert lc["paired_with_brief013"] is True; assert lc["timezone"]=="America/New_York"; assert "ET" in lc["served_at_et"] or "EDT" in lc["served_at_et"] or "EST" in lc["served_at_et"]'
  check "brief023 denied tools + freeze" "$PY" -c 'import json; b=json.load(open("/tmp/rwb-b23.json")); assert "coverage-auto-assign" in b["denied_tools"]; freeze=b["named_person_freeze"]["never_auto_assign"]; assert any("Chris" in x for x in freeze) and any("Beth" in x for x in freeze) and any("Melody" in x for x in freeze)'
  check "POST coverage-auto-assign 403" test "$(curl -s -o /tmp/rwb-caa.json -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"driver":"Chris"}' "$BASE/api/coverage-auto-assign")" = 403
  check "POST carpool-auto-notify 403" test "$(curl -s -o /tmp/rwb-can.json -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"target":"Beth"}' "$BASE/api/carpool-auto-notify")" = 403
  check "POST grandparent-auto-text 403" test "$(curl -s -o /tmp/rwb-gat.json -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE/api/grandparent-auto-text")" = 403
  check "carpool 403 cites brief-023" "$PY" -c 'import json; d=json.load(open("/tmp/rwb-caa.json")); assert d.get("brief_id")=="brief-023" or "brief-023" in d.get("error","")'
  check "GET coverage-auto-assign 403" test "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/coverage-auto-assign")" = 403
  check "UI brief023 tab + panel" grep -q 'Brief-023 law · carpool Apply' /tmp/rwb-index.html
  check "app.js renders brief023" grep -q 'renderBrief023' "$ROOT/static/app.js"
  check "brief013 household still works" "$PY" -c 'import json; d=json.load(open("/tmp/rwb-hh.json")); assert d.get("brief_id")=="brief-013"; assert any(c["type"]=="OVERLAP" for c in d["conflicts"]); assert d["auto_bet"] is False'
  check "GET /api/brief054 ok" curl -sf "$BASE/api/brief054" -o /tmp/rwb-b54.json
  check "brief054 id + core zeros" "$PY" -c 'import json; b=json.load(open("/tmp/rwb-b54.json")); assert b["brief_id"]=="brief-054"; sc=b["scorecard"]; assert sc["auto_bet"]==0 and sc["fabricate_odds"]==0'
  check "brief054 secondary zeros" "$PY" -c 'import json; sc=json.load(open("/tmp/rwb-b54.json"))["scorecard"]; assert all(sc[k]==0 for k in ("fabricate_score","auto_lock_picks","auto_settle_pool","auto_charge_stakes","auto_text_kids","kids_real_money","burn_outbound"))'
  check "brief054 live_check" "$PY" -c 'import json; lc=json.load(open("/tmp/rwb-b54.json"))["live_check"]; assert lc["auto_bet"]==0 and lc["fabricate_odds"]==0 and lc["auto_bet_apis_succeed"] is False and lc["mutation_endpoints_policy"]=="403" and lc["timezone"]=="America/New_York" and lc["paired_with_brief013"] is True'
  for ep in auto-bet fabricate-odds fabricate-score auto-lock-picks auto-settle-pool auto-charge-stakes auto-text-kids kids-real-money burn-outbound; do
    check "GET /api/$ep 403" test "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/$ep")" = 403
    check "POST /api/$ep 403" test "$(curl -s -o /tmp/rwb-54p.json -w '%{http_code}' -X POST -d '{}' "$BASE/api/$ep")" = 403
  done
  curl -s -o /tmp/rwb-54-unique.json "$BASE/api/auto-bet" || true
  check "pickem 403 cites brief-054" "$PY" -c 'import json;d=json.load(open("/tmp/rwb-54-unique.json")); assert d.get("brief_id")=="brief-054" or d.get("brief")=="brief-054" or "brief-054" in d.get("error","")'
  check "UI brief054 tab" grep -q "Brief-054 law · Family fantasy pick'em" /tmp/rwb-index.html
  check "app.js renders brief054" grep -q 'renderBrief054' "$ROOT/static/app.js"

  # --- brief-078 fold (Family sports ticket Hold) ---
  check "data/brief078.json exists" test -f "$ROOT/data/brief078.json"
  check "brief078 scorecard zeros" "$PY" -c 'import json;s=json.load(open("'"$ROOT"'/data/brief078.json"))["scorecard"];assert all(s[k]==0 for k in ["auto_buy_tickets","fabricate_ticket_price","auto_charge_card","auto_buy_ticket","fabricate_inventory","fake_live_tickets","hold_timeout_buy","burn_outbound","auto_text_kids","auto_checkout"])'
  check "brief078 EXAMPLE ticket board + cousin" "$PY" -c 'import json;b=json.load(open("'"$ROOT"'/data/brief078.json"));ideas=b["ticket_board"]["ideas"];assert all(ideas[k]["status"]=="EXAMPLE" and ideas[k]["price"] is None and ideas[k]["inventory"] is None and ideas[k]["proof"] is None for k in ["ravens","terps","chelsea"]);assert b["place"]=="Millersville, MD";assert b["cousin_brief_054"]["merge_apply"] is False;assert b["buy_hold"]["default"]=="review_private"'
  check "UI brief078 tab" grep -q "Brief-078 law · Family sports ticket Hold" "$ROOT/static/index.html"
  check "app.js loadBrief078 / renderBrief078" bash -c 'grep -q loadBrief078 "'"$ROOT"'/static/app.js" && grep -q renderBrief078 "'"$ROOT"'/static/app.js"'
  check "README brief-078 note" grep -q "Brief-078 fold" "$ROOT/README.md"
  check "GET /api/brief078 ok" curl -sf "$BASE/api/brief078" -o /tmp/rwb-b78.json
  check "brief078 id + core zeros + live_check" "$PY" -c 'import json;b=json.load(open("/tmp/rwb-b78.json"));assert b["brief_id"]=="brief-078";sc=b["scorecard"];assert sc["auto_buy_tickets"]==0 and sc["fabricate_ticket_price"]==0;lc=b["live_check"];assert lc["ok"] is True and lc["fake_live"]==0 and lc["auto_buy_tickets"]==0 and lc["fabricate_ticket_price"]==0 and lc["auto_buy_tickets_apis_succeed"] is False and lc["mutation_endpoints_policy"]=="403" and lc["probe_proof_present"] is False and lc["cousin_brief_054"]["merge_apply"] is False and lc["timezone"]=="America/New_York" and lc["pairs_brief013"] is True and lc["pairs_brief054"] is True'
  allr=1
  for ep in auto-buy-tickets fabricate-ticket-price auto-charge-card auto-buy-ticket fabricate-inventory fake-live-tickets hold-timeout-buy auto-text-kids auto-checkout burn-outbound tickets/auto-buy tickets/auto-checkout; do
    for m in GET POST; do
      c=$(curl -s -o /tmp/rwb-refuse078.json -w "%{http_code}" -X $m "$BASE/api/$ep" -H 'Content-Type: application/json' $([[ $m == POST ]] && echo "-d {}") || echo 000)
      [[ "$c" == "403" ]] || allr=0
    done
  done
  check "brief-078 GET+POST refused 403" test $allr = 1
  check "brief-078 refuse preferred on fabricate-ticket-price" "$PY" -c 'import json;d=json.load(open("/tmp/rwb-refuse078.json"));assert d.get("brief")=="brief-078" or d.get("brief_id")=="brief-078";assert d.get("ok") is False'
  curl -s -o /tmp/rwb-refuse078-buy.json "$BASE/api/auto-buy-tickets" || true
  check "brief-078 prefer body on auto-buy-tickets cites 013" "$PY" -c 'import json;d=json.load(open("/tmp/rwb-refuse078-buy.json"));assert d.get("brief")=="brief-078" or d.get("brief_id")=="brief-078";also=d.get("also_refused_by") or [];assert "brief-013" in also, also'
  curl -s -o /tmp/rwb-refuse078-text.json "$BASE/api/auto-text-kids" || true
  check "brief-078 prefer body on auto-text-kids cites 054" "$PY" -c 'import json;d=json.load(open("/tmp/rwb-refuse078-text.json"));assert d.get("brief")=="brief-078" or d.get("brief_id")=="brief-078";also=d.get("also_refused_by") or [];assert "brief-054" in also, also'
  check "health briefs_folded 078" "$PY" -c 'import json,urllib.request;h=json.load(urllib.request.urlopen("'"$BASE"'/api/health"));assert "brief-078" in (h.get("briefs_folded") or [])'
  check "served UI has Brief-078 tab" bash -c 'curl -sf "'"$BASE"'/" | grep -q "Family sports ticket Hold"'
  check "brief023+054 APIs still 200" bash -c '[[ $(curl -s -o /dev/null -w "%{http_code}" "'"$BASE"'/api/brief023") == 200 && $(curl -s -o /dev/null -w "%{http_code}" "'"$BASE"'/api/brief054") == 200 ]]'

else
  echo "FAIL  GET /api/health ok (is ./run.sh up?)"
  FAIL=$((FAIL + 1))
fi

TOTAL=$((PASS + FAIL))
echo "== Result: $PASS/$TOTAL passed ($FAIL failed) =="
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
