import { describe, it, expect } from "vitest";
import {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
} from "../easing";

describe("Easing Functions", () => {
  describe("boundary value tests", () => {
    const easingFunctions = [
      { name: "linear", fn: linear },
      { name: "easeInQuad", fn: easeInQuad },
      { name: "easeOutQuad", fn: easeOutQuad },
      { name: "easeInOutQuad", fn: easeInOutQuad },
      { name: "easeInCubic", fn: easeInCubic },
      { name: "easeOutCubic", fn: easeOutCubic },
      { name: "easeInOutCubic", fn: easeInOutCubic },
      { name: "easeInQuart", fn: easeInQuart },
      { name: "easeOutQuart", fn: easeOutQuart },
      { name: "easeInOutQuart", fn: easeInOutQuart },
      { name: "easeInSine", fn: easeInSine },
      { name: "easeOutSine", fn: easeOutSine },
      { name: "easeInOutSine", fn: easeInOutSine },
      { name: "easeInExpo", fn: easeInExpo },
      { name: "easeOutExpo", fn: easeOutExpo },
      { name: "easeInOutExpo", fn: easeInOutExpo },
      { name: "easeInCirc", fn: easeInCirc },
      { name: "easeOutCirc", fn: easeOutCirc },
      { name: "easeInOutCirc", fn: easeInOutCirc },
      { name: "easeInElastic", fn: easeInElastic },
      { name: "easeOutElastic", fn: easeOutElastic },
      { name: "easeInOutElastic", fn: easeInOutElastic },
      { name: "easeInBounce", fn: easeInBounce },
      { name: "easeOutBounce", fn: easeOutBounce },
      { name: "easeInOutBounce", fn: easeInOutBounce },
    ];

    easingFunctions.forEach(({ name, fn }) => {
      describe(name, () => {
        it("should return 0 or close to 0 when t=0", () => {
          // Arrange & Act
          const result = fn(0);

          // Assert
          expect(result).toBeCloseTo(0, 5);
        });

        it("should return 1 or close to 1 when t=1", () => {
          // Arrange & Act
          const result = fn(1);

          // Assert
          expect(result).toBeCloseTo(1, 5);
        });

        it("should be in range [0, 1] when t is between 0 and 1", () => {
          // Arrange
          const testValues = [0.25, 0.5, 0.75];
          // Elastic functions can exceed [0, 1] range, so we skip them for this test
          const skipForElastic = [
            "easeInElastic",
            "easeOutElastic",
            "easeInOutElastic",
          ];

          if (skipForElastic.includes(name)) {
            // Elastic functions may exceed bounds
            testValues.forEach((t) => {
              const result = fn(t);
              expect(typeof result).toBe("number");
            });
          } else {
            testValues.forEach((t) => {
              // Act
              const result = fn(t);

              // Assert
              expect(result).toBeGreaterThanOrEqual(0);
              expect(result).toBeLessThanOrEqual(1);
            });
          }
        });
      });
    });
  });

  describe("linear", () => {
    it("should return linear values", () => {
      // Assert
      expect(linear(0.5)).toBe(0.5);
      expect(linear(0.25)).toBe(0.25);
      expect(linear(0.75)).toBe(0.75);
    });
  });

  describe("easeInQuad", () => {
    it("should return quadratic ease-in values", () => {
      // Arrange & Act
      const result = easeInQuad(0.5);

      // Assert - 0.5 * 0.5 = 0.25
      expect(result).toBe(0.25);
    });
  });

  describe("easeOutQuad", () => {
    it("should return quadratic ease-out values", () => {
      // Arrange & Act
      const result = easeOutQuad(0.5);

      // Assert - 0.5 * (2 - 0.5) = 0.75
      expect(result).toBe(0.75);
    });
  });

  describe("easeInOutQuad", () => {
    it("should use ease-in when t<0.5", () => {
      // Arrange & Act
      const result = easeInOutQuad(0.25);

      // Assert - 2 * 0.25 * 0.25 = 0.125
      expect(result).toBe(0.125);
    });

    it("should use ease-out when t>=0.5", () => {
      // Arrange & Act
      const result = easeInOutQuad(0.75);

      // Assert
      expect(result).toBeGreaterThan(0.5);
    });
  });

  describe("special easing functions", () => {
    describe("easeInExpo", () => {
      it("should return 0 when t=0", () => {
        expect(easeInExpo(0)).toBeCloseTo(0, 5);
      });

      it("should return 1 when t=1", () => {
        expect(easeInExpo(1)).toBeCloseTo(1, 5);
      });
    });

    describe("easeOutExpo", () => {
      it("should return 0 when t=0", () => {
        expect(easeOutExpo(0)).toBeCloseTo(0, 5);
      });

      it("should return 1 when t=1", () => {
        expect(easeOutExpo(1)).toBeCloseTo(1, 5);
      });
    });

    describe("easeInBounce", () => {
      it("should return 0 when t=0", () => {
        expect(easeInBounce(0)).toBeCloseTo(0, 5);
      });

      it("should return 1 when t=1", () => {
        expect(easeInBounce(1)).toBeCloseTo(1, 5);
      });
    });
  });
});
