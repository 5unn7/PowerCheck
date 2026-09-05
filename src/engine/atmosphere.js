/* Standard atmosphere, shared by every aircraft. */
export const isaTemp = (pa) => 15 - 1.98 * (pa / 1000);
export const densityAlt = (pa, oat) => pa + 118.8 * (oat - isaTemp(pa));
