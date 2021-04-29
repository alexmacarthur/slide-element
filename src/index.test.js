import { up, down, toggle } from "./index";
import { fireEvent, screen } from "@testing-library/dom";

beforeEach(() => {
  window.TransitionEvent = Event;
  jest
    .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
    .mockImplementation(() => 100);
});

it("removes event listeners after finishing", async () => {
  return await new Promise((resolve) => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
    const el = screen.getByTestId("content");
    const addEventListenersSpy = jest.spyOn(el, "addEventListener");

    down(el).then(() => {
      const addedEvents = addEventListenersSpy.mock.calls
        .map((e) => {
          return e[0];
        })
        .sort();

      expect(addedEvents).toEqual(["transitionend", "transitioncancel"].sort());

      return resolve();
    });

    fireEvent.transitionEnd(el);
  });
});

it("opens element", async () => {
  return await new Promise((resolve) => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
    const el = screen.getByTestId("content");

    down(el).then((opened) => {
      expect(opened).toBe(true);
      expect(el.style.display).toEqual("block");

      return resolve();
    });

    fireEvent.transitionEnd(el);
  });
});

it("closes element", async () => {
  return await new Promise((resolve) => {
    document.body.innerHTML = `<div data-testid="content">Content!</div>`;
    const el = screen.getByTestId("content");

    up(el).then((opened) => {
      expect(opened).toBe(false);
      expect(el.style.display).toEqual("none");

      return resolve();
    });

    fireEvent.transitionEnd(el);
  });
});

document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
const el = screen.getByTestId("content");

it("toggles element open", async () => {
  jest
    .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
    .mockImplementation(() => 0);

  return await new Promise((resolve) => {
    toggle(el).then((opened) => {
      expect(opened).toBe(true);

      return resolve();
    });

    fireEvent.transitionEnd(el);
  });
});

it("toggles element closed", async () => {
  return await new Promise((resolve) => {
    toggle(el).then((opened) => {
      expect(opened).toBe(false);

      return resolve();
    });

    fireEvent.transitionEnd(el);
  });
});
