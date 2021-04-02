export type CssPropertyValues = {
  paddingTop?: string;
  paddingBottom?: string;
  height?: string;
};

export type Options = {
  duration?: number;
  timingFunction?: string;
}

export type CallbackFunction = (e: TransitionEvent) => any;

export type AnyObject = {
  [key: string]: any;
};
