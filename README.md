# slide-element

A Promise-based, jQuery-reminiscent collection of functions to help hide and show elements in a sliding fashion.

## Under the Hood

This library relies on CSS animations to perform the transitions, but doesn't require elements to have fixed heights. Instead, element heights are calculated based on their contents and padding (if applicable), and then the appropriate values are then applied to trigger a native transition. In all, `slide-element` comes in at under 1kb gzipped.

## Installation

`npm install slide-element`

## Setup

Make sure your target element is set to `display: none`, whether that's with a class or inline style.

## Usage

### Toggling Elements

Use the `toggle` function to slide an element open & closed based on its current state.

```js
import { toggle } from "slide-element";

document.getElementById("button").addEventListener("click", (e) => {
  toggle(document.getElementById("box"));
});
```

### Sliding Elements Down

Use the `down` function to slide an element open.

```js
import { down } from "slide-element";

down(document.getElementById("boxToSlideOpen"));
```

### Sliding Elements Up

Use the `up` function to slide an element closed, and then set its `display` property to `none`.

```js
import { up } from "slide-element";

up(document.getElementById("boxToSlideClosed"));
```

### Everything's a Promise

Each of the functions provided return promises, so you can easily wait to perform an action after an animation is complete. The resolved value will be a boolean indicating if the element has just been opened (`true`) or closed (`false`).

```js
import { toggle } from "slide-element";

toggle(document.getElementById("someElement")).then((opened) => {
  console.log("toggling is done!");
});
```

### Customizing the Animation

Each function accepts an object to control how the sliding animation executes. You can set your own `duration` and `timingFunction` values.

```js
import { up } from "slide-element";

const anElement = document.getElementById("anElement");

up(anElement, { duration: 0.5, timingFunction: "linear" });
```

### Options

| Option         | Type     | Description                                                     | Default |
| -------------- | -------- | --------------------------------------------------------------- | ------- |
| duration       | `number` | The speed of the transition in seconds.                         | `.25`   |
| timingFunction | `string` | The CSS timing function used to define the style of transition. | `ease`  |

## Usage w/o a Bundler

If you'd like to use `slide-element` directly in the browser via CDN, simply load the code, and then reference the function you'd like to use on the global `SlideElement` object:

```js
<script src="./dist/slide-element.min.js"></script>
<script>
  document.getElementById('someElement').addEventListener('click', (e) => {
    SlideElement.toggle(document.getElementById('someBox'));
});
</script>
```

## API

### `toggle(node[, options]), up(node[, options]), down(node[, options])`,

| Param   | Type     | Description                                  |
| ------- | -------- | -------------------------------------------- |
| node    | `Node`   | A single HTML node to be slid open or closed |
| options | `object` | Options to customize sliding animation.      |

## Contributions

Go for it. Just send a PR.
