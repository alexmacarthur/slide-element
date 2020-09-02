/**
 * Fire a one-time function when an animation has completed.
 * 
 * @param {function} callback 
 * @returns {void}
 */
const onAnimationComplete = (thing, callback) => {
    thing.addEventListener('transitionend', () => callback(), { once: true });
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
        transitionProperty: 'height', 
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
    
        /**
         * Don't try to be opinionated about the height 
         * after the transition has taken place.
         */
        onAnimationComplete(thing, () => {
            thing.style.height = '';
            resolve();
        });
    
        thing.dataset.isSlidOpen = true;
        thing.style.display = '';
    
        const height = `${thing.clientHeight}px`;
    
        thing.style.height = '0px';
    
        // This update must happen on a separate tick in order to trigger an animation.
        setTimeout(() => thing.style.height = height, 0);
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
    
        onAnimationComplete(thing, () => {
            delete thing.dataset.isSlidOpen;
            thing.style.height = '';
            thing.style.display = 'none';
            resolve();            
        })
    
        thing.style.height = `${thing.clientHeight}px`;
    
        // This update must happen on a separate tick in order to trigger an animation.
        setTimeout(() => thing.style.height = '0px', 0);
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