# slide-element

A tiny (~500 bytes gzipped!) Promise-based, jQuery-reminiscent library for hiding and showing elements in a sliding fashion.

## Why?

Using JavaScript to animate an element open and closed isn't a straightforward task, especially if it contains dynamic content. You could go with something like [jQuery's `slideToggle()`](https://api.jquery.com/slidetoggle/), but that path would require you to take on a lot more code than necessary. Another option is using CSS to change the `max-height` value of an element, but this approach is filled with arbitrariness and difficult to pull off well when you're not sure how much content you'll be animating over.

This library gets the job done using native CSS transitions, but doesn't require elements to have fixed heights. Instead, element heights are calculated based on their contents, and then the appropriate values are then applied to trigger a smooth, native transition.

## Installation

Run `npm install slide-element`, or use a CDN like [unpkg](https://unpkg.com/).

## Setup

Make sure your target element is set to `display: none`.

## Usage

### Toggling Elements

Use the `toggle` function to slide an element open & closed based on its current state.

```javascript
import { toggle } from "slide-element";

document.getElementById("button").addEventListener("click", (e) => {
  toggle(document.getElementById("box"));
});
```

### Sliding Elements Down

Use the `down` function to slide an element open.

```javascript
import { down } from "slide-element";

down(document.getElementById("boxToSlideOpen"));
```

### Sliding Elements Up

Use the `up` function to slide an element closed, and then set its `display` property to `none`.

```javascript
import { up } from "slide-element";

up(document.getElementById("boxToSlideClosed"));
```

### Everything's a Promise

Each of the functions provided return promises, so you can easily wait to perform an action after an animation is complete. The resolved value will be a boolean indicating if the element has just been opened (`true`) or closed (`false`).

```typescript
import { toggle } from "slide-element";

toggle(document.getElementById("someElement")).then((isOpen: boolean) => {
  console.log("Toggling is done!");
});
```

### Customizing the Animation

By default, `slide-element` uses the following transition property values:

| Property                 | Value  |
| ------------------------ | ------ |
| transitionDuration       | `.25s` |
| transitionTimingFunction | `ease` |

You can override these by passing an object as the seceond parameter of any method:

```javascript
up(document.getElementById("element"), {
  transitionDuration: ".5s",
  transitionTimingFunction: "ease-in-out",
});
```

## Usage w/o a Bundler

If you'd like to use `slide-element` directly in the browser via CDN, simply load the code, and then reference the function you'd like to use on the global `SlideElement` object:

```javascript
<script src="./path/to/slide-element.js"></script>
<script>
  document.getElementById('someElement').addEventListener('click', (e) => {
    SlideElement.toggle(document.getElementById('someBox'));
});
</script>
```

## API

```typescript
// Toggle an element based on current state.
toggle(element: HTMLElement, options?: object): Promise<boolean>

// Slide an element down.
up(element: HTMLElement, options?: object): Promise<boolean>

// Slide an element down.
down(element: HTMLElement, options?: object): Promise<boolean>
```

| Param   | Type     | Description                                  |
| ------- | -------- | -------------------------------------------- |
| node    | `Node`   | A single HTML node to be slid open or closed |
| options | `object` | Options to customize sliding animation.      |

## Gotchas

This library strictly animates an element's `height` property. So, targeting an element with `padding` may cause some unexpected weirdness. To prevent this from happening, ensure that the target element itself is void of padding, and instead place it within a nested "wrapper" element. For example:

```html
<div id="myTarget" style="display: none;">
  <div style="padding: 1rem">My contents!</div>
</div>
```

## Contributions

Go for it. Just send a PR.
