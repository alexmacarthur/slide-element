import { up, down, toggle } from "./index";
import { screen } from "@testing-library/dom";

const addMockAnimation = (element) => {
  const mockAnimation = {
    pause: jest.fn(),
    cancel: jest.fn(() => {
      throw "cancel";
    }),
  };

  element.getAnimations = () => [mockAnimation];

  return mockAnimation;
};

const withMockAnimation = (element) => {
  const pause = jest.fn();
  const play = jest.fn();
  const reverse = jest.fn();

  element.getAnimations = () => [];
  element.animate = jest.fn(() => {
    return {
      pause,
      play,
      animation: Promise.resolve(),
    };
  });

  return { element, pause, play, reverse };
};

const mockHeightOnce = (values) => {
  const mock = jest.spyOn(HTMLDivElement.prototype, "clientHeight", "get");

  return values.reduce((m, val) => m.mockImplementationOnce(() => val), mock);
};

const mockHeight = (value) => {
  return jest
    .spyOn(HTMLDivElement.prototype, "clientHeight", "get")
    .mockImplementation(() => value);
};

beforeEach(() => {
  document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  mockHeight(100);

  // Does NOT prefer reduced motion.
  window.matchMedia = () => {
    return {
      matches: false,
    };
  };
});

it("opens element", (done) => {
  document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  const { element, play } = withMockAnimation(screen.getByTestId("content"));

  mockHeightOnce([0, 100, 0]);

  down(element).then((opened) => {
    expect(opened).toBe(true);
    expect(play).toBeCalledTimes(1);
    expect(element.style.display).toEqual("block");
    expect(window.seCache.get(element)).toEqual("100px");

    expect(element.animate).toHaveBeenCalledWith(
      [
        {
          height: "0px",
          overflow: "hidden",
        },
        {
          height: "100px",
          overflow: "hidden",
        },
      ],
      { easing: "ease", duration: 250, fill: "forwards" }
    );

    done();
  });
});

it("closes element", (done) => {
  document.body.innerHTML = `<div data-testid="content" style="height: 100px">Content!</div>`;
  const { element, play } = withMockAnimation(screen.getByTestId("content"));

  up(element).then((opened) => {
    expect(opened).toBe(false);
    expect(play).toBeCalledTimes(1);
    expect(element.style.display).toEqual("none");
    expect(window.seCache.get(element)).toEqual("100px");
    expect(element.animate).toHaveBeenCalledWith(
      [
        {
          height: "100px",
          overflow: "hidden",
        },
        {
          height: "0px",
          overflow: "hidden",
        },
      ],
      { easing: "ease", duration: 250, fill: "forwards" }
    );

    done();
  });
});

describe("toggle()", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  });

  describe("animation is allowed to complete fully", () => {
    it("toggles element open", (done) => {
      mockHeightOnce([0, 0, 0]);

      const { element, play } = withMockAnimation(
        screen.getByTestId("content")
      );

      toggle(element).then((opened) => {
        expect(opened).toBe(true);
        expect(play).toBeCalledTimes(1);

        done();
      });
    });

    it("toggles element closed", (done) => {
      const { element, play } = withMockAnimation(
        screen.getByTestId("content")
      );

      mockHeightOnce([100]);

      toggle(element).then((opened) => {
        expect(opened).toBe(false);
        expect(play).toBeCalledTimes(1);

        done();
      });
    });
  });

  describe("animation is rapidly clicked", () => {
    it("opens down() even though the element is partially expanded due to double click on up()", (done) => {
      // Visible and with explicit height.
      document.body.innerHTML = `<div data-testid="content" data-se="0" style="display: block; height="50px;">Content!</div>`;
      const { element } = withMockAnimation(screen.getByTestId("content"));
      const { pause, cancel } = addMockAnimation(element);

      // Will toggle down():
      toggle(element).then((opened) => {
        expect(opened).toBe(null);
        expect(pause).toHaveBeenCalledTimes(1);
        expect(cancel).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it("closes up() even though the element is partially expanded due to double click on down()", (done) => {
      // Visible and with explicit height.
      document.body.innerHTML = `<div data-testid="content" data-se="1" style="display: block; height="50px;">Content!</div>`;
      const { element } = withMockAnimation(screen.getByTestId("content"));
      const { pause, cancel } = addMockAnimation(element);

      // Will toggle down():
      toggle(element).then((opened) => {
        expect(opened).toBe(null);
        expect(pause).toHaveBeenCalledTimes(1);
        expect(cancel).toHaveBeenCalledTimes(1);

        done();
      });
    });

    it("returns null when another animation was triggered", (done) => {
      const { element } = withMockAnimation(screen.getByTestId("content"));

      toggle(element).then((opened) => {
        expect(opened).toBe(false);
      });

      addMockAnimation(element);

      toggle(element).then((opened) => {
        expect(opened).toBe(null);

        done();
      });
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

describe("height for element has been cached from previous call", () => {
  it("uses cached height", (done) => {
    const { element } = withMockAnimation(screen.getByTestId("content"));

    window.seCache = new Map();
    window.seCache.set(element, "75px");

    const clientHeightSpy = mockHeight(100);

    up(element).then(() => {
      expect(clientHeightSpy).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it("sets cached height when element is opened", (done) => {
    const { element } = withMockAnimation(screen.getByTestId("content"));

    mockHeight(85);

    up(element).then(() => {
      expect(window.seCache.get(element)).toEqual("85px");
      done();
    });
  });
});

describe("accessibility settigns", () => {
  it("disables animation when user prefers reduced motion", (done) => {
    const { element } = withMockAnimation(screen.getByTestId("content"));

    window.matchMedia = () => {
      return {
        matches: true,
      };
    };

    up(element).then(() => {
      expect(element.animate).toHaveBeenCalledWith(expect.anything(), {
        duration: 0,
        easing: "ease",
        fill: "forwards",
      });
      done();
    });
  });

  it("sets aria-expanded correctly when open", (done) => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
    const { element } = withMockAnimation(screen.getByTestId("content"));

    mockHeightOnce([0, 100, 0]);

    down(element).then(() => {
      expect(element.getAttribute("aria-expanded")).toEqual("true");
      done();
    });
  });

  it("sets aria-expanded correctly when closed", (done) => {
    document.body.innerHTML = `<div data-testid="content" style="height: 100px">Content!</div>`;
    const { element } = withMockAnimation(screen.getByTestId("content"));

    up(element).then(() => {
      expect(element.getAttribute("aria-expanded")).toEqual("false");
      done();
    });
  });
});
