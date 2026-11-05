#!/usr/bin/env bash
#
# backfill-pancake-sync.sh — backfill the last N hours of Pancake sync.
#
# Runs ONLY these three worker services, via the dedicated, isolated
# "backfill-pancake-sync" case in schedule-handler.js:
#   1. Pancake.ConversationSyncService.syncConversations
#   2. Pancake.CustomerSyncService.syncCustomers
#   3. ERP.CRM.PancakeLeadSyncService.syncPancakeLeads
# (That case is not a real cron, so it never fires on a schedule — and it does
#  NOT depend on what the "*/5" case currently contains.)
#
# How: starts `wrangler dev` and triggers that dedicated case, but with the
# three FN_KV checkpoints seeded to (now - N hours) in LOCAL kv. So:
#   - the backfill window is exactly the last N hours,
#   - PRODUCTION kv checkpoints are never touched (the live */5 cron is unaffected),
#   - writes still go to the real DB + ERP in .dev.vars (that is the backfill target).
#
# Usage:   ./backfill-pancake-sync.sh <hours>
# Example: ./backfill-pancake-sync.sh 3
# Env:     PORT (default 8787), PERSIST_DIR (default .wrangler/state)
#
set -euo pipefail

HOURS="${1:-}"
PORT="${PORT:-8787}"
PERSIST_DIR="${PERSIST_DIR:-.wrangler/state}"
BINDING="FN_KV"
HANDLER="src/services/schedule-handler.js"
CRON="backfill-pancake-sync"   # dedicated isolated case in schedule-handler.js

# --- validate ---------------------------------------------------------------
if ! [[ "$HOURS" =~ ^[0-9]+$ ]] || [ "$HOURS" -lt 1 ]; then
  echo "Usage: $0 <hours>   (positive integer, e.g. 3)" >&2
  exit 1
fi
if [ ! -f wrangler.jsonc ] || [ ! -f .dev.vars ] || [ ! -f "$HANDLER" ]; then
  echo "ERROR: run this from the fn project root (needs wrangler.jsonc, .dev.vars, $HANDLER)." >&2
  exit 1
fi

# --- safety: the dedicated isolated case must exist --------------------------
# We trigger the "backfill-pancake-sync" case, which contains ONLY the three
# syncs and is not a real cron. This makes the backfill independent of whatever
# the "*/5" case currently holds. Fail clearly if that case is missing.
if ! grep -q "case \"${CRON}\"" "$HANDLER"; then
  echo "ABORT: no \"case \\\"${CRON}\\\"\" found in $HANDLER." >&2
  echo "Add a dedicated case that runs only the 3 Pancake syncs, then re-run." >&2
  exit 1
fi

# --- compute since = now - HOURS (UTC, 'YYYY-MM-DD HH:mm:ss') ----------------
SINCE="$(node -e 'const h=+process.argv[1];const d=new Date(Date.now()-h*3600*1000);const p=n=>String(n).padStart(2,"0");process.stdout.write(d.getUTCFullYear()+"-"+p(d.getUTCMonth()+1)+"-"+p(d.getUTCDate())+" "+p(d.getUTCHours())+":"+p(d.getUTCMinutes())+":"+p(d.getUTCSeconds()))' "$HOURS")"
echo ">> Backfill window: since ${SINCE} UTC  (last ${HOURS}h)  ->  now"

# --- seed LOCAL kv checkpoints ----------------------------------------------
for K in pancake_conversation_sync_last_time \
         pancake_customer_sync_last_time \
         pancake_lead_sync_last_time; do
  npx wrangler kv key put --local --binding "$BINDING" --persist-to "$PERSIST_DIR" "$K" "$SINCE" >/dev/null 2>&1
done
echo ">> Seeded local KV checkpoints (production checkpoints untouched)."

# --- start wrangler dev ------------------------------------------------------
LOG="$(mktemp -t backfill-wdev.XXXXXX.log)"
npx wrangler dev --test-scheduled --persist-to "$PERSIST_DIR" \
  --port "$PORT" --ip 127.0.0.1 --log-level info >"$LOG" 2>&1 &
DEV_PID=$!
cleanup() { kill "$DEV_PID" 2>/dev/null || true; pkill -P "$DEV_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

printf ">> Starting wrangler dev"
ready=0
for _ in $(seq 1 60); do
  if curl -s -o /dev/null -m 2 "http://127.0.0.1:${PORT}/" 2>/dev/null; then ready=1; echo " ... ready."; break; fi
  printf "."; sleep 2
done
if [ "$ready" -ne 1 ]; then
  echo " TIMEOUT — wrangler dev did not come up. Last log lines:" >&2
  tail -25 "$LOG" >&2
  exit 1
fi

# --- trigger the dedicated case (blocks until the 3 syncs finish) ------------
echo ">> Triggering sync (Conversation -> Customer -> PancakeLead) ..."
curl -s -m 1800 "http://127.0.0.1:${PORT}/__scheduled?cron=${CRON}" >/dev/null || true

# --- results ----------------------------------------------------------------
echo ">> ---- results ----"
grep -aE "Finished syncConversations|Finished syncCustomers|Syncing leads updated since|Finished sync\. Total processed|Error syncing leads|Lead sync failed|Invalid access_token" "$LOG" \
  | sed -E 's/\x1b\[[0-9;]*m//g; s/^.*(Finished|Syncing|Error|Lead|Invalid)/  \1/' || true
echo ">> ------------------"

if grep -qa "Finished sync\. Total processed" "$LOG"; then
  echo ">> Done — backfill complete. (local KV only; live */5 cron unaffected)"
else
  echo ">> WARNING: lead sync did not report completion. Full log: $LOG" >&2
  exit 1
fi
