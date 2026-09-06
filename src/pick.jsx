import React from "react";

/* The page the app opens on: which aircraft is being checked.

   It is a page rather than a control on the check page because the answer
   changes everything downstream — which charts are read, which readings are
   asked for, which limits apply — and because getting it wrong is silent:
   a 212's numbers typed into the 407's chart still produce a confident
   margin. Making it the first deliberate act of a check is the point.

   A card is a name, its engine and the action. Anything more is read on the
   check page a tap later, where it is actually needed. */

export function AircraftSelect({ aircraft, lastId, onPick }) {
  return (
    <>
      <header className="plate">
        <div className="plate-l">
          <span className="badge">POWER ASSURANCE</span>
          <h1>Select aircraft</h1>
        </div>
      </header>

      <div className="fleet">
        {aircraft.map((a) => (
          <button key={a.id} className="card" onClick={() => onPick(a.id)}>
            <span className="card-head">
              <b>{a.label}</b>
              {a.id === lastId && <em>Last used</em>}
            </span>
            {a.powerplant && <span className="card-eng">{a.powerplant}</span>}
            <span className="card-cta">
              Start check
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 10h11" /><path d="m10.4 5.4 4.6 4.6-4.6 4.6" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <footer className="foot">
        Trending aid — the flight manual is the authority for any release.
      </footer>
    </>
  );
}
