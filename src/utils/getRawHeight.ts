import pixelate from "./pixelate";

let getRawHeight = (
  element: HTMLElement,
  inPixels: boolean = false
): number | string => {
  let { clientHeight } = element;

  return inPixels
    ? (pixelate(clientHeight) as string)
    : (clientHeight as number);
};

export default getRawHeight;
