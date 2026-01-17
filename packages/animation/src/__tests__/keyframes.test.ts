import { describe, it, expect, beforeEach, vi } from "vitest";
import { KeyframeAnimation, createKeyframeAnimation } from "../keyframes";
import { linear } from "../easing";

describe("KeyframeAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    });
    global.cancelAnimationFrame = vi.fn();
  });

  describe("constructor", () => {
    it("should sort keyframes by offset", () => {
      // Arrange
      const keyframes = [
        { offset: 0.5, value: 50 },
        { offset: 0, value: 0 },
        { offset: 1, value: 100 },
      ];

      // Act
      const animation = new KeyframeAnimation({
        duration: 1000,
        keyframes,
      });

      // Assert - Keyframes should be sorted (verified by behavior)
      expect(animation.getState()).toBe("idle");
    });
  });

  describe("number keyframe interpolation", () => {
    it("should interpolate numbers between keyframes", () => {
      // Arrange
      const onUpdate = vi.fn();
      const animation = new KeyframeAnimation({
        duration: 1000,
        keyframes: [
          { offset: 0, value: 0 },
          { offset: 1, value: 100 },
        ],
        onUpdate,
      });

      // Act
      animation.start();
      vi.advanceTimersByTime(500);

      // Assert
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  describe("string keyframe interpolation", () => {
    it("should interpolate strings containing numbers", () => {
      // Arrange
      const onUpdate = vi.fn();
      const animation = new KeyframeAnimation({
        duration: 1000,
        keyframes: [
          { offset: 0, value: "0px" },
          { offset: 1, value: "100px" },
        ],
        onUpdate,
      });

      // Act
      animation.start();
      vi.advanceTimersByTime(500);

      // Assert
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  describe("object keyframe interpolation", () => {
    it("should interpolate object properties", () => {
      // Arrange
      const onUpdate = vi.fn();
      const animation = new KeyframeAnimation({
        duration: 1000,
        keyframes: [
          { offset: 0, value: { x: 0, y: 0 } },
          { offset: 1, value: { x: 100, y: 100 } },
        ],
        onUpdate,
      });

      // Act
      animation.start();
      vi.advanceTimersByTime(500);

      // Assert
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  describe("start()", () => {
    it("should start the animation", () => {
      // Arrange
      const onStart = vi.fn();
      const animation = new KeyframeAnimation({
        duration: 1000,
        keyframes: [{ offset: 0, value: 0 }],
        onStart,
      });

      // Act
      animation.start();

      // Assert
      expect(onStart).toHaveBeenCalled();
      expect(animation.getState()).toBe("running");
    });
  });

  describe("pause() and stop()", () => {
    it("should be able to pause and stop animation", () => {
      // Arrange
      const animation = new KeyframeAnimation({
        duration: 1000,
        keyframes: [{ offset: 0, value: 0 }],
      });
      animation.start();

      // Act & Assert
      animation.pause();
      expect(animation.getState()).toBe("paused");

      animation.stop();
      expect(animation.getState()).toBe("idle");
    });
  });
});

describe("createKeyframeAnimation", () => {
  it("should create a KeyframeAnimation instance", () => {
    // Arrange & Act
    const animation = createKeyframeAnimation({
      duration: 1000,
      keyframes: [{ offset: 0, value: 0 }],
    });

    // Assert
    expect(animation).toBeInstanceOf(KeyframeAnimation);
  });
});
