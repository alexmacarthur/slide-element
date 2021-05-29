import { Options } from "./types";

let SlideController = (element: HTMLElement, options: Options) => {
  let eventListenerTypes: string[] = ["transitionend", "transitioncancel"];

  let getRawHeight = () => element.clientHeight;
  let getElementStyle = () => element.style;
  let setDisplay = (value: string) => (getElementStyle().display = value);

  /**
   * Fire a one-time function when an animation has completed.
   */
  let waitForAnimationCompletion = (): Promise<void> => {
    return new Promise((resolve) => {
      eventListenerTypes.forEach((listenerType) => {
        element[`on${listenerType}`] = () => {
          // Remove all listeners.
          eventListenerTypes.forEach((type) => (element[`on${type}`] = null));

          resolve();
        };
      });
    });
  };

  /**
   * Set initial CSS required to perform height transition.
   */
  let updateTransitionProperties = (forceClear = false): void => {
    let animationStyles = Object.assign(
      {
        height: "",
        overflow: "hidden",
        transitionDuration: ".25s",
        transitionTimingFunction: "ease",
      },
      options
    );

    Object.entries(animationStyles).forEach(([key, value]) => {
      getElementStyle()[key] = forceClear ? "" : value;
    });
  };

  /**
   * Given a bunch of before/after property values, trigger a CSS animation
   * before & after the next repaint.
   */
  let triggerAnimation = (willOpen: boolean): Promise<void> => {
    return new Promise((resolve) => {
      updateTransitionProperties();

      let heightValues: string[] = [`${getRawHeight()}px`, "0px"];

      if (willOpen) {
        heightValues.reverse();
      }

      let [from, to] = heightValues;

      waitForAnimationCompletion().then(() => {
        updateTransitionProperties(true);

        resolve();
      });

      getElementStyle().height = from;

      // This update must happen on a separate tick in order to trigger an animation.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          getElementStyle().height = to;
        });
      });
    });
  };

  let up = async () => {
    await triggerAnimation(false);

    setDisplay("none");

    return Promise.resolve(false);
  };

  let down = async () => {
    setDisplay("block");

    await triggerAnimation(true);

    return Promise.resolve(true);
  };

  let toggle = () => {
    return getRawHeight() ? up() : down();
  };

  return { up, down, toggle };
};

/**
 * Animate an element open.
 */
export let down = async (
  element: HTMLElement,
  options = {}
): Promise<boolean> => {
  return await SlideController(element, options).down();
};

/**
 * Animate an element closed.
 */
export let up = async (element, options = {}): Promise<boolean> => {
  return await SlideController(element, options).up();
};

/**
 * Animate an element open or closed based on its state.
 */
export let toggle = (element: HTMLElement, options = {}): Promise<boolean> => {
  return SlideController(element, options).toggle();
};
