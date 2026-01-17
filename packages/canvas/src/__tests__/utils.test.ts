import { describe, it, expect, beforeEach } from "vitest";
import {
  CoordinateTransform,
  colorUtils,
  pathUtils,
  clearCanvas,
  getCanvasMousePos,
} from "../utils";

describe("CoordinateTransform", () => {
  describe("constructor", () => {
    it("should create transformer with contain mode", () => {
      // Arrange & Act
      const transform = new CoordinateTransform(100, 100, 200, 200, "contain");

      // Assert
      expect(transform).toBeInstanceOf(CoordinateTransform);
    });

    it("should create transformer with cover mode", () => {
      // Arrange & Act
      const transform = new CoordinateTransform(100, 100, 200, 200, "cover");

      // Assert
      expect(transform).toBeInstanceOf(CoordinateTransform);
    });

    it("should create transformer with fill mode", () => {
      // Arrange & Act
      const transform = new CoordinateTransform(100, 100, 200, 200, "fill");

      // Assert
      expect(transform).toBeInstanceOf(CoordinateTransform);
    });
  });

  describe("transform()", () => {
    it("should transform coordinates", () => {
      // Arrange
      const transform = new CoordinateTransform(100, 100, 200, 200, "contain");

      // Act
      const result = transform.transform(50, 50);

      // Assert
      expect(result).toHaveProperty("x");
      expect(result).toHaveProperty("y");
    });
  });

  describe("inverse()", () => {
    it("should inverse transform coordinates", () => {
      // Arrange
      const transform = new CoordinateTransform(100, 100, 200, 200, "contain");

      // Act
      const result = transform.inverse(100, 100);

      // Assert
      expect(result).toHaveProperty("x");
      expect(result).toHaveProperty("y");
    });
  });
});

describe("colorUtils", () => {
  describe("parseColor", () => {
    it.skip("should parse RGB color", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      const result = colorUtils.parseColor("rgb(255, 0, 0)");

      // Assert
      expect(result).toHaveProperty("r");
      expect(result).toHaveProperty("g");
      expect(result).toHaveProperty("b");
      expect(result).toHaveProperty("a");
    });

    it.skip("should parse hexadecimal color", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      const result = colorUtils.parseColor("#ff0000");

      // Assert
      expect(result).toHaveProperty("r");
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
    });
  });

  describe("rgbToHex", () => {
    it("should convert RGB to hexadecimal", () => {
      // Arrange & Act
      const result = colorUtils.rgbToHex(255, 0, 0);

      // Assert
      expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it("should include alpha channel", () => {
      // Arrange & Act
      const result = colorUtils.rgbToHex(255, 0, 0, 0.5);

      // Assert
      expect(result).toMatch(/^#[0-9a-fA-F]{8}$/);
    });
  });

  describe("lerpColor", () => {
    it.skip("should interpolate between two colors", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      const result = colorUtils.lerpColor("#ff0000", "#0000ff", 0.5);

      // Assert
      expect(result).toMatch(/rgba?\(/);
    });
  });

  describe("adjustBrightness", () => {
    it.skip("should adjust color brightness", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      const result = colorUtils.adjustBrightness("#808080", 1.5);

      // Assert
      expect(result).toMatch(/rgb\(/);
    });
  });
});

describe("pathUtils", () => {
  let ctx: CanvasRenderingContext2D;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d")!;
  });

  describe("createRoundedRectPath", () => {
    it.skip("should create rounded rectangle path", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      pathUtils.createRoundedRectPath(ctx, 10, 10, 100, 100, 5);

      // Assert - Verify method execution by not throwing error
      expect(ctx).toBeDefined();
    });

    it.skip("should support different corner radii", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      pathUtils.createRoundedRectPath(ctx, 10, 10, 100, 100, {
        tl: 5,
        tr: 10,
        bl: 15,
        br: 20,
      });

      // Assert
      expect(ctx).toBeDefined();
    });
  });

  describe("createStarPath", () => {
    it.skip("should create star path", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      pathUtils.createStarPath(ctx, 50, 50, 20, 10, 5);

      // Assert
      expect(ctx).toBeDefined();
    });
  });

  describe("createPolygonPath", () => {
    it.skip("should create polygon path", () => {
      // Skip: requires canvas package for getContext in jsdom
      // Arrange & Act
      pathUtils.createPolygonPath(ctx, 50, 50, 20, 6);

      // Assert
      expect(ctx).toBeDefined();
    });
  });
});

describe("clearCanvas", () => {
  it.skip("should clear the canvas", () => {
    // Skip: requires canvas package for getContext in jsdom
    // Arrange
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Act
    clearCanvas(ctx);

    // Assert - Verify by not throwing error
    expect(ctx).toBeDefined();
  });

  it.skip("should clear canvas with specified dimensions", () => {
    // Skip: requires canvas package for getContext in jsdom
    // Arrange
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Act
    clearCanvas(ctx, 100, 100);

    // Assert
    expect(ctx).toBeDefined();
  });
});

describe("getCanvasMousePos", () => {
  it("should get mouse position on canvas", () => {
    // Arrange
    const canvas = document.createElement("canvas");
    const mockEvent = {
      clientX: 100,
      clientY: 100,
    } as MouseEvent;

    // Act
    const result = getCanvasMousePos(canvas, mockEvent);

    // Assert
    expect(result).toHaveProperty("x");
    expect(result).toHaveProperty("y");
  });

  it("should handle touch events", () => {
    // Arrange
    const canvas = document.createElement("canvas");
    const mockEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as unknown as TouchEvent;

    // Act
    const result = getCanvasMousePos(canvas, mockEvent);

    // Assert
    expect(result).toHaveProperty("x");
    expect(result).toHaveProperty("y");
  });
});
