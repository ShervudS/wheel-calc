/** Sidewall height, mm. */
export function sidewall(tw: number, ta: number): number {
  return (tw * ta) / 100;
}

/** Overall wheel diameter with the tire, mm. */
export function overallDiameter(D: number, tw: number, ta: number): number {
  return D + 2 * sidewall(tw, ta);
}
