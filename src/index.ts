type Options = KeyframeAnimationOptions & {
  duration?: number;
  easing?: string;
  display?: string;
};

let defaultOptions = {
  easing: "ease",
  duration: 250,
  fill: "forwards",
  display: "block",
};

let SlideController = (element: HTMLElement, options: Options) => {
  let mergedOptions: Options = Object.assign({}, defaultOptions, options);
  let openDisplayValue = mergedOptions.display as string;
  let getRawHeight = () => element.clientHeight;
  let getElementStyle = () => element.style;
  let setDisplay = (value: string) => (getElementStyle().display = value);

  let triggerAnimation = async (willOpen: boolean): Promise<void> => {
    delete mergedOptions.display;
    let frames: any[] = ["0px", `${getRawHeight()}px`].map((height) => {
      return { height };
    });
    let animation = element.animate(frames, mergedOptions);

    animation.pause();
    animation[willOpen ? "play" : "reverse"]();

    return animation.finished as Promise<any>;
  };

  let up = async (): Promise<boolean> => {
    await triggerAnimation(false);

    setDisplay("none");

    return false;
  };

  let down = async (): Promise<boolean> => {
    setDisplay(openDisplayValue);

    await triggerAnimation(true);

    return true;
  };

  let toggle = (): Promise<boolean> => {
    return getRawHeight() ? up() : down();
  };

  return { up, down, toggle };
};

/**
 * Animate an element open.
 */
export let down = (
  element: HTMLElement,
  options: Options = {}
): Promise<boolean> => {
  return SlideController(element, options).down();
};

/**
 * Animate an element closed.
 */
export let up = (
  element: HTMLElement,
  options: Options = {}
): Promise<boolean> => {
  return SlideController(element, options).up();
};

/**
 * Animate an element open or closed based on its state.
 */
export let toggle = (
  element: HTMLElement,
  options: Options = {}
): Promise<boolean> => {
  return SlideController(element, options).toggle();
};
