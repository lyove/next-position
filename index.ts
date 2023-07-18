import { computePosition, autoUpdate, autoPlacement, offset, flip, shift, arrow } from "./src";
import type { ReferenceElement } from "./src/core/types";

const wrapper = document.querySelector(".wrapper")! as HTMLElement;
const scrollBox = document.querySelector(".scroll-box")! as HTMLElement;

const wrapperRect = wrapper.getBoundingClientRect();
scrollBox.scrollTop = (1000 - wrapperRect.height) / 2 + 10;
scrollBox.scrollLeft = (2000 - wrapperRect.width) / 2 + 10;

const referenceEl = document.querySelector("#button") as ReferenceElement;
const floatingEl = document.querySelector("#tooltip") as HTMLElement;
const arrowElement = document.querySelector("#arrow") as HTMLElement;

autoUpdate(referenceEl, floatingEl, () => {
  // // auto
  // computePosition(referenceEl, floatingEl, {
  //   middleware: [
  //     autoPlacement((state) => ({
  //       // padding: 5, // 0 by default
  //       padding: state.rects.reference.width,
  //       crossAxis: true,
  //       alignment: "start", // top-start, right-start, bottom-start, left-start
  //       // autoAlignment: false,
  //     })),
  //   ],
  // }).then(({ placement }) => {
  //   console.log(placement); // 'top', 'bottom', 'left' or 'right'
  // });

  // custom
  computePosition(referenceEl, floatingEl, {
    placement: "left",
    middleware: [offset(6), flip(), shift({ padding: 5 }), arrow({ element: arrowElement })],
  }).then(({ x, y, placement, middlewareData }) => {
    Object.assign(floatingEl.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    // Accessing the data
    const { x: arrowX, y: arrowY } = middlewareData.arrow as any;

    const staticSide: any = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]];

    Object.assign(arrowElement.style, {
      left: arrowX != null ? `${arrowX}px` : "",
      top: arrowY != null ? `${arrowY}px` : "",
      right: "",
      bottom: "",
      [staticSide]: "-4px",
    });
  });
});
