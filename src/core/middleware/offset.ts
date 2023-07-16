import type { Coords, Derivable, Middleware, MiddlewareState } from "../types";
import { evaluate } from "../utils/evaluate";
import { getAlignment } from "../utils/getAlignment";
import { getMainAxisFromPlacement } from "../utils/getMainAxisFromPlacement";
import { getSide } from "../utils/getSide";

type OffsetValue =
  | number
  | Partial<{
      /**
       * The axis that runs along the side of the floating element. Represents
       * the distance (gutter or margin) between the reference and floating
       * element.
       * @default 0
       */
      mainAxis: number;
      /**
       * The axis that runs along the alignment of the floating element.
       * Represents the skidding between the reference and floating element.
       * @default 0
       */
      crossAxis: number;
      /**
       * The same axis as `crossAxis` but applies only to aligned placements
       * and inverts the `end` alignment. When set to a number, it overrides the
       * `crossAxis` value.
       *
       * A positive number will move the floating element in the direction of
       * the opposite edge to the one that is aligned, while a negative number
       * the reverse.
       * @default null
       */
      alignmentAxis: number | null;
    }>;

// For type backwards-compatibility, the `OffsetOptions` type was also
// Derivable.
export type OffsetOptions = OffsetValue | Derivable<OffsetValue>;

export async function convertValueToCoords(
  state: MiddlewareState,
  options: OffsetOptions,
): Promise<Coords> {
  const { placement, platform, elements } = state;
  const rtl = await platform.isRTL?.(elements.floating);

  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getMainAxisFromPlacement(placement) === "x";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);

  // eslint-disable-next-line prefer-const
  let { mainAxis, crossAxis, alignmentAxis } =
    typeof rawValue === "number"
      ? { mainAxis: rawValue, crossAxis: 0, alignmentAxis: null }
      : { mainAxis: 0, crossAxis: 0, alignmentAxis: null, ...rawValue };

  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }

  return isVertical
    ? { x: crossAxis * crossAxisMulti, y: mainAxis * mainAxisMulti }
    : { x: mainAxis * mainAxisMulti, y: crossAxis * crossAxisMulti };
}

/**
 * Modifies the placement by translating the floating element along the
 * specified axes.
 * A number (shorthand for `mainAxis` or distance), or an axes configuration
 * object may be passed.
 */
export const offset = (options: OffsetOptions = 0): Middleware => ({
  name: "offset",
  options,
  async fn(state) {
    const { x, y } = state;
    const diffCoords = await convertValueToCoords(state, options);

    return {
      x: x + diffCoords.x,
      y: y + diffCoords.y,
      data: diffCoords,
    };
  },
});
