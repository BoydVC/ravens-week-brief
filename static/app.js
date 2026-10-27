(() => {
  const $ = (sel) => document.querySelector(sel);
  const panels = {
    week: $("#panel-week"),
    injuries: $("#panel-injuries"),
    lines: $("#panel-lines"),
    simmons: $("#panel-simmons"),
    sunday: $("#panel-sunday"),
    household: $("#panel-household"),
    brief023: $("#panel-brief023"),
    brief054: $("#panel-brief054"),
    brief078: $("#panel-brief078"),
  };
  let brief = null;

  function badge(label) {
    const l = (label || "").toUpperCase();
    const cls = l === "LIVE" ? "live" : l === "SYNTHETIC" ? "synth" : "";
    return `<span class="badge ${cls}">${l || "—"}</span>`;
  }

  function statusBadge(status) {
    const s = (status || "-").toUpperCase();
    let cls = "";
    if (s === "OUT") cls = "out";
    else if (s === "QUESTIONABLE") cls = "questionable";
    else if (s === "DOUBTFUL") cls = "doubtful";
    else if (s === "WATCH") cls = "watch";
    return `<span class="badge ${cls}">${s}</span>`;
  }

  function setStats(b) {
    const c = b.counts || {};
    $("#stats").innerHTML = `
      <span class="pill">Week <b>${b.meta.week}</b></span>
      <span class="pill live">LIVE <b>${c.live ?? "—"}</b></span>
      <span class="pill synth">SYNTHETIC <b>${c.synthetic ?? "—"}</b></span>
      <span class="pill">Port <b>4338</b></span>`;
    $("#stamp").textContent = `Fetched ${b.meta.fetched_at_et} · ${b.meta.timezone}`;
  }

  function renderWeek(w) {
    const m = w.matchup;
    const weather = w.weather || {};
    const prior = w.prior_week || {};
    const angles = (w.headline_angles || []).map(a =>
      `<div class="angle ${(a.label || "").toLowerCase()}">${badge(a.label)} ${a.text}</div>`
    ).join("");
    panels.week.innerHTML = `
      <div class="banner"><strong>Week card</strong> — opponent, kickoff ET, weather stub, prior-week signal. Labels stamped LIVE or SYNTHETIC.</div>
      <div class="hero">
        <div class="card">
          <div class="meta-row">${badge(w.label)} <span class="badge">Week ${m.week}</span></div>
          <div class="matchup">
            <div class="team">
              <div class="abbr">${m.away.abbr}</div>
              <div class="name">${m.away.team}</div>
              <div class="rec">${m.away.record}</div>
            </div>
            <div class="at">@</div>
            <div class="team" style="text-align:right">
              <div class="abbr">${m.home.abbr}</div>
              <div class="name">${m.home.team}</div>
              <div class="rec">${m.home.record}</div>
            </div>
          </div>
          <div class="kick">${m.kickoff_et}</div>
          <div class="muted">${m.venue} · ${m.city}</div>
          <div class="muted">TV: ${m.tv}</div>
        </div>
        <div class="card">
          <h3>Weather stub</h3>
          <div class="meta-row">${badge(weather.label)}</div>
          <div class="line-big" style="font-size:1.2rem">${weather.summary || "—"}</div>
          <div class="muted">${weather.stub_note || ""}</div>
          <div class="sources">Source: ${weather.source || "—"} · ${weather.fetched_at_et || ""}</div>
        </div>
      </div>
      <div class="card" style="margin-bottom:1rem">
        <h3>Prior week · Bengals signal</h3>
        <div class="meta-row">${badge(prior.label)}</div>
        <p style="margin:0;line-height:1.45">${prior.headline || ""}</p>
        <p class="muted" style="margin:0">${prior.detail || ""}</p>
        <p class="muted" style="margin:0">${prior.note || ""}</p>
      </div>
      <div class="card">
        <h3>Headline angles</h3>
        <div class="angles">${angles}</div>
      </div>`;
  }

  function playerRows(players) {
    return (players || []).map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.pos || ""}</td>
        <td>${p.injury || ""}</td>
        <td>${p.wed || "—"}</td>
        <td>${p.thu || "—"}</td>
        <td>${p.fri || "—"}</td>
        <td>${statusBadge(p.game_status)}</td>
        <td>${badge(p.label)}</td>
      </tr>`).join("");
  }

  function renderInjuries(inj) {
    const rav = inj.ravens || {};
    const watch = inj.bills_watch || {};
    const prior = inj.bills_prior_report || {};
    panels.injuries.innerHTML = `
      <div class="banner">${inj.disclaimer}</div>
      <div class="card" style="margin-bottom:1rem">
        <div class="meta-row"><h2 style="margin-right:auto">Ravens practice / game status</h2>${badge(rav.label)}</div>
        <p class="muted" style="margin:0">${rav.note || ""}</p>
        <div class="sources">Source: <a href="${rav.source}" target="_blank" rel="noopener">${rav.source_name}</a> · ${rav.fetched_at_et}</div>
        <div class="table-wrap" style="margin-top:.6rem">
          <table>
            <thead><tr><th>Player</th><th>Pos</th><th>Injury</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Game</th><th>Label</th></tr></thead>
            <tbody>${playerRows(rav.players)}</tbody>
          </table>
        </div>
      </div>
      <div class="grid2">
        <div class="card">
          <div class="meta-row"><h3 style="margin-right:auto">Bills watch list</h3>${badge(watch.label)}</div>
          <p class="muted" style="margin:0">${watch.note || ""}</p>
          <div class="sources"><a href="${watch.source}" target="_blank" rel="noopener">${watch.source_name}</a></div>
          <div class="table-wrap" style="margin-top:.6rem">
            <table>
              <thead><tr><th>Player</th><th>Pos</th><th>Note</th><th>Status</th><th>Label</th></tr></thead>
              <tbody>${(watch.players||[]).map(p=>`<tr><td>${p.name}</td><td>${p.pos}</td><td>${p.detail||p.injury||""}</td><td>${statusBadge(p.game_status)}</td><td>${badge(p.label)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="meta-row"><h3 style="margin-right:auto">Bills prior scrape</h3>${badge(prior.label)}</div>
          <p class="muted" style="margin:0">${prior.note || ""}</p>
          <div class="table-wrap" style="margin-top:.6rem">
            <table>
              <thead><tr><th>Player</th><th>Pos</th><th>Injury</th><th>Status</th><th>Label</th></tr></thead>
              <tbody>${(prior.players||[]).map(p=>`<tr><td>${p.name}</td><td>${p.pos}</td><td>${p.injury}</td><td>${statusBadge(p.game_status)}</td><td>${badge(p.label)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  function renderLines(L) {
    const s = L.spread || {};
    const t = L.total || {};
    const ml = L.moneyline || {};
    panels.lines.innerHTML = `
      <div class="banner">${L.disclaimer}</div>
      <div class="card" style="margin-bottom:1rem">
        <div class="meta-row">${badge(L.label)} <span class="badge">${L.provider}</span></div>
        <div class="grid2" style="margin-top:.4rem">
          <div>
            <div class="muted">Spread</div>
            <div class="line-big">${s.display}</div>
            <div class="muted">Opened ${s.opened} · home ${s.home_odds} / away ${s.away_odds}</div>
          </div>
          <div>
            <div class="muted">Total</div>
            <div class="line-big">${t.display}</div>
            <div class="muted">Opened ${t.opened} · O ${t.over_odds} / U ${t.under_odds}</div>
          </div>
        </div>
        <div style="margin-top:.7rem">
          <div class="muted">Moneyline</div>
          <div>BUF ${ml.home_buf} · BAL +${ml.away_bal} <span class="muted">(opened BUF ${ml.opened_home} / BAL +${ml.opened_away})</span></div>
        </div>
        <div class="sources" style="margin-top:.5rem">Source: ${L.source} · ${L.fetched_at_et}</div>
      </div>
      <div class="card">
        <h3>Secondary sources</h3>
        ${(L.secondary_sources||[]).map(x=>`<div class="angle ${(x.label||"").toLowerCase()}">${badge(x.label)} <a href="${x.url}" target="_blank" rel="noopener">${x.name}</a> — ${x.note}</div>`).join("")}
      </div>`;
  }

  function renderSimmons(sh) {
    const fmt = sh.format || {};
    const w1 = sh.week1_seed_agreements || {};
    const cards = (sh.week8_cards || []).map(c => `
      <div class="card">
        <div class="meta-row">${badge(c.label)} <span class="badge">${c.who || ""}</span></div>
        <h3>${c.title}</h3>
        <p style="margin:0;line-height:1.45">${c.body}</p>
        ${c.side ? `<div class="muted">Side: ${c.side}</div>` : ""}
      </div>`).join("");
    panels.simmons.innerHTML = `
      <div class="banner">${sh.section_note}</div>
      <div class="grid2" style="margin-bottom:1rem">
        <div class="card">
          <div class="meta-row"><h3 style="margin-right:auto">Format (Jim seed)</h3>${badge(fmt.label)}</div>
          <p style="margin:0;line-height:1.45">${fmt.ringer_107}</p>
          <p class="muted" style="margin:0">${fmt.household_habit}</p>
          <div class="sources">Source: ${fmt.source}</div>
        </div>
        <div class="card">
          <div class="meta-row"><h3 style="margin-right:auto">Week 1 agreements (seed)</h3>${badge(w1.label)}</div>
          <ul style="margin:.2rem 0 0;padding-left:1.1rem;line-height:1.45">
            ${(w1.items||[]).map(i=>`<li>${i}</li>`).join("")}
          </ul>
        </div>
      </div>
      <h2 style="font-size:1rem;margin:0 0 .6rem">Week 8 cards</h2>
      <div class="cards" style="display:grid;gap:.8rem">${cards}</div>`;
  }

  function loadSundayState() {
    try { return JSON.parse(localStorage.getItem("rwb_sunday107") || "{}"); }
    catch { return {}; }
  }
  function saveSundayState(st) {
    localStorage.setItem("rwb_sunday107", JSON.stringify(st));
  }

  function renderSunday(s107) {
    const st = loadSundayState();
    const checks = (s107.checklist || []).map(c => {
      const on = !!st[c.id];
      return `<label class="check ${on ? "done" : ""}" data-id="${c.id}">
        <input type="checkbox" ${on ? "checked" : ""} />
        <span>${c.text}</span>
      </label>`;
    }).join("");
    const slot = s107.pick_slot || {};
    panels.sunday.innerHTML = `
      <div class="banner"><strong>${s107.title}</strong> — checklist UI only. Nothing posts outbound.</div>
      <div class="card" style="margin-bottom:1rem">
        <h3>Checklist</h3>
        <div class="checklist" id="checklist">${checks}</div>
      </div>
      <div class="card">
        <h3>Fifth pick slot · ${slot.game || ""}</h3>
        <div class="pick-form">
          <label>Side</label>
          <input id="pickSide" placeholder="${slot.placeholder_side || ""}" value="${st.side || ""}" />
          <label>Why (one sentence)</label>
          <textarea id="pickWhy" placeholder="${slot.placeholder_why || ""}">${st.why || ""}</textarea>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="btn" id="savePick" type="button">Save locally</button>
            <button class="btn ghost" id="clearPick" type="button">Clear</button>
          </div>
          <div class="muted" id="pickSaved">${st.saved_at ? "Saved " + st.saved_at : "Not saved yet"}</div>
        </div>
      </div>`;

    panels.sunday.querySelectorAll(".check input").forEach(inp => {
      inp.addEventListener("change", () => {
        const id = inp.closest(".check").dataset.id;
        const next = loadSundayState();
        next[id] = inp.checked;
        saveSundayState(next);
        inp.closest(".check").classList.toggle("done", inp.checked);
      });
    });
    $("#savePick").onclick = () => {
      const next = loadSundayState();
      next.side = $("#pickSide").value.trim();
      next.why = $("#pickWhy").value.trim();
      next.saved_at = new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) + " ET";
      saveSundayState(next);
      $("#pickSaved").textContent = "Saved " + next.saved_at;
    };
    $("#clearPick").onclick = () => {
      localStorage.removeItem("rwb_sunday107");
      renderSunday(s107);
    };
  }


  function renderBrief023(b) {
    const el = document.getElementById("panel-brief023");
    if (!el || !b) return;
    const esc = t => String(t ?? "").replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    const lc = b.live_check || {};
    const sc = b.scorecard || {};
    const laws = (b.laws || []).map(l =>
      `<li><strong>${esc(l.id)}</strong> — ${esc(l.text)}</li>`
    ).join("");
    const freeze = ((b.named_person_freeze || {}).never_auto_assign || []).map(esc).join(", ");
    const denied = (b.denied_tools || []).slice(0, 8).map(t => `<li><code>${esc(t)}</code></li>`).join("");
    const kpis = [
      ["auto_assign_coverage", sc.auto_assign_coverage ?? lc.auto_assign_coverage],
      ["auto_notify", sc.auto_notify ?? lc.auto_notify],
      ["grandparent_auto_text", sc.grandparent_auto_text ?? lc.grandparent_auto_text],
      ["hold_timeout_auto_action", sc.hold_timeout_auto_action ?? lc.hold_timeout_auto_action],
      ["synthetic_sold_as_live", sc.synthetic_sold_as_live ?? lc.synthetic_sold_as_live],
      ["burn_outbound", sc.burn_outbound ?? lc.burn_outbound],
      ["kpd_bleed", sc.kpd_bleed ?? lc.kpd_bleed],
    ].map(([k, v]) => `<div class="kpi"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
    el.innerHTML = `
      <section class="law-panel" id="brief023">
        <div class="panel-head">
          <h2>Brief-023 law · carpool Apply</h2>
          <span class="badge-law">auto_assign_coverage=0</span>
          <span class="badge-law">auto_notify=0</span>
        </div>
        <div class="banner">${badge("LIVE")} Portable carpool Hold→Apply→notify-only law folded alongside brief-013 household sports. Propose ≠ assign. Ask Boyd/Miranda before coverage. Pam owns school / Boyd owns sports.</div>
        <ul class="law-list">${laws}</ul>
        <div class="card" style="margin-bottom:.8rem">
          <h3>Scorecard zeros</h3>
          <div class="kpi-grid">${kpis}</div>
          <p class="muted" style="margin:0">Named-person freeze (propose only): ${esc(freeze)}</p>
        </div>
        <div class="card" style="margin-bottom:.8rem">
          <h3>Denied auto-assign / auto-notify tools</h3>
          <ul class="law-list">${denied}</ul>
          <p class="muted" style="margin:0">POST /api/coverage-auto-assign · /api/carpool-auto-notify · /api/grandparent-auto-text → 403</p>
        </div>
        <p class="blurb" id="brief023-live">
          <strong>live_check</strong> · auto_assign=<code>${esc(lc.auto_assign_coverage)}</code>
          · auto_notify=<code>${esc(lc.auto_notify)}</code>
          · grandparent_auto_text=<code>${esc(lc.grandparent_auto_text)}</code>
          · assign_apis=<code>${esc(lc.coverage_auto_assign_apis_succeed)}</code>
          · notify_apis=<code>${esc(lc.carpool_auto_notify_apis_succeed)}</code>
          · policy=<code>${esc(lc.mutation_endpoints_policy)}</code>
          · paired_013=<code>${esc(lc.paired_with_brief013)}</code>
          · ${esc(lc.served_at_et || "")}
        </p>
      </section>`;
  }


  function renderBrief078(b) {
    const el = document.getElementById("panel-brief078");
    if (!el || !b) return;
    const esc = t => String(t ?? "").replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    const lc = b.live_check || {};
    const sc = b.scorecard || {};
    const board = b.ticket_board || {};
    const ideas = (lc.ideas || board.ideas || {});
    const hold = lc.buy_hold || b.buy_hold || {};
    const cons = (b.constraints || []).map(c => `<li>${esc(c)}</li>`).join("");
    const kpis = Object.entries(sc).map(([k, v]) => `<div class="kpi"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
    const refused = (b.refused_endpoints || []).map(t => `<code>${esc(t)}</code>`).join(" · ");
    const ideaRows = ["ravens","terps","chelsea"].map(k => {
      const c = ideas[k] || {};
      return `<span class="pill synth">${esc(c.label || k)} · ${esc(c.status || "EXAMPLE")} · price=${esc(c.price)} · inv=${esc(c.inventory)}</span>`;
    }).join(" ");
    el.innerHTML = `
      <section class="law-panel" id="brief078">
        <div class="panel-head">
          <h2>Brief-078 law · Family sports ticket Hold</h2>
          <span class="badge-law">auto_buy_tickets=0</span>
          <span class="badge-law">fabricate_ticket_price=0</span>
        </div>
        <div class="banner">${badge("SYNTHETIC")} Idea first. Hold the cart. Prices/inventory LIVE only with this-session marketplace proof. Never auto-buy / charge / checkout / text kids. Cousin brief-054 merge_apply=false. Pairs brief-013 + Oscar spend.</div>
        <ul class="law-list">${cons}</ul>
        <div class="card" style="margin-bottom:.8rem"><h3>Ticket idea board (EXAMPLE)</h3>
          <p class="muted">${esc(board.honesty || lc.honesty || "SYNTHETIC/EXAMPLE")}</p>
          <div style="margin-top:.4rem">${ideaRows}</div>
          <p class="muted" style="margin-top:.5rem">Hold · ${esc(hold.state || "HOLD")} · default=${esc(hold.default || "review_private")} · oscar_spend_ack=${esc(hold.oscar_spend_ack)} · cart=${esc((board.marketplace||{}).cart_status || "NONE")}</p>
        </div>
        <div class="card" style="margin-bottom:.8rem"><h3>Scorecard zeros</h3><div class="kpi-grid">${kpis}</div></div>
        <div class="card" style="margin-bottom:.8rem"><h3>Refused (GET+POST → 403)</h3><p class="muted" style="margin:0">${refused}</p></div>
        <p class="blurb" id="brief078-live"><strong>live_check</strong> · auto_buy_tickets=<code>${esc(lc.auto_buy_tickets)}</code>
          · fabricate_ticket_price=<code>${esc(lc.fabricate_ticket_price)}</code>
          · fake_live=<code>${esc(lc.fake_live)}</code>
          · proof=<code>${esc(lc.probe_proof_present)}</code>
          · merge_054=<code>${esc((lc.cousin_brief_054||{}).merge_apply)}</code>
          · policy=<code>${esc(lc.mutation_endpoints_policy)}</code>
          · ${esc(lc.served_at_et || "")}</p>
      </section>`;
  }

  async function loadBrief078() {
    try {
      const b78 = await fetch("/api/brief078", { cache: "no-store" }).then(r => r.json());
      renderBrief078(b78);
    } catch (e) {
      const el = document.getElementById("panel-brief078");
      if (el) el.innerHTML = `<div class="banner">brief-078 live_check unavailable: ${e}</div>`;
    }
  }

  function renderBrief054(b) {
    const el = document.getElementById("panel-brief054");
    if (!el || !b) return;
    const esc = t => String(t ?? "").replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    const lc = b.live_check || {};
    const sc = b.scorecard || {};
    const cons = (b.constraints || []).map(c => `<li>${esc(c)}</li>`).join("");
    const kpis = Object.entries(sc).map(([k, v]) => `<div class="kpi"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
    const refused = (b.refused_endpoints || []).map(t => `<code>${esc(t)}</code>`).join(" · ");
    el.innerHTML = `
      <section class="law-panel" id="brief054">
        <div class="panel-head">
          <h2>Brief-054 law · Family fantasy pick'em</h2>
          <span class="badge-law">auto_bet=0</span>
          <span class="badge-law">fabricate_odds=0</span>
        </div>
        <div class="banner">${badge("LIVE")} Millersville household board (${esc((b.household||[]).join(", "))}) — Ravens/Terps/Chelsea. Hold before any bet or staked pool; ODDS_UNKNOWN / SCORE_UNKNOWN beats invention. Kids fun_only. Pairs brief-013 Sports Week + Oscar spend rails.</div>
        <ul class="law-list">${cons}</ul>
        <div class="card" style="margin-bottom:.8rem"><h3>Scorecard zeros</h3><div class="kpi-grid">${kpis}</div></div>
        <div class="card" style="margin-bottom:.8rem"><h3>Refused (GET+POST → 403)</h3><p class="muted" style="margin:0">${refused}</p></div>
        <p class="blurb" id="brief054-live"><strong>live_check</strong> · auto_bet=<code>${esc(lc.auto_bet)}</code>
          · fabricate_odds=<code>${esc(lc.fabricate_odds)}</code> · policy=<code>${esc(lc.mutation_endpoints_policy)}</code>
          · kids=<code>${esc(lc.kids_mode)}</code> · ${esc(lc.served_at_et || "")}</p>
      </section>`;
  }

    function bindTabs() {
    document.querySelectorAll(".tab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        panels[btn.dataset.tab].classList.add("active");
      });
    });
  }

  function bindSundayMode() {
    const box = $("#sundayMode");
    const saved = localStorage.getItem("rwb_sunday_mode") === "1";
    box.checked = saved;
    document.body.classList.toggle("sunday-mode", saved);
    if (saved) {
      document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      $("#tabSunday").classList.add("active");
      panels.sunday.classList.add("active");
    }
    box.addEventListener("change", () => {
      const on = box.checked;
      localStorage.setItem("rwb_sunday_mode", on ? "1" : "0");
      document.body.classList.toggle("sunday-mode", on);
      if (on) {
        document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
        $("#tabSunday").classList.add("active");
        panels.sunday.classList.add("active");
      }
    });
  }

  function renderHousehold(h) {
    const el = document.getElementById("panel-household");
    if (!el || !h) return;
    const esc = t => String(t).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
    const fmt = iso => new Date(iso).toLocaleString("en-US", {timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "2-digit"}) + " ET";
    el.innerHTML = `
      <div class="banner">${badge(h.label)} ${esc(h.label_note)}<br/>${esc(h.tz_note)}</div>
      <div class="card"><h3>Conflict flags (${h.conflicts.length})</h3>
        ${h.conflicts.map(c => `<p class="conflict">${c.label ? badge(c.label) : ""} <b>${esc(c.type)}</b> · ${esc(c.note || (c.a + " / " + c.b))}</p>`).join("") || "<p>No conflicts.</p>"}
        <p class="muted">Drive buffer ${h.drive_buffer_min} min. Flags are local only — no parent/carpool message sends.</p></div>
      <div class="card"><h3>Week events</h3>
        ${h.events.map(e => `<p>${badge(e.label)} ${fmt(e.start)}–${fmt(e.end)} · <b>${esc(e.who)}</b> ${esc(e.title)}${e.feed ? " <i>(" + esc(e.feed) + ")</i>" : ""}</p>`).join("")}</div>
      <div class="card"><h3>Desk laws · brief-013</h3>
        ${h.laws.map(l => `<p><b>${esc(l.id)}</b> — ${esc(l.text)}</p>`).join("")}</div>`;
  }

  async function boot() {
    const res = await fetch("/api/brief");
    brief = await res.json();
    setStats(brief);
    renderWeek(brief.week_card);
    renderInjuries(brief.injuries);
    renderLines(brief.lines);
    renderSimmons(brief.simmons_house);
    renderSunday(brief.sunday107);
    renderHousehold(brief.household);
    try {
      const b23 = await fetch("/api/brief023", { cache: "no-store" }).then(r => r.json());
      renderBrief023(b23);
    } catch (e) {
      const el = document.getElementById("panel-brief023");
      if (el) el.innerHTML = `<div class="banner">brief-023 live_check unavailable: ${e}</div>`;
    }
    try {
      const b54 = await fetch("/api/brief054", { cache: "no-store" }).then(r => r.json());
      renderBrief054(b54);
    } catch (e) {
      const el = document.getElementById("panel-brief054");
      if (el) el.innerHTML = `<div class="banner">brief-054 live_check unavailable: ${e}</div>`;
    }
    await loadBrief078();
    bindTabs();
    bindSundayMode();
  }

  boot().catch(err => {
    panels.week.innerHTML = `<div class="banner">Failed to load brief: ${err}</div>`;
  });
})();
