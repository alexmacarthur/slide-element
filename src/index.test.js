import { up, down, toggle } from "./index";
import { screen } from "@testing-library/dom";

beforeEach(() => {
  jest
    .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
    .mockImplementation(() => 100);
});

it("removes event listeners after finishing", async () => {
  return await new Promise((resolve) => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
    const el = screen.getByTestId("content");

    down(el).then(() => {
      expect(el.ontransitionend).toBeNull();
      expect(el.ontransitioncancel).toBeNull();

      return resolve();
    });

    el.ontransitionend(el);
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

    el.ontransitionend(el);
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

    el.ontransitionend(el);
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

    el.ontransitionend(el);
  });
});

it("toggles element closed", async () => {
  return await new Promise((resolve) => {
    toggle(el).then((opened) => {
      expect(opened).toBe(false);

      return resolve();
    });

    el.ontransitionend();
  });
});
