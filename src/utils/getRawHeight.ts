import pixelate from "./pixelate";

let getRawHeight = (
  element: HTMLElement,
  inPixels = false
): number | string => {
  let { clientHeight } = element;

  return inPixels ? pixelate(clientHeight) : clientHeight;
};

export default getRawHeight;
