const animatableProperties = ["height", "paddingTop", "paddingBottom"];
const defaultOptions = {
  duration: 0.25,
  timingFunction: "ease",
};

/**
 * Set the height & padding style attributes on an element.
 *
 * @param {Node} element
 * @param {array} animatableProperties
 * @param {array} propertiesPermittedToChange
 * @returns {void}
 */
const setStyleAttributes = (
  element,
  propertyValues,
  propertiesPermittedToChange = animatableProperties
) => {
  for (let property in propertyValues) {
    if (!propertiesPermittedToChange.includes(property)) {
      delete propertyValues[property];
    }
  }

  Object.assign(element.style, propertyValues);
};

/**
 * Add transition event listeners to given element.
 *
 * @param {Node} element
 * @param {function} callback
 * @returns {void}
 */
const addEventListeners = (element, callback) => {
  element.addEventListener("transitionend", callback);
  element.addEventListener("transitioncancel", callback);
};

/**
 * Remove transition event listeners from given element.
 *
 * @param {Node} element
 * @param {function} callback
 * @returns {void}
 */
const removeEventListeners = (element, callback) => {
  element.removeEventListener("transitionend", callback);
  element.removeEventListener("transitioncancel", callback);
};

/**
 * Fire a one-time function when an animation has completed.
 *
 * @param {function} callback
 * @returns {void}
 */
const onAnimationComplete = (element, property) => {
  return new Promise((resolve) => {
    const eventListenerCallback = function (e) {
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
 *
 * @param {string} string
 */
const camelize = (string) => {
  return string.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Reset explicit values for padding or height attributes
 * after respective animations are complete, and then
 * fire a callback after the animation is effectively "complete."
 *
 * @param {Node} element
 * @param {array} propertiesToReset
 * @returns {Promise}
 */
const resetAfterAnimation = (element, changedProperties) => {
  return new Promise((resolve) => {
    const promises = changedProperties.reduce((proms, property) => {
      proms.push(onAnimationComplete(element, property));
      return proms;
    }, []);

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
 *
 * @param {Node} element
 * @param {array} properties
 */
const unsetProperties = (element, properties) => {
  properties.forEach((p) => (element.style[p] = ""));
};

/**
 * Set initial CSS required to perform height transition.
 *
 * @param {object} element
 * @param {number} durationInSeconds
 * @returns {void}
 */
const setTransitionProperties = (
  element,
  { duration, timingFunction } = options
) => {
  const computedStyle = getStyles(element);
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
 *
 * @param {object} properties Contains property for each CSS attribute, along with from/to values.
 * @returns {array}
 */
const getChanged = (properties) => {
  return Object.keys(properties).reduce((changedProperties, property) => {
    const values = properties[property].map((v) => parseInt(v, 10));

    if (values[0] == values[1]) {
      return changedProperties;
    }

    changedProperties.push(property);
    return changedProperties;
  }, []);
};

/**
 * Retrieve the computed styles for an element.
 *
 * @param {Node} element
 * @returns {object}
 */
const getStyles = (element) => {
  return window.getComputedStyle(element);
};

/**
 * Given a bunch of before/after property values, trigger a CSS animation
 * before & after the next repaint.
 *
 * @param {Node} element
 * @param {object} propertyValues
 * @param {function} callback
 * @returns {void}
 */
const triggerAnimation = (element, options, propertyValues, callback) => {
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
 *
 * @param {object} element element to slide
 * @param {number} durationInSeconds
 * @returns {void}
 */
export const down = (element, options = defaultOptions) => {
  return new Promise((resolve) => {
    element.dataset.isSlidOpen = true;
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
        resolve();
      }
    );
  });
};

/**
 * Animate an element closed.
 *
 * @param {object} element element to slide
 * @param {number} durationInSeconds
 * @returns {void}
 */
export const up = (element, options = defaultOptions) => {
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
        resolve();
      }
    );
  });
};

/**
 * Animate an element open or closed based on its state.
 *
 * @param {object} element element to slide
 * @param {number} durationInSeconds
 * @returns {void}
 */
export const toggle = (element, options = defaultOptions) => {
  return element.dataset.isSlidOpen
    ? up(element, options)
    : down(element, options);
};
