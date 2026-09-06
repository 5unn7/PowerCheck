import React, { useState, useEffect, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

import { AIRCRAFT, byId, checkFor, chartFor, frameFor, defaultConfig,
  fittedOptions, checkOptions, seriesKey, seriesLabel } from "./aircraft/index.js";
import { VIEWS } from "./views.js";
import { AircraftSelect } from "./pick.jsx";
import { num, fmt, uid, todayISO, isISODate, statusOf } from "./engine/format.js";
import { CSS } from "./css.js";

const STORE_KEY = "pc407:records:v1";
const PREF_KEY = "pc407:prefs:v1";

/* Fitted options travel with a check, so a log entry can always be recomputed
   against the chart it was actually read from. They serialise as
   `inlet=basic;snow=no` — one CSV column whatever an aircraft's options are. */
const encodeConfig = (cfg) =>
  Object.entries(cfg).map(([k, v]) => `${k}=${v === true ? "yes" : v === false ? "no" : v}`).join(";");

function decodeConfig(aircraft, s) {
  const cfg = defaultConfig(aircraft);
  for (const pair of String(s || "").split(";")) {
    const [k, v] = pair.split("=");
    const opt = aircraft.options.find((o) => o.key === k);
    if (!opt) continue;
    cfg[k] = opt.type === "switch" ? v === "yes" || v === "true" : v;
  }
  return cfg;
}

export default function App() {
  // The app opens on the aircraft page and only then shows the check, so a
  // check is never read against whichever type happened to be selected last.
  const [picked, setPicked] = useState(false);
  const [lastId, setLastId] = useState("");
  const [aircraftId, setAircraftId] = useState(AIRCRAFT[0].id);
  const aircraft = byId(aircraftId);
  const proc = checkFor(aircraft);
  const view = VIEWS[aircraft.id];

  const [reg, setReg] = useState("");
  const [date, setDate] = useState(todayISO());
  const [hours, setHours] = useState("");
  const [values, setValues] = useState({});
  const [config, setConfig] = useState(() => defaultConfig(AIRCRAFT[0]));
  const [note, setNote] = useState("");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeOk, setStoreOk] = useState(true);
  const [flash, setFlash] = useState("");
  const [tab, setTab] = useState("check");
  const [trendReg, setTrendReg] = useState("");
  const [condOpen, setCondOpen] = useState(false);
  const [updated, setUpdated] = useState(false);
  const fileRef = useRef(null);

  const say = (msg, ms = 4000) => { setFlash(msg); setTimeout(() => setFlash(""), ms); };

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORE_KEY);
        // logs written before the app knew about more than one type are 407s
        if (r) setRecords(JSON.parse(r.value).map((x) => ({ aircraft: "bell-407", ...x })));
      } catch (e) { /* nothing logged yet */ }
      try {
        const p = await window.storage.get(PREF_KEY);
        if (p) {
          const v = JSON.parse(p.value);
          const a = byId(v.aircraft || "bell-407");
          setAircraftId(a.id);
          setLastId(a.id);
          if (v.reg) setReg(v.reg);
          if (v.trendReg) setTrendReg(v.trendReg);
          if (typeof v.condOpen === "boolean") setCondOpen(v.condOpen);
          // v.inlet / v.snow are the pre-registry shape of the same thing
          setConfig(v.config ? { ...defaultConfig(a), ...v.config }
            : { ...defaultConfig(a), ...(v.inlet ? { inlet: v.inlet } : {}), ...(typeof v.snow === "boolean" ? { snow: v.snow } : {}) });
        }
      } catch (e) { /* first run */ }
      setLoading(false);
    })();
  }, []);

  // A launch runs whatever is already on the device; a newer version installs
  // behind it and takes effect on the next one. Say so rather than reloading
  // underneath a check being typed.
  useEffect(() => {
    const onUpdate = () => setUpdated(true);
    window.addEventListener("app-updated", onUpdate);
    return () => window.removeEventListener("app-updated", onUpdate);
  }, []);

  useEffect(() => {
    if (loading) return;
    window.storage.set(PREF_KEY, JSON.stringify({ aircraft: aircraftId, reg, config, trendReg, condOpen })).catch(() => {});
  }, [aircraftId, reg, config, trendReg, condOpen, loading]);

  const setOption = (key, value) => setConfig((c) => ({ ...c, [key]: value }));

  /* The aircraft page and the check are two pages to whoever is holding the
     phone, so the system back button has to move between them. They are one
     document, so that means an entry on the history stack: picking pushes
     one, back pops it, and the header control goes through the same door so
     the stack never drifts from what is on screen.

     A reload lands on the aircraft page whatever the stack said, so a state
     left over from before the reload is dropped rather than left to swallow
     the first press of back. */
  useEffect(() => {
    if (window.history.state && window.history.state.pc) window.history.replaceState(null, "");
    const onPop = (e) => setPicked(!!(e.state && e.state.pc === "check"));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const backToFleet = () => {
    if (window.history.state && window.history.state.pc === "check") window.history.back();
    else setPicked(false);
  };

  /* Coming back to the page and choosing the same type again keeps the
     readings already typed; choosing a different one cannot, since the
     readings and the fitted options are that aircraft's. */
  function pickAircraft(id) {
    if (id !== aircraftId) {
      setAircraftId(id);
      setConfig(defaultConfig(byId(id)));
      setValues({});
    }
    setLastId(id);
    if (!picked) window.history.pushState({ pc: "check" }, "");
    setPicked(true);
    setTab("check");
  }

  const { chart, meta, variant } = chartFor(aircraft, config);

  /* The conditions stay folded away until the chart being read changes —
     the snow deflector supplement is level flight only where the basic chart
     allows a hover, and that is not something to find folded up. */
  const knownVariant = useRef(false);
  useEffect(() => {
    if (loading) return;
    if (!knownVariant.current) { knownVariant.current = true; return; }
    setCondOpen(true);
  }, [variant, loading]);

  const frame = frameFor(aircraft);
  const nums = useMemo(
    () => Object.fromEntries(aircraft.inputs.map((i) => [i.key, num(values[i.key])])),
    [aircraft, values]);
  const complete = aircraft.inputs.every((i) => Number.isFinite(nums[i.key]));

  // Off the chart there is no margin to report — extrapolation reads generous,
  // so the number is withheld rather than shown with a warning beside it.
  const offChart = complete && chart ? proc.offChart({ chart, ...nums }) : [];
  const result = complete && chart && offChart.length === 0
    ? proc.compute({ chart, aircraft, ...nums })
    : null;
  const status = statusOf(result ? result.margin : NaN, aircraft);

  /* Which readings are still to come — shown once entry has started, so a
     half-filled check reads as unfinished rather than as broken. */
  const waiting = complete || !aircraft.inputs.some((i) => Number.isFinite(nums[i.key])) ? []
    : aircraft.inputs.filter((i) => !Number.isFinite(nums[i.key])).map((i) => i.label);

  async function persist(next) {
    setRecords(next);
    try { await window.storage.set(STORE_KEY, JSON.stringify(next)); return true; }
    catch (e) { setStoreOk(false); return false; }
  }

  async function handleSave() {
    if (!result) return;
    const rec = {
      id: uid(), aircraft: aircraft.id, reg: (reg || "UNREG").trim().toUpperCase(),
      date: date || todayISO(), hours: num(hours), config, ...nums,
      K: result.K, maxMGT: result.maxMGT, margin: result.margin, note: note.trim(),
    };
    const ok = await persist([...records, rec]);
    // show the line this check joined, which may not be the one on screen
    setTrendReg(seriesKey(rec));
    say(ok ? `${rec.reg} logged at ${fmt(rec.margin)} ${aircraft.marginUnit}` : "Not saved — storage is unavailable.");
    setNote("");
  }

  async function shareCard() {
    if (!result) return;
    let blob;
    try {
      blob = await view.drawCard({
        aircraft, chart, frame, meta, result, accent: status.hex, status: status.label,
        title: `${aircraft.label.toUpperCase()}  ·  POWER ASSURANCE CHECK`,
        readings: [
          ...aircraft.inputs.map((i) => `${i.label} ${fmt(nums[i.key], i.unit === "ft" || i.unit === "°C" ? 0 : 1)}${i.unit ? " " + i.unit : ""}`),
          ...labelConfig(aircraft, config),
        ],
        reg, date, hours: num(hours), ...nums,
      });
    } catch (e) {
      say("Could not draw the card."); return;
    }
    const name = `powercheck-${(reg || "unreg").toLowerCase()}-${date}.png`;
    const file = new File([blob], name, { type: "image/png" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Power check ${reg} ${date}` });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* ------------------------------- trend ------------------------------- */

  /* One line per tail *and* per check-scope option. The 212's check is run
     one engine at a time, and fitting a slope across both averages two
     engines' deterioration into a slope belonging to neither — which is
     the one thing this screen exists to measure honestly. */
  const groups = useMemo(() => {
    const m = new Map();
    for (const r of records) {
      const k = seriesKey(r);
      if (!m.has(k)) m.set(k, { key: k, label: seriesLabel(r), rows: [] });
      m.get(k).rows.push(r);
    }
    return [...m.values()].sort((a, b) => (a.label < b.label ? -1 : 1));
  }, [records]);

  const active = groups.find((g) => g.key === trendReg) || groups[0] || null;
  const series = useMemo(() => (active ? active.rows : [])
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((r) => ({ ...r, label: (r.date || "").slice(5) })), [active]);
  const useHours = series.length > 1 && series.every((r) => Number.isFinite(r.hours));
  // a tail number is one aircraft, so its log reads in that aircraft's terms
  const seriesAircraft = byId(series.length ? series[0].aircraft : aircraft.id);

  const trend = useMemo(() => {
    if (series.length < 2) return null;
    const xs = series.map((r) => (useHours ? r.hours : (new Date(r.date) - new Date(series[0].date)) / 864e5));
    const ys = series.map((r) => r.margin);
    const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
    if (!sxx) return null;
    const per = (sxy / sxx) * (useHours ? 100 : 30);
    return { per, unit: useHours ? "per 100 hrs" : "per 30 days" };
  }, [series, useHours]);

  /* -------------------------------- CSV -------------------------------- */

  // every input key any registered aircraft uses, so one file holds a mixed fleet
  const READING_KEYS = useMemo(
    () => Array.from(new Set(AIRCRAFT.flatMap((a) => a.inputs.map((i) => i.key)))), []);

  function exportCSV() {
    const head = ["aircraft", "registration", "date", "hours", "config", ...READING_KEYS, "k", "max_mgt", "margin", "note"];
    const rows = [...records].sort((a, b) => (a.reg + a.date < b.reg + b.date ? -1 : 1)).map((r) => [
      r.aircraft || "bell-407", r.reg, r.date, Number.isFinite(r.hours) ? r.hours : "",
      encodeConfig(r.config || {}),
      ...READING_KEYS.map((k) => (Number.isFinite(r[k]) ? r[k] : "")),
      Number.isFinite(r.K) ? r.K.toFixed(3) : "", Number.isFinite(r.maxMGT) ? r.maxMGT.toFixed(1) : "",
      Number.isFinite(r.margin) ? r.margin.toFixed(1) : "",
      (r.note || "").replace(/[",\n]/g, " "),
    ]);
    const blob = new Blob([[head, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `power-check-${todayISO()}.csv`;
    a.click();
  }

  // Columns are found by name, and the names the app used before the registry
  // still resolve, so an export taken from an earlier version imports cleanly.
  const ALIAS = {
    registration: "registration", reg: "registration", aircraft: "aircraft",
    date: "date", hours: "hours", config: "config", note: "note",
    oat_c: "oat", oat: "oat", pressure_alt_ft: "pa", pa: "pa",
    torque_pct: "tq", tq: "tq", mgt_c: "mgt", mgt: "mgt",
    inlet: "inlet", snow_deflectors: "snow",
  };

  const keyOf = (r) => [r.aircraft, r.reg, r.date, r.hours, encodeConfig(r.config || {}),
    ...READING_KEYS.map((k) => r[k])].join("|");

  function importCSV(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const lines = String(reader.result).trim().split(/\r?\n/);
      if (lines.length < 2) { say("Nothing to import — the file has no rows."); e.target.value = ""; return; }

      const cols = {};
      lines[0].split(",").forEach((name, i) => {
        const k = ALIAS[name.trim().toLowerCase()];
        if (k && cols[k] === undefined) cols[k] = i;
      });
      const at = (c, k) => (cols[k] === undefined ? "" : (c[cols[k]] || "").trim());

      const seen = new Set(records.map(keyOf));
      const added = [];
      let skipped = 0;

      for (const line of lines.slice(1)) {
        if (!line.trim()) continue;
        const c = line.split(",");
        const ac = byId(at(c, "aircraft") || "bell-407");
        const date = at(c, "date");

        // an older export carried inlet and snow as their own columns
        const config = cols.config !== undefined
          ? decodeConfig(ac, at(c, "config"))
          : { ...defaultConfig(ac), ...(at(c, "inlet") ? { inlet: at(c, "inlet") } : {}),
              ...(cols.snow !== undefined ? { snow: at(c, "snow") === "yes" } : {}) };

        const nums = Object.fromEntries(ac.inputs.map((i) => [i.key, num(at(c, i.key))]));
        const { chart } = chartFor(ac, config);
        const p = checkFor(ac);

        // A row is only worth keeping if it can be recomputed from its own
        // readings — a margin column is taken on trust otherwise, and a stale
        // or hand-edited export would quietly rewrite the trend.
        if (!isISODate(date) || !chart || !ac.inputs.every((i) => Number.isFinite(nums[i.key]))) { skipped++; continue; }
        if (p.offChart({ chart, ...nums }).length) { skipped++; continue; }

        const res = p.compute({ chart, aircraft: ac, ...nums });
        if (!res || !Number.isFinite(res.margin)) { skipped++; continue; }

        const noteIdx = cols.note;
        const rec = {
          id: uid(), aircraft: ac.id, reg: (at(c, "registration") || "UNREG").toUpperCase(),
          date, hours: num(at(c, "hours")), config, ...nums,
          K: res.K, maxMGT: res.maxMGT, margin: res.margin,
          // the note is the rest of the line, so stray commas survive
          note: noteIdx === undefined ? "" : c.slice(noteIdx).join(",").trim(),
        };
        const k = keyOf(rec);
        if (seen.has(k)) { skipped++; continue; }
        seen.add(k);
        added.push(rec);
      }

      if (added.length) await persist([...records, ...added]);
      const parts = [`${added.length} ${added.length === 1 ? "check" : "checks"} imported`];
      if (skipped) parts.push(`${skipped} skipped`);
      say(parts.join(" · "), 5000);
    };
    reader.readAsText(f);
    e.target.value = "";
  }

  /* ------------------------------- render ------------------------------- */

  if (!picked) {
    return (
      <div className="wrap">
        <style>{CSS}</style>
        <AircraftSelect aircraft={AIRCRAFT} lastId={lastId} onPick={pickAircraft} />
      </div>
    );
  }

  // each point is coloured by the aircraft whose margin it is
  const dot = ({ cx, cy, payload }) => (
    <circle cx={cx} cy={cy} r={4} fill={statusOf(payload.margin, byId(payload.aircraft)).color}
      stroke="var(--paper)" strokeWidth={1.5} />
  );
  const setValue = (k, v) => setValues((s) => ({ ...s, [k]: v }));
  const Chart = view.Chart;

  return (
    <div className="wrap" style={{ "--accent": status.color }}>
      <style>{CSS}</style>

      <header className="plate">
        <div className="plate-l">
          <button className="change" onClick={backToFleet} aria-label="Change aircraft">
            <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 5-5 5 5 5" />
            </svg>
            {aircraft.label}
          </button>
          <h1>Power assurance</h1>
        </div>
        <div className="plate-r">
          <label className="hfield">
            <span>Reg</span>
            <input className="reg" value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} />
          </label>
          <label className="hfield">
            <span>Date</span>
            <input className="dt" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
      </header>

      {updated && (
        <div className="updated" role="status">
          <span>A newer version is installed and will be used next time the app is opened.</span>
          <button onClick={() => window.location.reload()}>Restart now</button>
        </div>
      )}

      <nav className="tabs">
        <button className={tab === "check" ? "tab on" : "tab"} aria-current={tab === "check" ? "page" : undefined}
          onClick={() => setTab("check")}>Check</button>
        <button className={tab === "trend" ? "tab on" : "tab"} aria-current={tab === "trend" ? "page" : undefined}
          onClick={() => setTab("trend")}>
          Trend{records.length ? ` · ${records.length}` : ""}
        </button>
      </nav>

      {tab === "check" && (
        <>
          {/* What is fitted, then what this check applies to. They are drawn
              apart because they are not the same kind of choice: the first
              is set once for the aircraft, the second every check. */}
          <Options opts={fittedOptions(aircraft)} config={config} set={setOption} />
          {checkOptions(aircraft).length > 0 && (
            <Options opts={checkOptions(aircraft)} config={config} set={setOption} caption="This check" />
          )}

          {meta && (
            <details className="cond" open={condOpen} onToggle={(e) => setCondOpen(e.currentTarget.open)}>
              <summary>
                <span className="cond-id">
                  <b>{meta.src}</b>
                  <span className="rev">{meta.rev || "Revision not recorded — confirm against the manual on board."}</span>
                </span>
                <span className="cond-more">
                  Conditions
                  <svg viewBox="0 0 20 20" width="11" height="11" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 8 5 5 5-5" />
                  </svg>
                </span>
              </summary>
              <p>{meta.cond}</p>
            </details>
          )}

          <div className="inputs">
            {[...aircraft.inputs, { key: "hours", label: "Eng hrs", unit: "", placeholder: "—" }].map((i) => (
              <label key={i.key} className="field">
                <span>{i.label}{i.unit ? ` ${i.unit}` : ""}</span>
                <input type="number" inputMode="decimal"
                  value={i.key === "hours" ? hours : (values[i.key] ?? "")}
                  placeholder={i.placeholder}
                  onChange={(e) => (i.key === "hours" ? setHours(e.target.value) : setValue(i.key, e.target.value))} />
              </label>
            ))}
          </div>

          {!chart ? (
            <section className="panel gap">
              <p className="missing">
                {(aircraft.noChart && aircraft.noChart(config))
                  || "No chart digitised for this fit yet."}
              </p>
            </section>
          ) : (
            <section className="panel">
              {offChart.length > 0 && (
                <div className="offchart" role="alert">
                  <b>Off the chart — no margin computed</b>
                  {offChart.map((m, i) => <span key={i}>{m}</span>)}
                </div>
              )}

              <div className="hero">
                <div className="big">
                  <span>{result ? (result.margin > 0 ? "+" : "") + fmt(result.margin) : "––"}</span><i>{aircraft.marginUnit}</i>
                </div>
                <div className="hero-side">
                  <b>{result ? status.label : aircraft.marginLabel}</b>
                  {result && <span>{aircraft.marginLabel}</span>}
                </div>
                <button className="share" onClick={shareCard} disabled={!result} aria-label="Share this check as an image">
                  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor"
                    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 12.6V2.9" /><path d="M6.6 6.1 10 2.7l3.4 3.4" />
                    <path d="M4.6 10.9v5a1.2 1.2 0 0 0 1.2 1.2h8.4a1.2 1.2 0 0 0 1.2-1.2v-5" />
                  </svg>
                  Share
                </button>
              </div>

              {waiting.length > 0 && offChart.length === 0 && (
                <p className="waiting">Enter {waiting.join(", ")}</p>
              )}

              {result && <Gauge aircraft={aircraft} margin={result.margin} />}
              {/* The answer in words, not only in colour. A margin at or
                  above zero is a pass however small it is — the amber band
                  is the operator's caution on top, not a different verdict. */}
              {result && status.key !== "fail" && aircraft.passNote && (
                <p className="verdict pass">{aircraft.passNote}</p>
              )}
              {status.key === "watch" && aircraft.watchNote && (
                <p className="quiet watchnote">{aircraft.watchNote}</p>
              )}
              {status.key === "fail" && aircraft.failNote && (
                <p className="verdict fail">{aircraft.failNote}</p>
              )}

              <div className="stats">
                {(result ? result.stats : proc.compute({ chart, aircraft, oat: NaN, pa: NaN, tq: NaN, mgt: NaN }).stats)
                  .map((st) => <div key={st.label}><b>{result ? st.value : "—"}</b><span>{st.label}</span></div>)}
              </div>

              {(result ? result.notes : []).map((a, i) => <p key={i} className="alert">{a}</p>)}

              <div className="chartwrap">
                <div className="chartscroll">
                  <Chart chart={chart} frame={frame} readings={nums} result={result} />
                </div>
              </div>

              <div className="save">
                <input value={note} placeholder="Note" onChange={(e) => setNote(e.target.value)} />
                <button className="btn" disabled={!result} onClick={handleSave}>Log check</button>
              </div>
              {!storeOk && <p className="alert">Storage unavailable — export to CSV to keep these.</p>}
            </section>
          )}
        </>
      )}

      {tab === "trend" && (
        <section className="panel">
          {loading ? <p className="quiet">Loading</p> : groups.length === 0 ? (
            <div className="empty">
              <p className="quiet">No checks logged yet.</p>
              <button className="btn" onClick={() => setTab("check")}>Log a check</button>
            </div>
          ) : (
            <>
              <div className="seg wrapseg">
                {groups.map((g) => (
                  <button key={g.key} className={active && active.key === g.key ? "on" : ""}
                    onClick={() => setTrendReg(g.key)}>{g.label}</button>
                ))}
              </div>

              <div className="stats tstats">
                <div>
                  <b style={{ color: statusOf(series[series.length - 1].margin, seriesAircraft).color }}>
                    {(series[series.length - 1].margin > 0 ? "+" : "") + fmt(series[series.length - 1].margin)}
                  </b><span>Latest {seriesAircraft.marginUnit}</span>
                </div>
                <div><b>{series.length}</b><span>Checks</span></div>
                <div>
                  <b style={{ color: trend && trend.per < 0 ? "var(--amber)" : "var(--green)" }}>
                    {trend ? (trend.per > 0 ? "+" : "") + fmt(trend.per) : "—"}
                  </b><span>{trend ? trend.unit : "Trend"}</span>
                </div>
              </div>

              <div className="tchart">
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={series} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey={useHours ? "hours" : "label"} type={useHours ? "number" : "category"}
                      domain={useHours ? ["dataMin - 5", "dataMax + 5"] : undefined}
                      tick={{ fontSize: 11, fill: "var(--ink-3)" }} stroke="var(--rule)" />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ink-3)" }} stroke="var(--rule)" width={42} />
                    <Tooltip contentStyle={{ borderRadius: 2, border: "1px solid var(--rule)", fontSize: 12 }}
                      formatter={(v) => [fmt(v) + " " + (seriesAircraft.marginUnit), "Margin"]} />
                    <ReferenceLine y={0} stroke="var(--red)" />
                    <ReferenceLine y={10} stroke="var(--amber)" strokeDasharray="4 4" />
                    <Line type="linear" dataKey="margin" stroke="var(--ink)" strokeWidth={1.6} dot={dot} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th><th>Hrs</th>
                      {seriesAircraft.inputs.map((i) => <th key={i.key}>{i.label}</th>)}
                      <th>Margin</th><th />
                    </tr>
                  </thead>
                  <tbody>
                    {[...series].reverse().map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td>
                        <td>{Number.isFinite(r.hours) ? fmt(r.hours, 0) : "—"}</td>
                        {seriesAircraft.inputs.map((i) => (
                          <td key={i.key}>{fmt(r[i.key], i.unit === "ft" || i.unit === "°C" ? 0 : 1)}</td>
                        ))}
                        <td style={{ color: statusOf(r.margin, seriesAircraft).color, fontWeight: 600 }}>
                          {(r.margin > 0 ? "+" : "") + fmt(r.margin)}
                        </td>
                        <td><button className="x" onClick={() => persist(records.filter((q) => q.id !== r.id))}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="io">
            <button className="btn ghost" onClick={exportCSV} disabled={!records.length}>Export CSV</button>
            <button className="btn ghost" onClick={() => fileRef.current.click()}>Import CSV</button>
            <input ref={fileRef} type="file" accept=".csv" onChange={importCSV} style={{ display: "none" }} />
          </div>
        </section>
      )}

      {flash && <p className="flash">{flash}</p>}

      <footer className="foot">
        {aircraft.footer}
        <span className="build">build {__BUILD__}</span>
      </footer>
    </div>
  );
}

/* The margin on this aircraft's own dial. Zero is the only marked point,
   because it is the only one the chart gives: at or past it the reading was
   over the chart's maximum. A band short of zero would be a judgement, and
   an aircraft states one only where its own manual does. */
function Gauge({ aircraft, margin }) {
  const [from, to] = aircraft.gauge;
  const at = (v) => `${((v - from) / (to - from)) * 100}%`;
  const unit = aircraft.marginUnit;
  return (
    <div className="gauge">
      <div className="gauge-bar">
        <span className="z zr" style={{ width: at(0) }} />
        <span className="z zg" />
        <i className="pin" style={{ left: at(Math.max(from, Math.min(to, margin))) }} />
      </div>
      <div className="gauge-ticks">
        <span style={{ left: at(from) }}>{from < 0 ? "−" + Math.abs(from) : from}</span>
        <span style={{ left: at(0) }}>0</span>
        <span style={{ left: at(to) }}>{to} {unit}</span>
      </div>
    </div>
  );
}
/* A segmented control is captioned with what it chooses — "Inlet" over
   Basic / AFS — unless every choice already says it, which would print
   "Engine" over Engine 1 and Engine 2. */
const groupLabel = (opt) =>
  opt.label && !opt.choices.every((c) => c.label.toLowerCase().startsWith(opt.label.toLowerCase()))
    ? opt.label : null;

/* Segmented pickers and switches for one scope of options. */
function Options({ opts, config, set, caption }) {
  if (!opts.length) return null;
  return (
    <div className="config">
      {caption && <span className="scope">{caption}</span>}
      {opts.map((opt) => opt.type === "segmented" ? (
        <div className="optgroup" key={opt.key}>
          {groupLabel(opt) && <span className="optlbl">{groupLabel(opt)}</span>}
          <div className="seg" role="group" aria-label={opt.label || opt.key}>
            {opt.choices.map((c) => (
              <button key={c.id} className={config[opt.key] === c.id ? "on" : ""}
                aria-pressed={config[opt.key] === c.id}
                onClick={() => set(opt.key, c.id)}>{c.label}</button>
            ))}
          </div>
        </div>
      ) : (
        <button key={opt.key} className={config[opt.key] ? "switch on" : "switch"} role="switch"
          aria-checked={!!config[opt.key]} aria-label={opt.label}
          onClick={() => set(opt.key, !config[opt.key])}>
          <span className="track"><span className="knob" /></span>
          <span className="switch-lbl">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

/* "Basic / AFS", "snow deflectors off" — the fitted options in words. */
function labelConfig(aircraft, config) {
  return aircraft.options.map((o) => {
    if (o.type === "switch") return `${o.label.toLowerCase()} ${config[o.key] ? "on" : "off"}`;
    const c = o.choices.find((x) => x.id === config[o.key]);
    return c ? c.label : "";
  }).filter(Boolean);
}
