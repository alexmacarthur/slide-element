import { Options } from "./types";

const addEventListenerTypes: string[] = ["transitionend", "transitioncancel"];

let ELEMENT: HTMLElement;
let OPTIONS: Options;

/**
 * Add transition event listeners to given element.
 */
const addEventListeners = (callback: EventListener): void => {
  addEventListenerTypes.forEach((listenerType) => {
    ELEMENT.addEventListener(
      listenerType as keyof HTMLElementEventMap,
      callback
    );
  });
};

/**
 * Remove transition event listeners from given element.
 */
const removeEventListeners = (callback: EventListener): void => {
  addEventListenerTypes.forEach((listenerType) => {
    ELEMENT.removeEventListener(
      listenerType as keyof HTMLElementEventMap,
      callback
    );
  });
};

/**
 * Fire a one-time function when an animation has completed.
 */
const waitForAnimationCompletion = (): Promise<void> => {
  return new Promise((resolve) => {
    const eventListenerCallback = function (): void {
      removeEventListeners(eventListenerCallback);
      resolve();
    };

    addEventListeners(eventListenerCallback);
  });
};

/**
 * Set initial CSS required to perform height transition.
 */
const updateTransitionProperties = (add: boolean = true): void => {
  const animationStyles = Object.assign(
    {
      height: "",
      overflow: "hidden",
      transitionDuration: ".25s",
      transitionTimingFunction: "ease"
    },
    OPTIONS
  );

  if (add) {
    Object.assign(ELEMENT.style, animationStyles);
    return;
  }

  // Unset properties from element...
  Object.keys(animationStyles).forEach((p: string) => (ELEMENT.style[p] = ""));
};

/**
 * Given a bunch of before/after property values, trigger a CSS animation
 * before & after the next repaint.
 */
const triggerAnimation = (direction: "down" | "up"): Promise<void> => {
  return new Promise((resolve) => {
    updateTransitionProperties();

    const heightValues: string[] = [
      "0px",
      window.getComputedStyle(ELEMENT).height,
    ];

    if (direction === "up") {
      heightValues.reverse();
    }

    const [from, to] = heightValues;

    waitForAnimationCompletion().then(() => {
      updateTransitionProperties(false);

      resolve();
    });

    ELEMENT.style.height = from;

    // This update must happen on a separate tick in order to trigger an animation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ELEMENT.style.height = to;
      });
    });
  });
};

/**
 * Animate an element open.
 */
export const down = async (
  element: HTMLElement,
  options = {}
): Promise<boolean> => {
  ELEMENT = element;
  OPTIONS = options;

  element.dataset.isSlidOpen = "1";
  element.style.display = "block";

  await triggerAnimation("down");

  return Promise.resolve(true);
};

/**
 * Animate an element closed.
 */
export const up = async (element, options = {}): Promise<boolean> => {
  ELEMENT = element;
  OPTIONS = options;

  await triggerAnimation("up");

  delete element.dataset.isSlidOpen;
  element.style.display = "none";
  return Promise.resolve(false);
};

/**
 * Animate an element open or closed based on its state.
 */
export const toggle = (
  element: HTMLElement,
  options = {}
): Promise<boolean> => {
  ELEMENT = element;
  OPTIONS = options;

  return element.dataset.isSlidOpen
    ? up(element, options)
    : down(element, options);
};
