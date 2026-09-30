/** Single source of truth: wheel parameters in millimetres. */
export interface WheelState {
  /** Bead seat diameter, mm. */
  D: number;
  /** Rim width, mm. */
  W: number;
  /** ET offset, mm. */
  ET: number;
  /** X-factor: from the mounting face to the inner side of the spokes, mm. */
  X: number;
  tire: boolean;
  /** Tire width, mm. */
  tw: number;
  /** Tire aspect ratio, %. */
  ta: number;
}
