/**
 * Animate an element open.
 */
export declare const down: (element: HTMLElement, options?: {}) => Promise<boolean>;
/**
 * Animate an element closed.
 */
export declare const up: (element: any, options?: {}) => Promise<boolean>;
/**
 * Animate an element open or closed based on its state.
 */
export declare const toggle: (element: HTMLElement, options?: {}) => Promise<boolean>;
