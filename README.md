# slide-element

[![Bundle Size](https://badgen.net/bundlephobia/minzip/slide-element)](https://bundlephobia.com/result?p=slide-element)

A [tiny](https://bundlephobia.com/result?p=slide-element), accessible, Promise-based, jQuery-reminiscent library for sliding elements with dynamic heights open & closed.

To see it in action, check out the following demos:

- [Project Landing Page](https://alexmacarthur.github.io/slide-element/)
- [CodePen Example](https://codepen.io/alexmacarthur/pen/VwpEgom)

## Why?

Using JavaScript to **animate** an element open and closed hasn't traditionally been a straightforward task, especially if it contains dynamically sized content. You could go with something like [jQuery's `slideToggle()`](https://api.jquery.com/slidetoggle/), but that path would require you to take on a lot more code than necessary. Another option is using CSS to change the `max-height` value of an element, but this approach is filled with arbitrariness and difficult to pull off well when you're not sure how much content you'll be animating over.

This library gets the job done using the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API#meet_the_web_animations_api), and it doesn't require elements to have fixed heights. Instead, element heights are calculated based on their contents, and then the appropriate values are applied to trigger a smooth, native transition. The animations themselves are powered by the same mechanics used within CSS transitions, making it one of the best ways to pull it off in terms of performance.

It's small, smooth, and focuses on doing one job well: sliding stuff open and closed.

## Installation

Run `npm install slide-element`, or use a CDN like [unpkg](https://unpkg.com/slide-element).

## Setup

Make sure your target element is set to `display: none;`.

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

document.getElementById("button").addEventListener("click", (e) => {
  down(document.getElementById("boxToSlideOpen"));
});
```

### Sliding Elements Up

Use the `up` function to slide an element closed, and then set its `display` property to `none`.

```javascript
import { up } from "slide-element";

document.getElementById("button").addEventListener("click", (e) => {
  up(document.getElementById("boxToSlideClosed"));
});
```

### Everything's a Promise

Each of the functions provided return promises, so you can easily wait to perform an action after an animation is complete. The resolved value will indicate if the element has just been opened (`true`), closed (`false`), or the result of an animation that interruped another (see more below).

```typescript
import { toggle } from "slide-element";

document.getElementById("button").addEventListener("click", (e) => {
  toggle(document.getElementById("someElement")).then((isOpen: boolean | null) => {
    console.log("Toggling is done!");
  });
});
```

### Interrupting In-Progress Animations

Depending on your settings, some users may be able to repeatedly trigger a _new_ before a previous one has been allowed to finish, which will cause the in-progress animation instantly finish before the new one can begin.

When this occurs, the `isOpen` Promise that resolves after the animation is complete will return `null` for each animation that was triggered in interruption of the first. The initial animation, however will still resolve to the correct value. For example, pretend the following animation is clicked rapidly three times in a row.

```typescript
import { toggle } from "slide-element";

document.getElementById("button").addEventListener("click", (e) => {
  toggle(document.getElementById("someElement")).then((isOpen: boolean | null) => {
    console.log(isOpen);
  });
});
```

When the animation has been allowed to complete, the following values will be logged -- two `null` values for the interrupting animations, and one boolean for the initial (and now complete) one. The point here is that it may be necessary to explicitly check for a non-`null` value when using the resolved "open" state.

```
true
null
null
```

### Animating Boxes with Padding

If the element you're animating has any `padding` set to it, be sure to also apply `box-sizing: border-box` as well. If you don't, the resulting animation will be weird and jumpy.

```html
<div id="myTarget" style="padding: 1rem; box-sizing: border-box; display: none;">
  My contents!
</div>
```

### Customizing the Animation

By default, `slide-element` uses the following transition property values:

Property                                                                                                 | Value
-------------------------------------------------------------------------------------------------------- | ------
duration (in milliseconds)                                                                               | 250
easing ([choose one](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function#syntax)) | `ease`

You can override these by passing an object as the seceond parameter of any method:

```javascript
up(document.getElementById("element"), {
  duration: 500,
  easing: "ease-in-out",
});
```

### Customizing the Opened `display` Value

Out of the box, `slide-element` will set your opened element to `display: block;`. If you'd like to customize this, pass a `display` value as an option:

```javascript
down(document.getElementById("element"), {
  display: "flex"
});
```

## Usage w/o a Bundler

If you'd like to use `slide-element` directly in the browser via CDN, simply load the code, and then reference the function you'd like to use on the global `SlideElement` object:

```javascript
<script src="./path/to/slide-element.js"></script>
<script>
  document.getElementById('someElement').addEventListener('click', (e) => {
    SlideElement.toggle(document.getElementById("someBox"));
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

Param   | Type          | Description
------- | ------------- | --------------------------------------------
element | `HTMLElement` | A single HTML node to be slid open or closed
options | `object`      | Options to customize sliding animation.

## Accessibility

This library will respect the `prefers-reduced-motion` setting on a user's machine. When it's set to `reduce`, the sliding animation will be forced to a duration of `0`, making the respective elements open and close instantly.

Additionally, it's highly recommended that you toggle the `aria-expanded` attribute on any element (like a button) that's responsible for triggering an animation. This can be done by adding a single line of code that fires afters an animation is complete:

```javascript
document.getElementById('someButton').addEventListener('click', (e) => {
    toggle(document.getElementById('thing2')).then((opened) => {

      <!-- Set the appropriate `aria-expanded` value based on the state of the container. -->
      e.target.setAttribute("aria-expanded", opened);
    });
  });
```
## Show Off Your Use Case

I love to see examples of how you're using the stuff I build. If you're comfortable, please [send it my way](http://macarthur.me/contact)!
