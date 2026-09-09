import React from "react";

/* The install offer, in the terms of the browser it is talking to.

   Built to Apple's own install-banner anatomy, because that is the thing a
   phone user already knows how to read: the app's icon, its name, and one
   button. Set in the system font rather than the app's, so it presents as the
   platform's prompt and not as more app chrome.

   Every browser gets the same button. Where there is a real install API the
   button installs. Where there is not — iOS has none at all — the button opens
   the steps, drawn as the rows the browser is about to show, same glyphs and
   same words, so what is on the card and what is on the screen match. Where
   there is no path at all, nothing is offered. See install.js. */

/* The icon inline rather than linked: it has to be right on a first visit with
   no network, under any base path, and it is 600 bytes. Same art as
   icons/icon.svg — a positive margin over the gauge the app is built around. */
const AppIcon = () => (
  <svg className="install-icon" viewBox="0 0 512 512" width="52" height="52" aria-hidden="true">
    <rect width="512" height="512" fill="#16272c" />
    <g fill="#7fd0ae">
      <rect x="186" y="184" width="140" height="30" />
      <rect x="241" y="129" width="30" height="140" />
    </g>
    <rect x="86" y="322" width="38" height="30" fill="#9c211a" />
    <rect x="124" y="322" width="38" height="30" fill="#c2820e" />
    <rect x="162" y="322" width="264" height="30" fill="#0d6a4d" />
    <rect x="332" y="306" width="10" height="62" fill="#f4f6f7" />
  </svg>
);

const Share = () => (                        // the iOS share glyph, as the toolbar draws it
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 12.6V2.6" /><path d="M6.8 5.8 10 2.6l3.2 3.2" />
    <path d="M5.4 9.2v7a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1v-7" />
  </svg>
);
const Plus = () => (                         // the Add to Home Screen row's own glyph
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="3.4" y="3.4" width="13.2" height="13.2" rx="3.6" />
    <path d="M10 6.9v6.2M6.9 10h6.2" />
  </svg>
);
const Dots = () => (                         // Android's overflow menu
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
    <circle cx="10" cy="4.4" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="10" cy="15.6" r="1.5" />
  </svg>
);
const Compass = () => (                      // Safari, for the browsers that must hand over to it
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
    <circle cx="10" cy="10" r="7.4" /><path d="m13.2 6.8-1.9 4.5-4.5 1.9 1.9-4.5z" />
  </svg>
);
const Close = () => (                        // the grey circled × iOS closes things with
  <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
    <path d="M1.6 1.6 10.4 10.4M10.4 1.6 1.6 10.4" />
  </svg>
);

/* Each manual route as the rows it actually is. The last row is where you end
   up, so the card's subtitle is taken from it — the crew sees the destination
   before they ask for the way. */
const ROUTES = {
  "ios-safari": [
    { glyph: <Share />, label: "Share", hint: "in the toolbar" },
    { glyph: <Plus />, label: "Add to Home Screen" },
  ],
  "mac-safari": [
    { glyph: <Share />, label: "Share", hint: "in the toolbar" },
    { glyph: <Plus />, label: "Add to Dock" },
  ],
  "android-firefox": [
    { glyph: <Dots />, label: "Menu", hint: "top right" },
    { glyph: <Plus />, label: "Install" },
  ],
  "ios-other": [
    { glyph: <Compass />, label: "Open in Safari" },
    { glyph: <Share />, label: "Share", hint: "in the toolbar" },
    { glyph: <Plus />, label: "Add to Home Screen" },
  ],
};

export function InstallToast({ target, onInstall, onDismiss }) {
  const [open, setOpen] = React.useState(false);
  const t = target || {};
  const route = ROUTES[t.kind];

  if (t.kind !== "prompt" && !route) return null;   // nothing this browser can do

  // the destination, which is the last row of the route. A browser that
  // installs on its own has no destination to name, and gets no subtitle.
  const sub = route ? route[route.length - 1].label : null;

  return (
    <div className="install">
      <div className="install-card" role="dialog" aria-label="Install PowerCheck">
        <div className="install-row">
          <AppIcon />
          <div className="install-text">
            <b className="install-name">PowerCheck</b>
            {/* the destination, until the steps spell it out themselves */}
            {sub && !open && <span className="install-sub">{sub}</span>}
          </div>
          {!open && (
            <button className="install-go" aria-expanded={route ? open : undefined}
              onClick={() => (route ? setOpen(true) : onInstall())}>Install</button>
          )}
          <button className="install-x" onClick={onDismiss} aria-label="Not now"><Close /></button>
        </div>

        {open && route && (
          <ol className="install-steps">
            {route.map((s) => (
              <li className="install-step" key={s.label}>
                <span className="install-step-glyph">{s.glyph}</span>
                <span className="install-step-label">{s.label}</span>
                {s.hint && <span className="install-step-hint">{s.hint}</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
