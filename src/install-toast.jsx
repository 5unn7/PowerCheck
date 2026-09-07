import React from "react";

/* The install offer, in the terms of the browser it is talking to.

   No heading and no pitch — just the action. Where there is an API that is a
   button; where there is not it is where the button lives, drawn with the same
   glyphs the browser uses so it can be followed without reading. Where there is
   no path at all, nothing is shown. See install.js. */

const Share = () => (                        // iOS share glyph, so the instruction is unmistakable
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13V2.6" /><path d="M6.8 5.8 10 2.6l3.2 3.2" />
    <path d="M5 9.4v7.2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.4" />
  </svg>
);
const Plus = () => (                         // the Add to Home Screen row
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <rect x="3.2" y="3.2" width="13.6" height="13.6" rx="3.4" />
    <path d="M10 6.8v6.4M6.8 10h6.4" />
  </svg>
);

export function InstallToast({ target, onInstall, onDismiss }) {
  const t = target || {};
  let body = null;

  if (t.kind === "prompt") {
    body = <button className="btn install-go" onClick={onInstall}>Install</button>;
  } else if (t.kind === "ios-safari") {
    body = <p className="install-how"><Share /> then <Plus /> <b>Add to Home Screen</b></p>;
  } else if (t.kind === "ios-other") {
    // naming Safari is the whole of it: this browser has no install path
    body = <p className="install-how"><b>Open in Safari</b> — <Share /> <b>Add to Home Screen</b></p>;
  } else if (t.kind === "mac-safari") {
    body = <p className="install-how"><Share /> then <b>Add to Dock</b></p>;
  } else if (t.kind === "android-firefox") {
    body = <p className="install-how"><b>⋮</b> then <b>Install</b></p>;
  } else {
    return null;                             // nothing this browser can do
  }

  return (
    <div className="install" role="dialog" aria-label="Install this app">
      <div className="install-text">{body}</div>
      <button className="install-x" onClick={onDismiss} aria-label="Not now">×</button>
    </div>
  );
}
