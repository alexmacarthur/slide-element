const animatableProperties = ["height", "padding"];

/**
 * Set the height & padding style attributes on an element.
 *
 * @param {Node} element
 * @param {array} heightAndPadding
 */
const setStyleAttributes = (element, heightAndPadding) => {
  animatableProperties.forEach((p, i) => {
    element.style[p] = heightAndPadding[i];
  });
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
    const eventListenerCallback = (e) => {
      if (e.propertyName.includes(property)) {
        removeEventListeners(element, eventListenerCallback);
        resolve();
      }
    };

    addEventListeners(element, eventListenerCallback);
  });
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
      console.log("done");
      setStyleAttributes(element, ["", ""]);
      resolve();
    });
  });
};

/**
 * Set initial CSS required to perform height transition.
 *
 * @param {object} element
 * @param {number} durationInSeconds
 * @returns {void}
 */
const setInitialCss = (element, durationInSeconds) => {
  const computedStyle = window.getComputedStyle(element);
  const animationStyles = {
    overflow: "hidden",
    transitionProperty: "padding, height",
    transitionDuration: `${durationInSeconds}s`,
  };

  /**
   * Set these properties only if they aren't already set. If we blindly set them every run,
   * the animation will not work as expected because a reflow is triggered.
   */
  for (let k in animationStyles) {
    if (computedStyle[k] === animationStyles[k]) {
      continue;
    }

    element.style[k] = animationStyles[k];
  }
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
 * Animate an element open.
 *
 * @param {object} element element to slide
 * @param {number} durationInSeconds
 * @returns {void}
 */
export const slideDown = (element, durationInSeconds = 0.25) => {
  return new Promise((resolve) => {
    setInitialCss(element, durationInSeconds);

    element.dataset.isSlidOpen = true;
    element.style.display = "block";

    const fromPadding = "0px";
    const fromHeight = "0px";
    const toPadding = window.getComputedStyle(element).padding;
    const toHeight = `${element.offsetHeight}px`;

    const changedProperties = getChanged({
      padding: [fromPadding, toPadding],
      height: [fromHeight, toHeight],
    });

    resetAfterAnimation(element, changedProperties).then(() => resolve());
    setStyleAttributes(element, [fromHeight, fromPadding]);

    // This update must happen on a separate tick in order to trigger an animation.
    requestAnimationFrame(() =>
      setStyleAttributes(element, [toHeight, toPadding])
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
export const slideUp = (element, durationInSeconds = 0.25) => {
  return new Promise((resolve) => {
    setInitialCss(element, durationInSeconds);

    const fromPadding = window.getComputedStyle(element).padding;
    const fromHeight = `${element.offsetHeight}px`;
    const toPadding = "0px";
    const toHeight = "0px";

    const changedProperties = getChanged({
      padding: [fromPadding, toPadding],
      height: [fromHeight, toHeight],
    });

    resetAfterAnimation(element, changedProperties).then(() => {
      delete element.dataset.isSlidOpen;
      element.style.display = "none";
      resolve();
    });

    setStyleAttributes(element, [fromHeight, fromPadding]);

    // This update must happen on a separate tick in order to trigger an animation.
    requestAnimationFrame(() => {
      if (element.style.display !== "none") {
        setStyleAttributes(element, [toHeight, toPadding]);
      }
    });
  });
};

/**
 * Animate an element open or closed based on its state.
 *
 * @param {object} element element to slide
 * @param {number} durationInSeconds
 * @returns {void}
 */
export const slideToggle = (element, durationInSeconds = 0.25) => {
  return element.dataset.isSlidOpen
    ? slideUp(element, durationInSeconds)
    : slideDown(element, durationInSeconds);
};
