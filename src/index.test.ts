import { up, down, toggle } from "./index";
import { screen } from "@testing-library/dom";
import { describe, it, expect, beforeEach, vi } from "vitest";

const addMockAnimation = (element, id = "") => {
  const mockAnimation = {
    finish: vi.fn(),
    id,
  };

  element.getAnimations = () => [mockAnimation];

  return mockAnimation;
};

const withMockAnimation = (element, duration = 0) => {
  const finish = vi.fn();
  const reverse = vi.fn();
  let timeCalled = null;

  element.getAnimations = () => [];
  element.animate = vi.fn(() => {
    timeCalled = new Date().getTime();

    return {
      finished: new Promise((resolve) => {
        setTimeout(resolve, duration);
      }),
      finish,
    };
  });

  return { element, finish, reverse, getTimeCalled: () => timeCalled };
};

const mockHeightOnce = (element, values) => {
  const mock = vi.spyOn(element, "clientHeight", "get");

  return values.reduce((m, val) => m.mockImplementationOnce(() => val), mock);
};

const mockOffsetHeight = (element, height = null) => {
  vi.spyOn(element, "offsetHeight", "get").mockImplementation(() => height);
};

const mockHeight = (element, value) => {
  return vi
    .spyOn(element, "clientHeight", "get")
    .mockImplementation(() => value);
};

beforeEach(() => {
  document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;

  window.requestAnimationFrame = (cb) => {
    cb(0);
    return 0;
  };

  // Does NOT prefer reduced motion.
  window.matchMedia = () => {
    return {
      matches: false,
    } as MediaQueryList;
  };
});

it("opens element", async () => {
  document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  const { element } = withMockAnimation(screen.getByTestId("content"));

  mockHeightOnce(element, [0, 100]);

  const opened = await down(element);

  expect(opened).toBe(true);
  expect(element.animate).toBeCalledTimes(1);
  expect(element.style.display).toEqual("block");

  expect(element.animate).toHaveBeenCalledWith(
    [
      expect.objectContaining({
        height: "0px",
        paddingBottom: "0px",
        paddingTop: "0px",
      }),
      expect.objectContaining({
        height: "100px",
        paddingBottom: "",
        paddingTop: "",
      }),
    ],
    { easing: "ease", duration: 250, fill: "backwards" }
  );
});

it("closes element", async () => {
  document.body.innerHTML = `<div data-testid="content" style="height: 100px">Content!</div>`;
  const { element } = withMockAnimation(screen.getByTestId("content"));
  mockHeight(element, 100);

  const opened = await up(element);

  expect(opened).toBe(false);
  expect(element.animate).toBeCalledTimes(1);
  expect(element.style.display).toEqual("none");
  expect(element.animate).toHaveBeenCalledWith(
    [
      expect.objectContaining({
        height: "100px",
        paddingBottom: "",
        paddingTop: "",
      }),
      expect.objectContaining({
        height: "0px",
        paddingBottom: "0px",
        paddingTop: "0px",
      }),
    ],
    { easing: "ease", duration: 250, fill: "backwards" }
  );
});

describe("toggle()", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  });

  describe("animation is allowed to complete fully", () => {
    it("toggles element open", async () => {
      const { element } = withMockAnimation(screen.getByTestId("content"));

      const opened = await toggle(element);

      expect(opened).toBe(true);
      expect(element.animate).toBeCalledTimes(1);
    });

    it("toggles element closed", async () => {
      const { element } = withMockAnimation(screen.getByTestId("content"));

      // Give it an arbitrary height to mock it being "open."
      mockOffsetHeight(element, 100);

      const opened = await toggle(element);

      expect(opened).toBe(false);
      expect(element.animate).toBeCalledTimes(1);
    });
  });

  describe("animation is rapidly clicked", () => {
    it("opens down() even though the element is partially expanded due to double click on up()", async () => {
      // Visible and with explicit height.
      document.body.innerHTML = `<div data-testid="content" style="display: block; height="50px;">Content!</div>`;
      const { element } = withMockAnimation(screen.getByTestId("content"));
      const { finish } = addMockAnimation(element, "0");

      const opened = await toggle(element);

      expect(opened).toBe(null);
      expect(finish).toHaveBeenCalledTimes(1);
      expect(element.style.display).toEqual("block");
    });

    it("closes up() even though the element is partially expanded due to double click on down()", async () => {
      // Visible and with explicit height.
      document.body.innerHTML = `<div data-testid="content" style="display: block; height="50px;">Content!</div>`;
      const { element } = withMockAnimation(screen.getByTestId("content"));
      const { finish } = addMockAnimation(element, "1");

      const opened = await toggle(element);

      // Will toggle down():
      expect(opened).toBe(null);
      expect(finish).toHaveBeenCalledTimes(1);
      expect(element.style.display).toEqual("none");
    });
  });
});

describe("custom options", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
  });

  it("uses default display value", async () => {
    const { element } = withMockAnimation(screen.getByTestId("content"));
    expect(element.style.display).toEqual("none");

    await down(element);

    expect(element.style.display).toEqual("block");
  });

  it("uses custom display property", async () => {
    const { element } = withMockAnimation(screen.getByTestId("content"));
    expect(element.style.display).toEqual("none");

    await down(element, { display: "flex" });

    expect(element.style.display).toEqual("flex");
  });

  it("uses default overflow property", () => {
    const { element } = withMockAnimation(screen.getByTestId("content"));
    expect(element.style.overflow).toEqual("");

    down(element);
    expect(element.style.overflow).toEqual("hidden");
  });

  it("uses custom overflow property", () => {
    const { element } = withMockAnimation(screen.getByTestId("content"));
    expect(element.style.overflow).toEqual("");

    down(element, { overflow: "visible" });
    expect(element.style.overflow).toEqual("visible");
  });
});

describe("accessibility settings", () => {
  it("disables animation when user prefers reduced motion", async () => {
    const { element } = withMockAnimation(screen.getByTestId("content"));

    window.matchMedia = () => {
      return {
        matches: true,
      } as MediaQueryList;
    };

    await up(element);

    expect(element.animate).toHaveBeenCalledWith(expect.anything(), {
      duration: 0,
      easing: "ease",
      fill: "backwards",
    });
  });
});

describe("overflow handling", () => {
  it("temporarily sets overflow to hidden", async () => {
    document.body.innerHTML = `<div data-testid="content" style="display: none;">Content!</div>`;
    const { element } = withMockAnimation(screen.getByTestId("content"));

    expect(element.style.overflow).toEqual("");

    element.animate = () => {
      return {
        finished: new Promise<void>((resolve) => {
          expect(element.style.overflow).toEqual("hidden");
          resolve();
        }),
      };
    };

    await down(element);

    expect(element.style.overflow).toEqual("");
  });
});

describe("callback timing", () => {
  it("should fire callback after animation is complete", async () => {
    document.body.innerHTML = `<div data-testid="content">Content!</div>`;
    const { element, getTimeCalled } = withMockAnimation(
      screen.getByTestId("content"),
      250
    );

    await up(element);
    const difference = new Date().getTime() - getTimeCalled();

    expect(difference).toBeGreaterThanOrEqual(250);
  });
});
