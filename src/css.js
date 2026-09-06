export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap');

.wrap{
  --paper:#fff; --base:#f4f6f7; --line:#dfe5e7; --line-2:#eef1f2;
  --ink:#16272c; --ink-2:#4a6067; --ink-3:#8b9ba1;
  --green:#0d6a4d; --amber:#ad5f0b; --red:#9c211a;
  font-family:'Barlow',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:var(--ink); background:var(--base); font-size:15px; line-height:1.5;
  max-width:820px; margin:0 auto; padding:0 0 40px;
}
.wrap *{box-sizing:border-box;}
.wrap button:focus-visible,.wrap input:focus-visible{outline:2px solid var(--ink);outline-offset:2px;}
@media(prefers-reduced-motion:reduce){.wrap *{transition:none!important;}}

.plate{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;
  background:var(--paper);border-bottom:1px solid var(--line);padding:22px 20px 16px;}
.badge{font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;font-size:11px;letter-spacing:.22em;
  color:var(--ink-3);}
/* the way back to the aircraft page — a real target, not a caption */
.change{display:inline-flex;align-items:center;gap:7px;font-family:'Barlow Semi Condensed',sans-serif;
  font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-2);
  background:none;border:1px solid var(--line);padding:6px 11px;margin:0 0 9px -1px;cursor:pointer;
  transition:border-color .18s,color .18s;-webkit-tap-highlight-color:transparent;}
.change svg{display:block;}
.change:hover{border-color:var(--ink-3);color:var(--ink);}
.plate h1{font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;font-size:29px;margin:0;
  letter-spacing:-.015em;line-height:1.05;}
.plate-r{display:flex;gap:18px;}
.hfield{display:flex;flex-direction:column;gap:3px;}
.hfield span{font-size:10px;font-weight:600;color:var(--ink-3);letter-spacing:.08em;text-transform:uppercase;}
.reg,.dt{font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;font-size:17px;border:0;
  border-bottom:1px solid var(--line);background:none;color:var(--ink);padding:3px 0 5px;width:96px;
  letter-spacing:.1em;transition:border-color .2s;}
.reg:focus,.dt:focus{border-bottom-color:var(--ink);}
.reg:focus-visible,.dt:focus-visible{outline:none;box-shadow:inset 0 -2px 0 -1px var(--ink);}
.reg::placeholder{color:#c3ced2;}
.dt{width:132px;font-size:14px;letter-spacing:0;}

.fleet{display:grid;gap:1px;background:var(--line);border-top:1px solid var(--line);
  border-bottom:1px solid var(--line);}
@media(min-width:640px){.fleet{grid-template-columns:1fr 1fr;}}
.card{display:flex;flex-direction:column;align-items:stretch;gap:5px;text-align:left;font:inherit;
  background:var(--paper);border:0;padding:22px 20px;cursor:pointer;transition:background .18s;
  -webkit-tap-highlight-color:transparent;}
.card:hover{background:#fafcfc;}
.card:active{background:#f2f6f7;}
.card-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;}
.card-head b{font-family:'Barlow Semi Condensed',sans-serif;font-size:26px;font-weight:600;
  letter-spacing:-.01em;line-height:1.1;color:var(--ink);}
.card-head em{font-style:normal;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  color:var(--ink-3);border:1px solid var(--line);padding:2px 7px;}
.card-eng{font-size:13px;color:var(--ink-3);}
.card-cta{display:inline-flex;align-items:center;gap:7px;margin-top:9px;
  font-family:'Barlow Semi Condensed',sans-serif;font-size:14px;font-weight:600;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink);}
.card-cta svg{display:block;transition:transform .22s;}
.card:hover .card-cta svg{transform:translateX(3px);}

.tabs{display:flex;gap:26px;background:var(--paper);border-bottom:1px solid var(--line);padding:0 20px;}
.tab{font:inherit;font-size:14px;font-weight:500;background:none;border:0;color:var(--ink-3);
  padding:15px 0;cursor:pointer;border-bottom:1px solid transparent;margin-bottom:-1px;transition:color .2s;}
.tab.on{color:var(--ink);border-bottom-color:var(--ink);}

.config{display:flex;gap:16px 22px;flex-wrap:wrap;align-items:flex-end;padding:20px 20px 0;}
.config .scope{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);flex-basis:100%;margin-bottom:-6px;}
.optgroup{display:flex;flex-direction:column;gap:6px;}
.optlbl{font-size:10px;font-weight:600;color:var(--ink-3);letter-spacing:.08em;text-transform:uppercase;}
.seg{display:inline-flex;}
.seg button{font:inherit;font-size:13px;font-weight:500;background:none;color:var(--ink-3);cursor:pointer;
  border:1px solid var(--line);border-right:0;padding:10px 16px;transition:all .18s;
  -webkit-tap-highlight-color:transparent;}
.seg button:last-child{border-right:1px solid var(--line);}
.seg button.on{background:var(--ink);border-color:var(--ink);color:var(--paper);}
.wrapseg{flex-wrap:wrap;margin-bottom:18px;}
.wrapseg button{border-right:1px solid var(--line);margin:0 -1px 0 0;}

.switch{display:inline-flex;align-items:center;gap:11px;background:none;border:0;padding:0;cursor:pointer;}
.track{position:relative;width:46px;height:26px;border-radius:999px;background:#e8edee;
  border:1px solid var(--line);overflow:hidden;
  transition:background .3s,border-color .3s,box-shadow .3s;}
.track::after{content:"";position:absolute;inset:0;border-radius:999px;pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.7),rgba(255,255,255,0) 58%);}
.knob{position:absolute;top:3px;left:3px;z-index:2;width:18px;height:18px;border-radius:50%;
  background:linear-gradient(180deg,#fff,#e4eaeb);box-shadow:0 1px 2px rgba(16,38,44,.28);
  transition:transform .44s cubic-bezier(.34,1.52,.64,1),background .3s,box-shadow .3s;}
.switch.on .track{background:linear-gradient(180deg,#ffa23f 0%,#ff7a14 45%,#f95d00 100%);
  border-color:#f95d00;}
.switch.on .knob{transform:translateX(20px);background:linear-gradient(180deg,#fff,#fff2e6);
  box-shadow:0 1px 4px rgba(140,45,0,.42);}
.switch-lbl{font-size:14px;color:var(--ink-3);transition:color .2s;}
.switch.on .switch-lbl{color:#d1550a;font-weight:600;}

.share{margin-left:auto;align-self:center;display:inline-flex;align-items:center;gap:7px;font:inherit;
  font-size:13px;font-weight:500;color:var(--ink-2);background:none;border:1px solid var(--line);
  padding:7px 13px;cursor:pointer;transition:border-color .18s,color .18s;}
.share:hover{border-color:var(--ink-3);color:var(--ink);}
.share:disabled{color:#c3ced2;border-color:var(--line-2);cursor:default;}
.share svg{display:block;}

.cond{padding:16px 20px 0;}
.cond summary{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
  list-style:none;cursor:pointer;padding:4px 0 6px;-webkit-tap-highlight-color:transparent;}
.cond summary::-webkit-details-marker{display:none;}
.cond b{font-family:'Barlow Semi Condensed',sans-serif;font-size:14px;font-weight:600;color:var(--ink-2);}
.cond-more{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;color:var(--ink-3);white-space:nowrap;transition:color .18s;}
.cond-more svg{display:block;transition:transform .22s;}
.cond[open] .cond-more svg{transform:rotate(180deg);}
.cond summary:hover .cond-more{color:var(--ink);}
.cond p{margin:0;padding-bottom:2px;font-size:11.5px;color:var(--ink-3);line-height:1.45;max-width:70ch;}
.cond-id{display:block;}
.cond .rev{display:block;font-size:10.5px;font-weight:500;color:var(--ink-2);margin-top:1px;}

.inputs{display:grid;grid-template-columns:repeat(5,1fr);gap:0;margin:18px 0 0;
  border-top:1px solid var(--line);background:var(--paper);}
@media(max-width:560px){.inputs{grid-template-columns:repeat(2,1fr);}.inputs label:last-child{grid-column:span 2;}}
.field{display:flex;flex-direction:column;gap:6px;padding:14px 16px 16px;border-right:1px solid var(--line-2);
  border-bottom:1px solid var(--line);transition:background .18s,box-shadow .18s;}
.field:last-child{border-right:0;}
.field:focus-within{background:#fafcfc;box-shadow:inset 0 0 0 1.5px var(--ink);}
.field span{font-size:10px;font-weight:600;color:var(--ink-3);letter-spacing:.08em;text-transform:uppercase;}
.field input{font-family:'Barlow Semi Condensed',sans-serif;font-size:26px;font-weight:600;border:0;
  background:none;width:100%;padding:2px 0 0;color:var(--ink);font-variant-numeric:tabular-nums;
  min-width:0;line-height:1.2;}
.field input:focus,.field input:focus-visible{outline:none;}
.field input::placeholder{color:#ccd6d9;}

.panel{background:var(--paper);border-bottom:1px solid var(--line);padding:26px 20px 24px;}
.missing{margin:0;font-size:14px;color:var(--ink-2);}

.hero{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;row-gap:14px;}
.big{display:flex;align-items:baseline;gap:4px;color:var(--accent);
  font-family:'Barlow Semi Condensed',sans-serif;font-weight:600;font-variant-numeric:tabular-nums;}
.big span{font-size:76px;line-height:.82;letter-spacing:-.03em;}
.big i{font-size:23px;font-style:normal;}
.hero-side{display:flex;flex-direction:column;gap:1px;}
.hero-side b{font-family:'Barlow Semi Condensed',sans-serif;font-size:15px;font-weight:600;
  color:var(--accent);letter-spacing:.1em;text-transform:uppercase;}
.hero-side span{font-size:10px;font-weight:600;color:var(--ink-3);letter-spacing:.08em;text-transform:uppercase;}
.waiting{margin:20px 0 0;font-size:13px;color:var(--ink-3);}

.gauge{position:relative;margin:26px 0 8px;}
.gauge-bar{position:relative;display:flex;height:3px;}
.z{display:block;height:100%;}
.zr{background:var(--red);}
.zg{flex:1;background:var(--green);}
.pin{position:absolute;top:-5px;width:1px;height:13px;background:var(--ink);}
.gauge-ticks{position:relative;height:14px;}
.gauge-ticks span{position:absolute;top:5px;transform:translateX(-50%);font-size:10px;color:var(--ink-3);
  font-variant-numeric:tabular-nums;}

.stats{display:flex;margin:22px 0 0;border-top:1px solid var(--line);}
.stats div{flex:1;padding:12px 0 0;display:flex;flex-direction:column;}
.stats b{font-family:'Barlow Semi Condensed',sans-serif;font-size:25px;font-weight:600;
  font-variant-numeric:tabular-nums;line-height:1.1;}
.stats span{font-size:10px;color:var(--ink-3);font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-top:1px;}
.tstats{margin:0 0 18px;border-top:0;}

.alert{font-size:13px;color:var(--red);border-left:2px solid var(--red);padding:2px 0 2px 12px;margin:18px 0 0;}

.chartwrap{position:relative;margin:26px -20px 0;border-top:1px solid var(--line);}
.chartscroll{padding:20px 0 4px;overflow-x:auto;-webkit-overflow-scrolling:touch;}
/* every chart is drawn 720 units wide, so below this the panel cannot hold it
   and the fade says so — above it the chart fits and there is nothing to hint */
@media(max-width:759px){
  .chartwrap::after{content:"";position:absolute;top:1px;right:0;bottom:0;width:34px;pointer-events:none;
    background:linear-gradient(90deg,rgba(255,255,255,0),var(--paper));}
}
.chart{display:block;margin:0 20px;}
.c-grid{stroke:#eef2f3;stroke-width:.7;}
.c-frame{fill:none;stroke:#c2ced2;stroke-width:1;}
.c-curve{fill:none;stroke:#b9c7cb;stroke-width:.8;}
.c-live{fill:none;stroke:var(--accent);stroke-width:1.8;}
.c-trace line{stroke:var(--accent);stroke-width:1.4;stroke-dasharray:5 3.5;}
.c-trace circle{fill:var(--accent);}
.c-trace circle.c-obs{fill:var(--paper);stroke:var(--accent);stroke-width:1.8;}
.c-head{font-family:'Barlow Semi Condensed',sans-serif;font-size:10.5px;font-weight:600;letter-spacing:.1em;fill:var(--ink-3);}
.c-right{text-anchor:end;}
.c-tick{font-size:9px;fill:var(--ink-3);font-variant-numeric:tabular-nums;}
.c-mid{text-anchor:middle;}
.c-lbl{font-size:8px;fill:var(--ink-3);}
.c-live-lbl{fill:var(--accent);font-weight:600;font-size:9px;}
.c-end{text-anchor:end;}
.c-read{font-family:'Barlow Semi Condensed',sans-serif;font-size:15px;font-weight:600;fill:var(--accent);}

.save{display:flex;gap:10px;margin-top:26px;padding-top:20px;border-top:1px solid var(--line);}
.save input{flex:1;font:inherit;font-size:14px;padding:9px 0;border:0;border-bottom:1px solid var(--line);
  background:none;color:var(--ink);min-width:0;}
.save input:focus{border-bottom-color:var(--ink);}
.save input:focus-visible{outline:none;box-shadow:inset 0 -2px 0 -1px var(--ink);}
.btn{font-family:'Barlow Semi Condensed',sans-serif;font-size:15px;font-weight:600;letter-spacing:.03em;
  background:var(--ink);color:var(--paper);border:1px solid var(--ink);padding:9px 20px;cursor:pointer;
  white-space:nowrap;transition:opacity .18s;}
.btn:hover{opacity:.86;}
.btn:disabled{background:none;color:#c3ced2;border-color:var(--line);cursor:default;opacity:1;}
.btn.ghost{background:none;color:var(--ink);border-color:var(--line);}
.btn.ghost:disabled{color:#c3ced2;}
.flash{font-size:13px;color:var(--green);margin:0;padding:14px 20px 0;}
.quiet{color:var(--ink-3);font-size:14px;margin:2px 0 16px;}
.empty{display:flex;flex-direction:column;align-items:flex-start;gap:4px;}

.tchart{margin:0 -8px;}
.tablewrap{overflow-x:auto;margin-top:14px;}
table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums;}
th{text-align:left;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);
  border-bottom:1px solid var(--line);padding:0 12px 7px 0;white-space:nowrap;}
td{padding:9px 12px 9px 0;border-bottom:1px solid var(--line-2);white-space:nowrap;}
.x{background:none;border:0;color:#c3ced2;font-size:17px;cursor:pointer;padding:6px 10px;line-height:1;}
.x:hover{color:var(--red);}
.io{display:flex;gap:10px;margin-top:22px;padding-top:18px;border-top:1px solid var(--line);}
.offchart{display:block;margin:0 0 22px;padding:13px 15px;background:#fdf6ec;
  border:1px solid var(--amber);border-left-width:3px;}
.offchart b{display:block;font-size:12.5px;font-weight:600;color:var(--ink);
  letter-spacing:.02em;margin-bottom:5px;}
.offchart span{display:block;font-size:12.5px;color:var(--ink-2);line-height:1.5;margin-top:3px;}
.updated{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:11px 20px;
  background:var(--ink);color:#e8eef0;font-size:12.5px;}
.updated span{flex:1;min-width:200px;}
.updated button{font:inherit;font-weight:600;color:var(--ink);background:#e8eef0;
  border:0;padding:6px 12px;cursor:pointer;}
.foot{padding:16px 20px 0;font-size:11.5px;color:var(--ink-3);}
.build{display:block;margin-top:6px;font-variant-numeric:tabular-nums;color:#b3c1c5;}
`;
