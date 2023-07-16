import type { Dimensions } from "../core/types";

import { getCssDimensions } from "../utils/getCssDimensions";

export function getDimensions(element: Element): Dimensions {
  return getCssDimensions(element);
}
