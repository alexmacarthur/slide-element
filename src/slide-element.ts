import {
  AnyObject,
  CssPropertyValues,
  CallbackFunction,
  Options,
} from "./types";

const animatableProperties: string[] = [
  "height",
  "paddingTop",
  "paddingBottom",
];

const defaultOptions: Options = {
  duration: 0.25,
  timingFunction: "ease",
};

/**
 * Set the height & padding style attributes on an element.
 */
const setStyleAttributes = (
  element: HTMLElement,
  propertyValues: CssPropertyValues,
  propertiesPermittedToChange = animatableProperties
): void => {
  for (let property in propertyValues) {
    if (!propertiesPermittedToChange.includes(property)) {
      delete propertyValues[property as string];
    }
  }
  Object.assign(element.style, propertyValues);
};

/**
 * Add transition event listeners to given element.
 */
const addEventListeners = (
  element: HTMLElement,
  callback: CallbackFunction
): void => {
  element.addEventListener("transitionend", callback);
  element.addEventListener("transitioncancel", callback);
};

/**
 * Remove transition event listeners from given element.
 */
const removeEventListeners = (
  element: HTMLElement,
  callback: CallbackFunction
): void => {
  element.removeEventListener("transitionend", callback);
  element.removeEventListener("transitioncancel", callback);
};

/**
 * Fire a one-time function when an animation has completed.
 */
const onAnimationComplete = (
  element: HTMLElement,
  property: string
): Promise<void> => {
  return new Promise((resolve) => {
    const eventListenerCallback = function (e: TransitionEvent): void {
      if (camelize(e.propertyName) === property) {
        removeEventListeners(element, eventListenerCallback);
        resolve();
      }
    };

    addEventListeners(element, eventListenerCallback);
  });
};

/**
 * Convert a CSS property into a camelCased version, used by JS.
 */
const camelize = (string: string): string => {
  return string.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Reset explicit values for padding or height attributes
 * after respective animations are complete, and then
 * fire a callback after the animation is effectively "complete."
 */
const resetAfterAnimation = (
  element: HTMLElement,
  changedProperties: Array<string>
): Promise<void> => {
  return new Promise((resolve) => {
    const promises = changedProperties.reduce(
      (proms: Promise<void>[], property) => {
        proms.push(onAnimationComplete(element, property));

        return proms;
      },
      []
    );

    return Promise.all(promises).then(() => {
      unsetProperties(element, [
        ...animatableProperties,
        "overflow",
        "transitionProperty",
        "transitionDuration",
        "transitionTimingFunction",
      ]);

      resolve();
    });
  });
};

/**
 * Reset the given style properties on an element.
 */
const unsetProperties = (
  element: HTMLElement,
  properties: Array<string>
): void => {
  properties.forEach((p: string) => (element.style[p] = ""));
};

/**
 * Set initial CSS required to perform height transition.
 */
const setTransitionProperties = (
  element: HTMLElement,
  options: AnyObject
): void => {
  const computedStyle = getStyles(element);
  const { duration, timingFunction } = options;
  const animationStyles = {
    overflow: "hidden",
    transitionProperty: "padding, height",
    transitionDuration: `${duration}s`,
    transitionTimingFunction: timingFunction,
  };

  /**
   * Set these properties only if they aren't already set. If we blindly set them every run,
   * the animation will not work as expected because a reflow is triggered.
   */
  for (let k in animationStyles) {
    if (computedStyle[k] === animationStyles[k]) {
      delete animationStyles[k];
    }
  }

  Object.assign(element.style, animationStyles);
};

/**
 * Given a collection of CSS from/to values, return array of the ones that are different.
 */
const getChanged = (properties: any) => {
  return Object.keys(properties).reduce(
    (changedProperties: string[], property: string) => {
      const values = properties[property].map((v: string) => parseInt(v, 10));
      if (values[0] == values[1]) {
        return changedProperties;
      }

      changedProperties.push(property);
      return changedProperties;
    },
    []
  );
};

/**
 * Retrieve the computed styles for an element.
 */
const getStyles = (element: HTMLElement): { [key: string]: any } => {
  return window.getComputedStyle(element);
};

/**
 * Given a bunch of before/after property values, trigger a CSS animation
 * before & after the next repaint.
 */
const triggerAnimation = (
  element: HTMLElement,
  options: object,
  propertyValues: AnyObject,
  callback: () => any
): void => {
  const {
    fromTopPadding,
    fromBottomPadding,
    fromHeight,
    toTopPadding,
    toBottomPadding,
    toHeight,
  } = propertyValues;
  const changedProperties = getChanged({
    paddingTop: [fromTopPadding, toTopPadding],
    paddingBottom: [fromBottomPadding, toBottomPadding],
    height: [fromHeight, toHeight],
  });

  resetAfterAnimation(element, changedProperties).then(callback);

  setStyleAttributes(
    element,
    {
      paddingTop: fromTopPadding,
      paddingBottom: fromBottomPadding,
      height: fromHeight,
    },
    changedProperties
  );

  setTransitionProperties(element, options);

  // This update must happen on a separate tick in order to trigger an animation.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setStyleAttributes(
        element,
        {
          paddingTop: toTopPadding,
          paddingBottom: toBottomPadding,
          height: toHeight,
        },
        changedProperties
      );
    });
  });
};

/**
 * Animate an element open.
 */
export const down = (
  element: HTMLElement,
  options = defaultOptions
): Promise<boolean> => {
  return new Promise((resolve) => {
    element.dataset.isSlidOpen = "true";
    element.style.display = "block";
    const computedStyles = getStyles(element);
    triggerAnimation(
      element,
      options,
      {
        fromTopPadding: "0px",
        fromBottomPadding: "0px",
        fromHeight: "0px",
        toTopPadding: computedStyles.paddingTop,
        toBottomPadding: computedStyles.paddingBottom,
        toHeight: computedStyles.height,
      },
      () => {
        resolve(true);
      }
    );
  });
};

/**
 * Animate an element closed.
 */
export const up = (element, options = defaultOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    const computedStyles = getStyles(element);
    triggerAnimation(
      element,
      options,
      {
        fromTopPadding: computedStyles.paddingTop,
        fromBottomPadding: computedStyles.paddingBottom,
        toTopPadding: "0px",
        toBottomPadding: "0px",
        fromHeight: computedStyles.height,
        toHeight: "0px",
      },
      () => {
        delete element.dataset.isSlidOpen;
        element.style.display = "none";
        resolve(false);
      }
    );
  });
};

/**
 * Animate an element open or closed based on its state.
 */
export const toggle = (
  element: HTMLElement,
  options = defaultOptions
): Promise<boolean> => {
  return element.dataset.isSlidOpen
    ? up(element, options)
    : down(element, options);
};
