#!/usr/bin/env python3
"""Ravens Week-Of Brief — Saturday/Sunday card desk on 127.0.0.1:4338."""
from __future__ import annotations

import json
import os
import urllib.parse
from datetime import datetime
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "4338"))
HOST = "127.0.0.1"
TZ = ZoneInfo("America/New_York")

# brief-023 carpool Apply/notify — never auto-assign / auto-notify / grandparent-text
REFUSED_CARPOOL = (
    "/api/coverage-auto-assign",
    "/api/carpool-auto-notify",
    "/api/grandparent-auto-text",
)

# brief-013 never auto-bet
REFUSED_BET = (
    "/api/bet",
    "/api/wager",
    "/api/place_bet",
)


# brief-054 family pick'em — never auto-bet / fabricate odds/score / auto-lock/settle/charge / kids / burn
REFUSED_PICKEM = tuple(['/api/auto-bet', '/api/fabricate-odds', '/api/fabricate-score', '/api/auto-lock-picks', '/api/auto-settle-pool', '/api/auto-charge-stakes', '/api/auto-text-kids', '/api/kids-real-money', '/api/burn-outbound'])

# brief-078 family sports ticket Hold — never auto-buy / fabricate price·inventory / charge / checkout / text kids / timeout-buy / burn
REFUSED_TICKETS = (
    "/api/auto-buy-tickets",
    "/api/fabricate-ticket-price",
    "/api/auto-charge-card",
    "/api/auto-buy-ticket",
    "/api/fabricate-inventory",
    "/api/fake-live-tickets",
    "/api/hold-timeout-buy",
    "/api/auto-text-kids",
    "/api/auto-checkout",
    "/api/burn-outbound",
    "/api/tickets/auto-buy",
    "/api/tickets/auto-checkout",
)
# Overlaps with brief-054 (auto-text-kids, burn-outbound): prefer brief-078 body; also_refused_by brief-054
TICKET_OWNED = frozenset(REFUSED_TICKETS)


def _stamp() -> str:
    return datetime.now(TZ).strftime("%Y-%m-%d %H:%M %Z")


def _read_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _counts() -> dict:
    week = _read_json(ROOT / "data" / "week_card.json")
    inj = _read_json(ROOT / "data" / "injuries.json")
    lines = _read_json(ROOT / "data" / "lines.json")
    sh = _read_json(ROOT / "data" / "simmons_house.json")
    live = 0
    synth = 0

    def bump(label: str | None):
        nonlocal live, synth
        if not label:
            return
        u = label.upper()
        if u == "LIVE":
            live += 1
        elif u == "SYNTHETIC":
            synth += 1

    bump(week.get("label"))
    bump(week.get("prior_week", {}).get("label"))
    bump(week.get("weather", {}).get("label"))
    for a in week.get("headline_angles", []):
        bump(a.get("label"))
    bump(inj.get("ravens", {}).get("label"))
    for p in inj.get("ravens", {}).get("players", []):
        bump(p.get("label"))
    bump(inj.get("bills_watch", {}).get("label"))
    for p in inj.get("bills_watch", {}).get("players", []):
        bump(p.get("label"))
    bump(inj.get("bills_prior_report", {}).get("label"))
    for p in inj.get("bills_prior_report", {}).get("players", []):
        bump(p.get("label"))
    bump(lines.get("label"))
    for s in lines.get("secondary_sources", []):
        bump(s.get("label"))
    bump(sh.get("format", {}).get("label"))
    bump(sh.get("week1_seed_agreements", {}).get("label"))
    for c in sh.get("week8_cards", []):
        bump(c.get("label"))
    bump(sh.get("sunday_107", {}).get("label"))
    hw = _read_json(ROOT / "data" / "household_week.json")
    bump(hw.get("label"))
    for e in hw.get("events", []):
        bump(e.get("label"))
    return {"live": live, "synthetic": synth, "total_labeled": live + synth}


def _household() -> dict:
    """brief-013: kids-sports conflict flags via overlap math (+drive buffer), dedupe, laws."""
    from datetime import timedelta
    hw = _read_json(ROOT / "data" / "household_week.json")
    buf = timedelta(minutes=hw.get("drive_buffer_min", 30))
    evs, seen, dups = [], {}, []
    for e in hw.get("events", []):
        key = (e["who"], e["title"], e["start"])
        if key in seen:
            dups.append({"type": "DUPLICATE_FEED", "a": seen[key], "b": e["id"],
                         "note": "Same event from two subscriptions; unsubscribe one (subscribe, don't import)."})
            continue
        seen[key] = e["id"]
        evs.append(e)
    flags = []
    for i, a in enumerate(evs):
        for b in evs[i + 1:]:
            a0, a1 = datetime.fromisoformat(a["start"]), datetime.fromisoformat(a["end"])
            b0, b1 = datetime.fromisoformat(b["start"]), datetime.fromisoformat(b["end"])
            if "kids" not in (a["kind"], b["kind"]):
                continue
            if a0 < b1 and b0 < a1:
                kind = "OVERLAP"
            elif a0 < b1 + buf and b0 < a1 + buf:
                kind = "DRIVE_BUFFER"
            else:
                continue
            flags.append({"type": kind, "a": a["id"], "b": b["id"],
                          "label": "SYNTHETIC" if "SYNTHETIC" in (a["label"], b["label"]) else "LIVE",
                          "note": f"{a['who']}: {a['title']} \u2194 {b['who']}: {b['title']}"})
    return {**hw, "conflicts": flags + dups, "auto_bet": False, "outbound": False}


def brief023_payload() -> dict:
    """Fold Agent Brief Forge brief-023 law + live_check (carpool Apply/notify)."""
    law = _read_json(ROOT / "data" / "brief023.json")
    sc = law.get("scorecard", {})
    law["live_check"] = {
        "auto_assign_coverage": sc.get("auto_assign_coverage", 0),
        "auto_notify": sc.get("auto_notify", 0),
        "grandparent_auto_text": sc.get("grandparent_auto_text", 0),
        "hold_timeout_auto_action": sc.get("hold_timeout_auto_action", 0),
        "synthetic_sold_as_live": sc.get("synthetic_sold_as_live", 0),
        "stale_feed_as_certain": sc.get("stale_feed_as_certain", 0),
        "kpd_bleed": sc.get("kpd_bleed", 0),
        "burn_outbound": sc.get("burn_outbound", 0),
        "seat_overbook": sc.get("seat_overbook", 0),
        "coverage_auto_assign_apis_succeed": False,
        "carpool_auto_notify_apis_succeed": False,
        "grandparent_auto_text_apis_succeed": False,
        "post_disabled": True,
        "mutation_endpoints_policy": "403",
        "refused_post_prefixes": list(REFUSED_CARPOOL),
        "named_person_freeze": law.get("named_person_freeze", {}).get("never_auto_assign", []),
        "platform_write_default": False,
        "paired_with_brief013": True,
        "paired_with_brief014": True,
        "hub_read_only": True,
        "timezone": "America/New_York",
        "served_at_et": _stamp(),
    }
    return law


def brief054_payload() -> dict:
    """Fold brief-054 family pick'em law + live_check."""
    law = _read_json(ROOT / "data" / "brief054.json")
    sc = law.get("scorecard", {})
    law["live_check"] = {
        **{k: sc.get(k, 0) for k in sc},
        "auto_bet_apis_succeed": False,
        "fabricate_odds_apis_succeed": False,
        "mutation_endpoints_policy": "403",
        "refused_prefixes": list(REFUSED_PICKEM),
        "kids_mode": "fun_only",
        "lock_requires_hold": True,
        "paired_with_brief013": True,
        "paired_with_brief047": True,
        "paired_with_brief015_oscar": True,
        "hub_read_only": True,
        "timezone": "America/New_York",
        "served_at_et": _stamp(),
    }
    return law


def _refuse054(path: str) -> dict:
    return {"ok": False, "path": path, "brief_id": "brief-054", "brief": "brief-054",
            "error": "refused: brief-054 family pick'em — auto_bet=0 / fabricate_odds=0 / fabricate_score=0 / auto_lock_picks=0 / auto_settle_pool=0 / auto_charge_stakes=0 / auto_text_kids=0 / kids_real_money=0 / burn_outbound=0"}


def brief078_payload() -> dict:
    """Fold brief-078 family sports ticket Hold + live_check (EXAMPLE board until proof)."""
    law = _read_json(ROOT / "data" / "brief078.json")
    sc = law.get("scorecard", {})
    board = law.get("ticket_board", {})
    ideas = board.get("ideas", {})
    hold = law.get("buy_hold", {})
    probe_proof = any(
        (ideas.get(k) or {}).get("proof") for k in ("ravens", "terps", "chelsea")
    )
    law["live_check"] = {
        **{k: sc.get(k, 0) for k in sc},
        "ok": True,
        "fake_live": 0,
        "fake_live_tickets": sc.get("fake_live_tickets", 0),
        "auto_buy_tickets_apis_succeed": False,
        "fabricate_ticket_price_apis_succeed": False,
        "mutation_endpoints_policy": "403",
        "refused_prefixes": list(REFUSED_TICKETS),
        "probe_proof_present": bool(probe_proof),
        "honesty": board.get("honesty", "SYNTHETIC/EXAMPLE"),
        "ideas": {
            k: {
                "label": (ideas.get(k) or {}).get("label"),
                "status": (ideas.get(k) or {}).get("status", "EXAMPLE"),
                "price": (ideas.get(k) or {}).get("price"),
                "inventory": (ideas.get(k) or {}).get("inventory"),
                "proof": (ideas.get(k) or {}).get("proof"),
            }
            for k in ("ravens", "terps", "chelsea")
        },
        "buy_hold": {
            "state": hold.get("state", "HOLD"),
            "default": hold.get("default", "review_private"),
            "destination": hold.get("destination"),
            "oscar_spend_ack": hold.get("oscar_spend_ack", False),
        },
        "cousin_brief_054": law.get("cousin_brief_054", {"merge_apply": False}),
        "pairs_brief013": True,
        "pairs_brief054": True,
        "hub_read_only": True,
        "timezone": "America/New_York",
        "served_at_et": _stamp(),
    }
    return law


def _refuse078(path: str) -> dict:
    also = []
    # Overlaps with pick'em / sports week
    if path in ("/api/auto-text-kids", "/api/burn-outbound"):
        also.append("brief-054")
    if path in (
        "/api/auto-buy-tickets",
        "/api/auto-buy-ticket",
        "/api/tickets/auto-buy",
        "/api/auto-checkout",
        "/api/tickets/auto-checkout",
        "/api/auto-charge-card",
        "/api/fabricate-ticket-price",
        "/api/fabricate-inventory",
        "/api/fake-live-tickets",
        "/api/hold-timeout-buy",
    ):
        also.append("brief-013")
    body = {
        "ok": False,
        "path": path,
        "brief": "brief-078",
        "brief_id": "brief-078",
        "error": (
            "refused: brief-078 family sports ticket Hold — "
            "auto_buy_tickets=0 / fabricate_ticket_price=0 / auto_charge_card=0 / "
            "auto_buy_ticket=0 / fabricate_inventory=0 / fake_live_tickets=0 / "
            "hold_timeout_buy=0 / burn_outbound=0 / auto_text_kids=0 / auto_checkout=0"
        ),
    }
    if also:
        # unique preserve order
        seen = set()
        ordered = []
        for a in also:
            if a not in seen:
                seen.add(a)
                ordered.append(a)
        body["also_refused_by"] = ordered
    return body


def _brief() -> dict:
    meta = _read_json(ROOT / "data" / "meta.json")
    return {
        "meta": meta,
        "week_card": _read_json(ROOT / "data" / "week_card.json"),
        "injuries": _read_json(ROOT / "data" / "injuries.json"),
        "lines": _read_json(ROOT / "data" / "lines.json"),
        "simmons_house": _read_json(ROOT / "data" / "simmons_house.json"),
        "sunday107": _read_json(ROOT / "data" / "sunday107.json"),
        "household": _household(),
        "counts": _counts(),
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / "static"), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"[ravens-week-brief] {self.address_string()} {fmt % args}", flush=True)

    def _send_json(self, code: int, payload) -> None:
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path in REFUSED_TICKETS:
            return self._send_json(403, _refuse078(path))
        if path in REFUSED_PICKEM:
            return self._send_json(403, _refuse054(path))
        if path in REFUSED_CARPOOL:
            return self._send_json(403, {
                "ok": False,
                "error": "refused: brief-023 carpool Apply/notify — auto_assign_coverage=0 / auto_notify=0 / grandparent_auto_text=0",
                "path": path,
                "brief_id": "brief-023",
            })
        if path in REFUSED_BET:
            return self._send_json(403, {
                "ok": False,
                "error": "never auto-bet (brief-013)",
                "path": path,
                "brief_id": "brief-013",
            })
        return self._send_json(403, {
            "ok": False,
            "error": "read-only desk: no bets, no outbound, no auto-assign/notify (brief-013 + brief-023)",
        })

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/health":
            return self._send_json(200, {
                "ok": True,
                "service": "ravens-week-brief",
                "host": HOST,
                "port": PORT,
                "bind": f"{HOST}:{PORT}",
                "briefs_folded": ["brief-013", "brief-023", "brief-054", "brief-078"],
            })
        if path == "/api/meta":
            meta = _read_json(ROOT / "data" / "meta.json")
            folded = list(meta.get("briefs_folded") or [])
            for b in ("brief-013", "brief-023", "brief-054", "brief-078"):
                if b not in folded:
                    folded.append(b)
            meta["briefs_folded"] = folded
            return self._send_json(200, meta)
        if path == "/api/brief":
            return self._send_json(200, _brief())
        if path == "/api/week":
            return self._send_json(200, _read_json(ROOT / "data" / "week_card.json"))
        if path == "/api/injuries":
            return self._send_json(200, _read_json(ROOT / "data" / "injuries.json"))
        if path == "/api/lines":
            return self._send_json(200, _read_json(ROOT / "data" / "lines.json"))
        if path == "/api/simmons":
            return self._send_json(200, _read_json(ROOT / "data" / "simmons_house.json"))
        if path == "/api/sunday107":
            return self._send_json(200, _read_json(ROOT / "data" / "sunday107.json"))
        if path == "/api/household":
            return self._send_json(200, _household())
        if path == "/api/brief023":
            return self._send_json(200, brief023_payload())
        if path == "/api/brief054":
            return self._send_json(200, brief054_payload())
        if path == "/api/brief078":
            return self._send_json(200, brief078_payload())
        if path in REFUSED_TICKETS:
            return self._send_json(403, _refuse078(path))
        if path in REFUSED_PICKEM:
            return self._send_json(403, _refuse054(path))
        if path in REFUSED_BET:
            return self._send_json(403, {"ok": False, "error": "never auto-bet (brief-013)"})
        if path in REFUSED_CARPOOL:
            return self._send_json(403, {
                "ok": False,
                "error": "refused: brief-023 carpool Apply/notify — auto_assign_coverage=0 / auto_notify=0 / grandparent_auto_text=0",
                "path": path,
                "brief_id": "brief-023",
            })
        if path == "/api/counts":
            meta = _read_json(ROOT / "data" / "meta.json")
            c = _counts()
            return self._send_json(200, {
                **c,
                "fetched_at_et": meta.get("fetched_at_et"),
                "timezone": meta.get("timezone"),
            })
        return super().do_GET()


def main() -> None:
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Ravens Week-Of Brief serving http://{HOST}:{PORT}/", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
