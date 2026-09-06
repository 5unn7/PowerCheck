/* One stylesheet, plain CSS, no build step and nothing fetched.

   There is deliberately no web font. The app is meant to work with no signal,
   and a font loaded from a CDN is the one thing on the page that cannot: an
   installed PWA offline never gets it, so every phone that matters was
   already falling back to the system face. The type is now designed on the
   face the crew actually see. */
export const CSS = `
.wrap{
  --paper:#fff; --base:#f4f6f7; --line:#dfe5e7; --line-2:#eef1f2;
  --ink:#16272c; --ink-2:#42565c; --ink-3:#5d7076;
  /* a control that is off — never words anyone has to read */
  --faint:#93a3a8;
  --green:#0d6a4d; --amber:#985409; --red:#9c211a;
  --green-wash:#f0f7f4; --amber-wash:#fdf6ec; --red-wash:#fdf3f2;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  color:var(--ink); background:var(--base); font-size:15px; line-height:1.5;
  max-width:820px; margin:0 auto; padding:0 0 40px;
}
.wrap *{box-sizing:border-box;}
.wrap button:focus-visible,.wrap input:focus-visible{outline:2px solid var(--ink);outline-offset:2px;}
/* the spinners are a mouse control on a form that is filled on a phone */
.wrap input::-webkit-outer-spin-button,.wrap input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.wrap input[type=number]{-moz-appearance:textfield;appearance:textfield;}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}
@media(prefers-reduced-motion:reduce){.wrap *{transition:none!important;}}

/* ------------------------------- header ------------------------------- */

.plate{display:flex;justify-content:space-between;align-items:flex-end;gap:16px 24px;flex-wrap:wrap;
  background:var(--paper);border-bottom:1px solid var(--line);padding:20px 20px 16px;}
.badge{font-size:11px;font-weight:700;letter-spacing:.18em;color:var(--ink-3);}
/* the way back to the aircraft page — a real target, not a caption */
.change{display:inline-flex;align-items:center;gap:7px;font:inherit;
  font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2);
  background:none;border:1px solid var(--line);padding:7px 12px;margin:0 0 10px -1px;cursor:pointer;
  transition:border-color .18s,color .18s;-webkit-tap-highlight-color:transparent;}
.change svg{display:block;}
.change:hover{border-color:var(--ink-3);color:var(--ink);}
.plate h1{font-size:27px;font-weight:700;margin:0;letter-spacing:-.02em;line-height:1.1;}
.plate-r{display:flex;gap:18px;flex-wrap:wrap;}
.hfield{display:flex;flex-direction:column;gap:2px;}
.hfield span{font-size:10px;font-weight:700;color:var(--ink-3);letter-spacing:.09em;text-transform:uppercase;}
.hfield input{font-size:16px;font-weight:600;border:0;border-bottom:1px solid var(--line);
  background:none;color:var(--ink);padding:4px 0 5px;font-variant-numeric:tabular-nums;
  transition:border-color .2s;}
.hfield input:focus{border-bottom-color:var(--ink);}
.hfield input:focus-visible{outline:none;box-shadow:inset 0 -2px 0 -1px var(--ink);}
.hfield input::placeholder{color:var(--ink-3);}
.reg{width:94px;letter-spacing:.08em;}
.dt{width:136px;}
.hrs{width:78px;}

/* ------------------------------- fleet -------------------------------- */

.fleet{display:grid;gap:1px;background:var(--line);border-top:1px solid var(--line);
  border-bottom:1px solid var(--line);}
@media(min-width:640px){.fleet{grid-template-columns:1fr 1fr;}}
.card{display:flex;align-items:center;gap:16px;text-align:left;font:inherit;
  background:var(--paper);border:0;padding:20px;cursor:pointer;transition:background .18s;
  -webkit-tap-highlight-color:transparent;}
.card:hover{background:#fafcfc;}
.card:active{background:#f2f6f7;}
.card-txt{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1;}
.card-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;}
.card-head b{font-size:24px;font-weight:700;letter-spacing:-.02em;line-height:1.15;color:var(--ink);}
.card-head em{font-style:normal;font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:var(--ink-3);border:1px solid var(--line);padding:2px 7px;}
.card-eng{font-size:13px;color:var(--ink-3);}
.card svg{display:block;flex:none;color:var(--ink-3);transition:transform .22s,color .18s;}
.card:hover svg{transform:translateX(3px);color:var(--ink);}

/* -------------------------------- tabs -------------------------------- */

.tabs{display:flex;gap:26px;background:var(--paper);border-bottom:1px solid var(--line);padding:0 20px;}
.tab{font:inherit;font-size:14px;font-weight:600;background:none;border:0;color:var(--ink-3);
  padding:14px 0;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .2s;}
.tab.on{color:var(--ink);border-bottom-color:var(--ink);}

/* ------------------------------ options ------------------------------- */

.config{display:flex;gap:14px 22px;flex-wrap:wrap;align-items:flex-end;padding:18px 20px 0;}
.config .scope{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  color:var(--ink-3);flex-basis:100%;margin-bottom:-4px;}
.optgroup{display:flex;flex-direction:column;gap:6px;}
.optlbl{font-size:10px;font-weight:700;color:var(--ink-3);letter-spacing:.09em;text-transform:uppercase;}
.seg{display:inline-flex;}
.seg button{font:inherit;font-size:13px;font-weight:500;background:var(--paper);color:var(--ink-2);cursor:pointer;
  border:1px solid var(--line);border-right:0;padding:10px 15px;transition:background .18s,color .18s,border-color .18s;
  -webkit-tap-highlight-color:transparent;}
.seg button:last-child{border-right:1px solid var(--line);}
.seg button:hover{color:var(--ink);}
.seg button.on{background:var(--ink);border-color:var(--ink);color:var(--paper);}
.wrapseg{flex-wrap:wrap;margin-bottom:18px;}
.wrapseg button{border-right:1px solid var(--line);margin:0 -1px 0 0;}

/* A fitted option is a fact about the airframe, not a warning, so it is
   drawn in the same ink as everything else that is simply on. */
.switch{display:inline-flex;align-items:center;gap:10px;background:none;border:0;padding:0;cursor:pointer;
  -webkit-tap-highlight-color:transparent;}
.track{position:relative;width:42px;height:24px;border-radius:999px;background:#e4eaeb;
  border:1px solid var(--line);transition:background .22s,border-color .22s;}
.knob{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--paper);
  box-shadow:0 1px 2px rgba(16,38,44,.3);transition:transform .22s;}
.switch.on .track{background:var(--ink);border-color:var(--ink);}
.switch.on .knob{transform:translateX(18px);}
.switch-lbl{font-size:14px;color:var(--ink-2);transition:color .2s;}
.switch.on .switch-lbl{color:var(--ink);font-weight:600;}

/* ---------------------------- chart identity --------------------------- */

.cond{padding:16px 20px 0;}
.cond summary{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
  list-style:none;cursor:pointer;padding:4px 0 6px;-webkit-tap-highlight-color:transparent;}
.cond summary::-webkit-details-marker{display:none;}
.cond b{font-size:13px;font-weight:600;color:var(--ink-2);}
.cond-more{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:.09em;
  text-transform:uppercase;color:var(--ink-3);white-space:nowrap;transition:color .18s;}
.cond-more svg{display:block;transition:transform .22s;}
.cond[open] .cond-more svg{transform:rotate(180deg);}
.cond summary:hover .cond-more{color:var(--ink);}
.cond p{margin:0;padding-bottom:2px;font-size:12px;color:var(--ink-3);line-height:1.5;max-width:70ch;}
.cond-id{display:block;}
.cond .rev{display:block;font-size:11px;font-weight:400;color:var(--ink-3);margin-top:1px;}

/* ------------------------------- readings ------------------------------ */

.inputs{display:grid;grid-template-columns:repeat(4,1fr);margin:18px 0 0;
  border-top:1px solid var(--line);background:var(--paper);}
@media(max-width:560px){.inputs{grid-template-columns:repeat(2,1fr);}}
.field{display:flex;flex-direction:column;gap:5px;padding:13px 16px 15px;border-right:1px solid var(--line-2);
  border-bottom:1px solid var(--line);transition:background .18s,box-shadow .18s;}
.field:last-child{border-right:0;}
.field:focus-within{background:#fafcfc;box-shadow:inset 0 0 0 1.5px var(--ink);}
.field span{font-size:10px;font-weight:700;color:var(--ink-3);letter-spacing:.09em;text-transform:uppercase;}
.field input{font-size:25px;font-weight:600;border:0;background:none;width:100%;padding:2px 0 0;
  color:var(--ink);font-variant-numeric:tabular-nums;letter-spacing:-.02em;min-width:0;line-height:1.2;}
.field input:focus,.field input:focus-visible{outline:none;}

/* a reading that put the check off the chart is marked where it was typed */
.field.bad{background:var(--amber-wash);box-shadow:inset 2px 0 0 var(--amber);}
.field.bad span{color:var(--amber);}

/* ------------------------------- result -------------------------------- */

.panel{background:var(--paper);border-bottom:1px solid var(--line);padding:24px 20px;}
.missing{margin:0;font-size:14px;color:var(--ink-2);}

.hero{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;}
.big{display:flex;align-items:baseline;gap:4px;color:var(--accent);font-weight:700;
  font-variant-numeric:tabular-nums;letter-spacing:-.035em;}
.big span{font-size:66px;line-height:.9;}
/* no answer yet: the place it will land, not a number blacked out */
.big.pending{color:var(--ink-3);}
.big.pending span{font-size:34px;}
.big i{font-size:22px;font-style:normal;letter-spacing:0;}
.hero-side{display:flex;flex-direction:column;gap:2px;padding-bottom:4px;}
.hero-side b{font-size:11px;font-weight:700;color:var(--ink-3);letter-spacing:.09em;text-transform:uppercase;}
.waiting{margin:16px 0 0;font-size:13px;color:var(--ink-3);}

.gauge{position:relative;margin:22px 0 4px;}
.gauge-bar{position:relative;display:flex;height:4px;}
.z{display:block;height:100%;}
.zr{background:var(--red);}
.za{background:var(--amber);}
.zg{flex:1;background:var(--green);}
.pin{position:absolute;top:-5px;width:2px;height:14px;background:var(--ink);}
.gauge-ticks{position:relative;height:15px;}
.gauge-ticks span{position:absolute;top:5px;transform:translateX(-50%);font-size:10px;color:var(--ink-3);
  font-variant-numeric:tabular-nums;white-space:nowrap;}
.gauge-ticks .t0{transform:none;}
.gauge-ticks .t1{transform:translateX(-100%);}

/* One treatment for what the check says, in three colours: what the manual
   says on a pass, the operator's caution, and the manual's next step on a
   failure. The colour repeats the verdict, it does not carry it alone. */
.verdict{margin:18px 0 0;padding:2px 0 2px 12px;font-size:13.5px;line-height:1.5;max-width:68ch;
  border-left:2px solid var(--ink-3);color:var(--ink-2);}
.verdict.pass{border-color:var(--green);}
.verdict.watch{border-color:var(--amber);}
.verdict.fail{border-color:var(--red);color:var(--ink);}
.verdict b{display:block;font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;
  margin-bottom:2px;}
.verdict.pass b{color:var(--green);}
.verdict.watch b{color:var(--amber);}
.verdict.fail b{color:var(--red);}

.stats{display:flex;gap:16px;margin:22px 0 0;border-top:1px solid var(--line);}
.stats div{flex:1;padding:12px 0 0;display:flex;flex-direction:column;min-width:0;}
.stats b{font-size:24px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1.15;}
.stats span{font-size:10px;color:var(--ink-3);font-weight:700;letter-spacing:.09em;text-transform:uppercase;margin-top:2px;}
.tstats{margin:0 0 18px;border-top:0;}

.offchart{display:block;margin:0 0 20px;padding:13px 15px;background:var(--amber-wash);
  border:1px solid var(--amber);border-left-width:3px;}
.offchart b{display:block;font-size:12.5px;font-weight:700;color:var(--ink);margin-bottom:4px;}
.offchart span{display:block;font-size:12.5px;color:var(--ink-2);line-height:1.5;margin-top:3px;}

/* -------------------------------- chart -------------------------------- */

/* The chart is laid out for the width it is drawn at, so it always fits:
   there is nothing to scroll sideways and nothing to fade off the edge. */
.chartwrap{margin:22px -20px 0;border-top:1px solid var(--line);padding:18px 20px 4px;}
.chart{display:block;width:100%;height:auto;}
.c-grid{stroke:#eaf0f1;stroke-width:.7;}
.c-frame{fill:none;stroke:#c2ced2;stroke-width:1;}
.c-curve{fill:none;stroke:#bcc9cd;stroke-width:.8;}
.c-live{fill:none;stroke:var(--accent);stroke-width:1.8;}
.c-trace line{stroke:var(--accent);stroke-width:1.4;stroke-dasharray:5 3.5;}
.c-trace circle{fill:var(--accent);}
.c-trace circle.c-obs{fill:var(--paper);stroke:var(--accent);stroke-width:1.8;}
.c-head{font-size:10.5px;font-weight:700;letter-spacing:.08em;fill:var(--ink-3);}
.c-right{text-anchor:end;}
.c-tick{font-size:9px;fill:var(--ink-3);font-variant-numeric:tabular-nums;}
.c-mid{text-anchor:middle;}
.c-lbl{font-size:8.5px;fill:var(--ink-3);}
.c-live-lbl{fill:var(--accent);font-weight:700;font-size:9.5px;}
.c-end{text-anchor:end;}
.c-read{font-size:14px;font-weight:700;fill:var(--accent);font-variant-numeric:tabular-nums;}
/* drawn small on a phone, so the type is set in units that hold up there */
@media(max-width:560px){
  .c-head{font-size:12px;}
  .c-tick{font-size:11px;}
  .c-lbl{font-size:10.5px;}
  .c-live-lbl{font-size:11px;}
  .c-read{font-size:16px;}
}

/* ------------------------------- actions ------------------------------- */

.save{display:flex;gap:10px;align-items:center;margin-top:22px;padding-top:18px;border-top:1px solid var(--line);}
.save input{flex:1;font:inherit;font-size:14px;padding:9px 0;border:0;border-bottom:1px solid var(--line);
  background:none;color:var(--ink);min-width:0;}
.save input::placeholder{color:var(--ink-3);}
.save input:focus{border-bottom-color:var(--ink);}
.save input:focus-visible{outline:none;box-shadow:inset 0 -2px 0 -1px var(--ink);}
.btn{font:inherit;font-size:14px;font-weight:600;background:var(--ink);color:var(--paper);
  border:1px solid var(--ink);padding:10px 18px;cursor:pointer;white-space:nowrap;transition:opacity .18s;}
.btn:hover{opacity:.86;}
.btn:disabled{background:none;color:var(--faint);border-color:var(--line);cursor:default;opacity:1;}
.btn.ghost{background:none;color:var(--ink);border-color:var(--line);}
.btn.ghost:hover{border-color:var(--ink-3);opacity:1;}
.btn.ghost:disabled{color:var(--faint);border-color:var(--line);}
.btn.icon{display:inline-flex;align-items:center;gap:7px;}
.btn svg{display:block;}

.quiet{color:var(--ink-3);font-size:14px;margin:2px 0 16px;}
.empty{display:flex;flex-direction:column;align-items:flex-start;gap:6px;}

/* --------------------------------- log --------------------------------- */

.tchart{margin:0 -8px;}
.tablewrap{overflow-x:auto;margin-top:14px;}
table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums;}
th{text-align:left;font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3);
  border-bottom:1px solid var(--line);padding:0 12px 7px 0;white-space:nowrap;}
td{padding:8px 12px 8px 0;border-bottom:1px solid var(--line-2);white-space:nowrap;}
.tx{width:1px;padding-right:0;}
.x{background:none;border:0;color:var(--ink-3);font-size:18px;cursor:pointer;padding:11px 12px;line-height:1;}
.x:hover{color:var(--red);}
.io{display:flex;gap:10px;margin-top:20px;padding-top:18px;border-top:1px solid var(--line);}

/* ------------------------------ messages ------------------------------- */

.alert{font-size:13px;color:var(--red);border-left:2px solid var(--red);padding:2px 0 2px 12px;margin:18px 0 0;}
.toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:20;max-width:90vw;
  background:var(--ink);color:#eef3f4;font-size:13px;padding:11px 18px;margin:0;
  box-shadow:0 4px 16px rgba(16,38,44,.24);}
.updated{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:11px 20px;
  background:var(--ink);color:#e8eef0;font-size:12.5px;}
.updated span{flex:1;min-width:200px;}
.updated button{font:inherit;font-weight:600;color:var(--ink);background:#e8eef0;
  border:0;padding:7px 13px;cursor:pointer;}
.foot{padding:16px 20px 0;font-size:11.5px;color:var(--ink-3);line-height:1.55;}
.build{display:block;margin-top:6px;font-variant-numeric:tabular-nums;}
`;
