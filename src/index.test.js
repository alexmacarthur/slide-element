import { up, down, toggle } from "./index";
import { screen } from "@testing-library/dom";

beforeEach(() => {
  jest
    .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
    .mockImplementation(() => 100);
});

it("removes event listeners after finishing", (done) => {
  document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  const el = screen.getByTestId("content");

  down(el).then(() => {
    expect(el.ontransitionend).toBeNull();
    expect(el.ontransitioncancel).toBeNull();

    done();
  });

  el.ontransitionend(el);
});

it("opens element", (done) => {
  document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  const el = screen.getByTestId("content");

  down(el).then((opened) => {
    expect(opened).toBe(true);
    expect(el.style.display).toEqual("block");

    done();
  });

  el.ontransitionend(el);
});

it("closes element", (done) => {
  document.body.innerHTML = `<div data-testid="content">Content!</div>`;
  const el = screen.getByTestId("content");

  up(el).then((opened) => {
    expect(opened).toBe(false);
    expect(el.style.display).toEqual("none");

    done();
  });

  el.ontransitionend(el);
});

describe("toggle()", () => {
  let el;

  beforeEach(() => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
    el = screen.getByTestId("content");
  });

  it("toggles element open", (done) => {
    jest
      .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
      .mockImplementation(() => 0);

    toggle(el).then((opened) => {
      expect(opened).toBe(true);

      done();
    });

    el.ontransitionend(el);
  });

  it("toggles element closed", (done) => {
    toggle(el).then((opened) => {
      expect(opened).toBe(false);

      done();
    });

    el.ontransitionend();
  });
});

describe("custom options", () => {
  let el;

  beforeEach(() => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
    el = screen.getByTestId("content");
  });

  it("uses default display value", (done) => {
    expect(el.style.display).toEqual("none");

    down(el).then(() => {
      expect(el.style.display).toEqual("block");

      done();
    });

    el.ontransitionend();
  });

  it("uses custom display property", (done) => {
    expect(el.style.display).toEqual("none");

    down(el, { display: "flex" }).then(() => {
      expect(el.style.display).toEqual("flex");

      done();
    });

    el.ontransitionend();
  });
});
