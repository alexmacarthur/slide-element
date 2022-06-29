export type Options = KeyframeAnimationOptions & {
  duration?: number;
  easing?: string;
  display?: string;
};

export type SlideMethods = {
  up: () => Promise<boolean | null>;
  down: () => Promise<boolean | null>;
  toggle: () => Promise<boolean | null>;
};
