import * as bell407 from "./aircraft/bell-407/view.jsx";
import * as bell212 from "./aircraft/bell-212-pt6t3/view.jsx";

/* The drawing half of each aircraft's chart, kept apart from the reading
   half so the chart maths can be tested with plain node and no build step —
   node cannot import .jsx, and an aircraft's index.js must stay importable.

   Keyed by aircraft id, like everything else. */
export const VIEWS = {
  "bell-407": bell407,
  "bell-212-pt6t3": bell212,
};
