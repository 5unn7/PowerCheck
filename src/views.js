import * as torqueKMgt from "./procedures/torque-k-mgt/view.jsx";
import * as setTorqueOatLimits from "./procedures/set-torque-oat-limits/view.jsx";

/* The drawing half of each procedure, kept apart from the reading half so the
   chart maths can be tested with plain node and no build step. */
export const VIEWS = {
  "torque-k-mgt": torqueKMgt,
  "set-torque-oat-limits": setTorqueOatLimits,
};
