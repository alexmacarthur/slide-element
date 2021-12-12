import getRawHeight from "./utils/getRawHeight";
import afterNextRepaint from "./utils/afterNextRepaint";

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

let defaultOptions: Partial<Options> = {
  easing: "ease",
  duration: 250,
  fill: "backwards",
  display: "block",
};

let SlideController = (
  element: HTMLElement,
  options: Partial<Options>
): SlideMethods => {
  let getElementStyle = () => element.style;
  let setDisplay = (value: string) => (getElementStyle().display = value);
  let setData = (value: string) => (element.dataset.se = value);
  let getHeight = (inPixels = false) => getRawHeight(element, inPixels);
  let getComputed = () => window.getComputedStyle(element);
  let setOverflow = (set: boolean) =>
    (element.style.overflow = set ? "auto" : "");

  let mergedOptions: Options = Object.assign({}, defaultOptions, options);
  let openDisplayValue = mergedOptions.display as string;
  let closedDisplayValue = "none";

  let createAnimation = (willOpen: boolean, lowerBound): Animation => {
    delete mergedOptions.display;

    let currentHeight = getHeight(true);
    let frames = [currentHeight, lowerBound].map((height) => ({
      height,
      paddingTop: "0px",
      paddingBottom: "0px",
    }));

    let { paddingTop, paddingBottom } = getComputed();
    frames[0].paddingTop = paddingTop;
    frames[0].paddingBottom = paddingBottom;

    if (willOpen) {
      frames[0].height = currentHeight;
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
   * Trigger animation pointed in a particular direction. If one is found
   * already in progress, `null` will be returned rather than a `boolean.
   */
  let triggerAnimation = async (willOpen: boolean): Promise<boolean | null> => {
    // Finish any active animations before we trigger a new one.
    let finishedAnimations = element
      .getAnimations()
      .map((animation) => animation.finish());

    afterNextRepaint(async () => {
      // If we're opening the element, determine the starting point in case this is
      // happening in the middle of a previous animation that was aborted. For this reason,
      // the "lower bound" height will not necessarily be zero.
      let currentHeight: string = willOpen
        ? (getHeight(true) as string)
        : "0px";

      // Make it visible before we animate it open.
      if (willOpen) setDisplay(openDisplayValue);

      setOverflow(true);

      await createAnimation(willOpen, currentHeight).finished;

      setOverflow(false);

      if (!willOpen) setDisplay(closedDisplayValue);

      delete element.dataset.se;
    });

    return finishedAnimations.length ? null : willOpen;
  };

  /**
   * Slide the element up/closed.
   */
  let up = async (): Promise<boolean | null> => {
    setData("0");

    return triggerAnimation(false);
  };

  /**
   * Slide the element down/open.
   */
  let down = async (): Promise<boolean | null> => {
    setData("1");

    return triggerAnimation(true);
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
