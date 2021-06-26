import { up, down, toggle } from "./index";
import { screen } from "@testing-library/dom";

const withMockAnimation = (element) => {
  const pause = jest.fn();
  const play = jest.fn();
  const reverse = jest.fn();

  element.animate = () => {
    return {
      pause,
      play,
      reverse,
      animation: Promise.resolve(),
    };
  };

  return { element, pause, play, reverse };
};

beforeEach(() => {
  jest
    .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
    .mockImplementation(() => 100);
});

it("opens element", (done) => {
  document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  const { element, pause, play, reverse } = withMockAnimation(
    screen.getByTestId("content")
  );

  down(element).then((opened) => {
    expect(opened).toBe(true);
    expect(pause).toBeCalledTimes(1);
    expect(play).toBeCalledTimes(1);
    expect(reverse).not.toBeCalled();
    expect(element.style.display).toEqual("block");

    done();
  });
});

it("closes element", (done) => {
  document.body.innerHTML = `<div data-testid="content">Content!</div>`;
  const { element, pause, play, reverse } = withMockAnimation(
    screen.getByTestId("content")
  );

  up(element).then((opened) => {
    expect(opened).toBe(false);
    expect(pause).toBeCalledTimes(1);
    expect(play).not.toBeCalled();
    expect(reverse).toBeCalledTimes(1);
    expect(element.style.display).toEqual("none");

    done();
  });
});

describe("toggle()", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  });

  it("toggles element open", (done) => {
    jest
      .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
      .mockImplementation(() => 0);

    const { element, pause, play, reverse } = withMockAnimation(
      screen.getByTestId("content")
    );

    toggle(element).then((opened) => {
      expect(opened).toBe(true);
      expect(play).toBeCalledTimes(1);
      expect(pause).toBeCalledTimes(1);
      expect(reverse).not.toBeCalled();

      done();
    });
  });

  it("toggles element closed", (done) => {
    const { element, pause, play, reverse } = withMockAnimation(
      screen.getByTestId("content")
    );

    toggle(element).then((opened) => {
      expect(opened).toBe(false);
      expect(play).not.toBeCalled();
      expect(pause).toBeCalledTimes(1);
      expect(reverse).toBeCalledTimes(1);

      done();
    });
  });
});

describe("custom options", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  });

  it("uses default display value", (done) => {
    const { element } = withMockAnimation(screen.getByTestId("content"));
    expect(element.style.display).toEqual("none");

    down(element).then(() => {
      expect(element.style.display).toEqual("block");

      done();
    });
  });

  it("uses custom display property", (done) => {
    const { element } = withMockAnimation(screen.getByTestId("content"));
    expect(element.style.display).toEqual("none");

    down(element, { display: "flex" }).then(() => {
      expect(element.style.display).toEqual("flex");

      done();
    });
  });
});
