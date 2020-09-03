/**
 * Set the height & padding style attributes on an element.
 * 
 * @param {Node} element 
 * @param {array} heightAndPadding 
 */
const setStyleAttributes = (element, heightAndPadding) => { 
    element.style.height = heightAndPadding[0];
    element.style.padding = heightAndPadding[1];
}

/**
 * Fire a one-time function when an animation has completed.
 * 
 * @param {function} callback 
 * @returns {void}
 */
const onAnimationComplete = (element, property) => {
    return new Promise(resolve => {
        const eventListenerCallback = (e) => {
            if(e.propertyName.includes(property)) {
                element.removeEventListener('transitionend', eventListenerCallback);
                element.style[property] = '';
                resolve();
            }
        }
    
        element.addEventListener('transitionend', eventListenerCallback);
        element.addEventListener('transitioncancel', eventListenerCallback);
    });
}

/**
 * Reset explicit values for padding or height attributes 
 * after respective animations are complete, and then
 * fire a callback after the animation is effectively "complete."
 * 
 * @param {Node} element
 * @param {Promise} 
 */
const resetAfterAnimation = (element) => {
    const paddingPromise = onAnimationComplete(element, 'padding');
    const heightPromise = onAnimationComplete(element, 'height');

    return Promise.all([paddingPromise, heightPromise]);
}

/**
 * Set initial CSS required to perform height transition.
 * 
 * @param {object} thing 
 * @param {number} durationInSeconds 
 * @returns {void}
 */
const setInitialCss = (thing, durationInSeconds) => {
    const computedStyle = window.getComputedStyle(thing);
    const animationStyles = {
        overflow: 'hidden', 
        transitionProperty: 'padding, height',
        transitionDuration: `${durationInSeconds}s`
    }

    /**
     * Set these properties only if they aren't already set. If we blindly set them every run, 
     * the animation will not work as expected because a reflow is triggered.
     */
    for(let k in animationStyles) {
        if(computedStyle[k] === animationStyles[k]) {
            continue;
        }

        thing.style[k] = animationStyles[k];
    }
}

/**
 * Animate an element open.
 * 
 * @param {object} thing element to slide
 * @param {number} durationInSeconds 
 * @returns {void}
 */
export const slideDown = (thing, durationInSeconds = .25) => {
    return new Promise(resolve => {
        setInitialCss(thing, durationInSeconds);
        resetAfterAnimation(thing).then(() => resolve());
    
        thing.dataset.isSlidOpen = true;
        thing.style.display = '';
        
        const padding = window.getComputedStyle(thing).padding;
        const height = `${thing.offsetHeight}px`;
        
        setStyleAttributes(thing, ['0px', '0px'])
    
        // This update must happen on a separate tick in order to trigger an animation.    
        requestAnimationFrame(() => setStyleAttributes(thing, [height, padding]));
    })
}

/**
 * Animate an element closed.
 * 
 * @param {object} thing element to slide
 * @param {number} durationInSeconds 
 * @returns {void}
 */
export const slideUp = (thing, durationInSeconds = .25) => {
    return new Promise(resolve => {
        setInitialCss(thing, durationInSeconds);

        resetAfterAnimation(thing).then(() => {
            delete thing.dataset.isSlidOpen;
            thing.style.display = 'none';
            resolve();
        });

        thing.style.height = `${thing.offsetHeight}px`;
    
        // This update must happen on a separate tick in order to trigger an animation.
        requestAnimationFrame(() => setStyleAttributes(thing, ['0px', '0px']));
    });
}

/**
 * Animate an element open or closed based on its state.
 * 
 * @param {object} thing element to slide
 * @param {number} durationInSeconds 
 * @returns {void}
 */
export const slideToggle = (thing, durationInSeconds = .25) => {
    return thing.dataset.isSlidOpen
        ? slideUp(thing, durationInSeconds)
        : slideDown(thing, durationInSeconds);
}