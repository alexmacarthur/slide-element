import toEachAnimation from "./utils/toEachAnimation";
import getRawHeight from "./utils/getRawHeight";

declare var window: any;

type Options = KeyframeAnimationOptions & {
  duration?: number;
  easing?: string;
  display?: string;
};

type SlideMethods = {
  up: Function;
  down: Function;
};

let defaultOptions = {
  easing: "ease",
  duration: 250,
  fill: "forwards",
  display: "block",
};

let SlideController = (
  element: HTMLElement,
  options: Options
): SlideMethods => {
  window.seCache = window.seCache || new Map();

  let getElementStyle = () => element.style;
  let setDisplay = (value: string) => (getElementStyle().display = value);
  let setData = (value: string) => (element.dataset.se = value);
  let getHeight = (inPixels = false) => getRawHeight(element, inPixels);

  let mergedOptions: Options = Object.assign({}, defaultOptions, options);
  let openDisplayValue = mergedOptions.display as string;
  let closedDisplayValue = "none";

  let getCachedHeight = () => window.seCache.get(element);
  let setCachedHeight = (value: string) => window.seCache.set(element, value);

  let expandedHeight = (() => {
    // We have the expanded height already cached from before, so use that.
    if (getCachedHeight()) return getCachedHeight();

    // The element is already visible, so grab the height.
    if (getHeight()) {
      setCachedHeight(getHeight(true) as string);
      return getCachedHeight();
    }

    // There's no height, which means it's invisible.
    setDisplay(openDisplayValue);
    setCachedHeight(getHeight(true) as string);
    setDisplay(closedDisplayValue);

    return getCachedHeight();
  })();

  let createAnimation = (willOpen: boolean, lowerBound): Animation => {
    delete mergedOptions.display;

    let frames = [getHeight(true), lowerBound].map((height) => ({
      height,
      overflow: "hidden",
    }));

    if (willOpen) {
      frames[0].height = expandedHeight;
      frames.reverse();
    }

    // Don't permit an animation if the user doesn't want it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)")?.matches) {
      mergedOptions.duration = 0;
    }

    let animation = element.animate(frames, mergedOptions);

    animation.play();

    return animation;
  };

  /**
   * Find any animations already in progress and finish them. There should
   * only ever be one active, so it only searchs for the first.
   */
  let getExistingAnimations = (): Animation[] => {
    return element.getAnimations();
  };

  /**
   * Trigger animation pointed in a particular direction. If one is found
   * already in progress, this will throw and prevent the Promise from
   * resolving as if it successfully animated.
   */
  let triggerAnimation = async (willOpen: boolean): Promise<boolean | null> => {
    let existingAnimations = getExistingAnimations();

    toEachAnimation(existingAnimations, (a: Animation) => a.pause());

    // If we're opening the element, determine the starting point in case this is
    // happening in the middle of a previous animation that was aborted. For this reason,
    // the "lower bound" height will not necessarily be zero.
    let currentHeight: string = willOpen ? (getHeight(true) as string) : "0px";

    // Make it visible before we animate it open.
    if (willOpen) setDisplay(openDisplayValue);

    await createAnimation(willOpen, currentHeight).finished;

    if (!willOpen) setDisplay(closedDisplayValue);

    element.setAttribute("aria-expanded", willOpen as unknown as string);

    toEachAnimation(existingAnimations, (a: Animation) => a.cancel());

    delete element.dataset.se;

    return willOpen;
  };

  /**
   * Attempt to animate the element and return the
   * directional value. If it fails, return null.
   */
  let animateOrNull = async (
    directionalValue: boolean
  ): Promise<boolean | null> => {
    try {
      return await triggerAnimation(directionalValue);
    } catch (e) {
      return null;
    }
  };

  /**
   * Slide the element up/closed.
   */
  let up = async (): Promise<boolean | null> => {
    setData("0");

    return await animateOrNull(false);
  };

  /**
   * Slide the element down/open.
   */
  let down = async (): Promise<boolean | null> => {
    setData("1");

    return await animateOrNull(true);
  };

  return { up, down };
};

/**
 * Animate an element open.
 */
export let down = (
  element: HTMLElement,
  options: Options = {}
): Promise<boolean | null> => {
  return SlideController(element, options).down();
};

/**
 * Animate an element closed.
 */
export let up = (
  element: HTMLElement,
  options: Options = {}
): Promise<boolean | null> => {
  return SlideController(element, options).up();
};

/**
 * Animate an element open or closed based on its state.
 */
export let toggle = (
  element: HTMLElement,
  options: Options = {}
): Promise<boolean | null> => {
  let elData = element.dataset.se;
  let condition = elData
    ? elData === "1" // Element is currently opening.
    : getRawHeight(element);

  return SlideController(element, options)[condition ? "up" : "down"]();
};
