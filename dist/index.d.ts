/**
 * Animate an element open.
 */
export declare let down: (element: HTMLElement, options?: {}) => Promise<boolean>;
/**
 * Animate an element closed.
 */
export declare let up: (element: any, options?: {}) => Promise<boolean>;
/**
 * Animate an element open or closed based on its state.
 */
export declare let toggle: (element: HTMLElement, options?: {}) => Promise<boolean>;
