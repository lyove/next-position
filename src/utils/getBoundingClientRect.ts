import type { ClientRectObject, VirtualElement } from "../core/types";
import { rectToClientRect } from "../core";

import { getScale } from "../platform/getScale";
import { isElement } from "../platform/isElement";
import { getVisualOffsets, shouldAddVisualOffsets } from "./getVisualOffsets";
import { getWindow } from "./getWindow";
import { createCoords } from "./math";
import { unwrapElement } from "./unwrapElement";

export function getBoundingClientRect(
  element: Element | VirtualElement,
  includeScale = false,
  isFixedStrategy = false,
  offsetParent?: Element | Window,
): ClientRectObject {
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);

  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }

  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent)
    ? getVisualOffsets(domElement)
    : createCoords(0);

  let x = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;

  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin =
      offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;

    let currentIFrame = win.frameElement;
    while (currentIFrame && offsetParent && offsetWin !== win) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle(currentIFrame);
      const left =
        iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top =
        iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;

      x *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;

      x += left;
      y += top;

      currentIFrame = getWindow(currentIFrame).frameElement;
    }
  }

  return rectToClientRect({ width, height, x, y });
}
