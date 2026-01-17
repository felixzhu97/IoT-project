import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { animateCSS, transitionCSS } from "../css";

// Mock element.animate
const mockAnimate = vi.fn(() => ({
  finished: Promise.resolve(),
  cancel: vi.fn(),
}));

beforeEach(() => {
  global.HTMLElement.prototype.animate = mockAnimate;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("animateCSS", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it("should apply CSS animation", () => {
    // Arrange
    const keyframes = [{ opacity: 0 }, { opacity: 1 }];

    // Act
    const animation = animateCSS(element, keyframes, {
      duration: 1000,
    });

    // Assert
    expect(mockAnimate).toHaveBeenCalled();
    expect(animation).toBeDefined();
  });

  it("should use custom options", () => {
    // Arrange
    const keyframes = [
      { transform: "translateX(0)" },
      { transform: "translateX(100px)" },
    ];

    // Act
    const animation = animateCSS(element, keyframes, {
      duration: 500,
      delay: 100,
      easing: "ease-in-out",
      fillMode: "both",
    });

    // Assert
    expect(mockAnimate).toHaveBeenCalled();
    expect(animation).toBeDefined();
  });
});

describe("transitionCSS", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it("should apply CSS transition", async () => {
    // Arrange
    const properties = {
      opacity: "0.5",
      transform: "scale(1.2)",
    };

    // Act
    const promise = transitionCSS(element, properties, 100);

    // Assert
    expect(promise).toBeInstanceOf(Promise);
    await promise;
  });
});
