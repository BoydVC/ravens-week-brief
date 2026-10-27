#!/usr/bin/env bash
# Start (or restart) Ravens Week-Of Brief on 127.0.0.1:4338
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
PORT="${PORT:-4338}"
PIDFILE="$ROOT/data/server.pid"
LOG="$ROOT/data/server.log"
mkdir -p "$ROOT/data" "$ROOT/out"

if [[ -f "$PIDFILE" ]]; then
  old=$(cat "$PIDFILE" || true)
  if [[ -n "${old:-}" ]] && kill -0 "$old" 2>/dev/null; then
    kill "$old" || true
    sleep 0.3
  fi
  rm -f "$PIDFILE"
fi
pkill -f "ravens-week-brief/server.py" 2>/dev/null || true
sleep 0.2

if command -v ss >/dev/null 2>&1; then
  pids=$(ss -ltnp "sport = :$PORT" 2>/dev/null | grep -oP 'pid=\K[0-9]+' || true)
  for p in $pids; do kill "$p" 2>/dev/null || true; done
fi

nohup env PORT="$PORT" python3 "$ROOT/server.py" >>"$LOG" 2>&1 &
echo $! >"$PIDFILE"
sleep 0.6
code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/api/health" || echo "000")
if [[ "$code" != "200" ]]; then
  echo "server failed health HTTP ${code}; see $LOG" >&2
  exit 1
fi
echo "Ravens Week-Of Brief LIVE at http://127.0.0.1:${PORT}/ (pid $(cat "$PIDFILE"), health HTTP ${code})"
