import { describe, it, expect } from "vitest";
import {
  mean,
  median,
  variance,
  standardDeviation,
  min,
  max,
  correlation,
  linearRegression,
  normalize,
  quantile,
  summary,
} from "../../stats/index";

describe("Statistical Functions", () => {
  describe("mean", () => {
    it("should calculate the mean of an array", () => {
      // Arrange
      const data = [1, 2, 3, 4, 5];

      // Act
      const result = mean(data);

      // Assert
      expect(result).toBe(3);
    });

    it("should throw an error when array is empty", () => {
      // Arrange
      const data: number[] = [];

      // Act & Assert
      expect(() => mean(data)).toThrow("Cannot calculate mean of empty array");
    });
  });

  describe("median", () => {
    it("should calculate median for odd number of elements", () => {
      // Arrange
      const data = [1, 3, 5, 7, 9];

      // Act
      const result = median(data);

      // Assert
      expect(result).toBe(5);
    });

    it("should calculate median for even number of elements", () => {
      // Arrange
      const data = [1, 2, 3, 4];

      // Act
      const result = median(data);

      // Assert
      expect(result).toBe(2.5);
    });

    it("should throw an error when array is empty", () => {
      // Arrange
      const data: number[] = [];

      // Act & Assert
      expect(() => median(data)).toThrow("Cannot calculate median of empty array");
    });
  });

  describe("variance", () => {
    it("should calculate sample variance", () => {
      // Arrange
      const data = [2, 4, 4, 4, 5, 5, 7, 9];

      // Act
      const result = variance(data, true);

      // Assert
      expect(result).toBeCloseTo(4.57, 2);
    });

    it("should calculate population variance", () => {
      // Arrange
      const data = [2, 4, 4, 4, 5, 5, 7, 9];

      // Act
      const result = variance(data, false);

      // Assert
      expect(result).toBeCloseTo(4, 1);
    });
  });

  describe("standardDeviation", () => {
    it("should calculate standard deviation", () => {
      // Arrange
      const data = [2, 4, 4, 4, 5, 5, 7, 9];

      // Act
      const result = standardDeviation(data);

      // Assert
      expect(result).toBeCloseTo(Math.sqrt(variance(data)), 5);
    });
  });

  describe("min and max", () => {
    it("should find the minimum value", () => {
      // Arrange
      const data = [3, 1, 4, 1, 5, 9, 2];

      // Act
      const result = min(data);

      // Assert
      expect(result).toBe(1);
    });

    it("should find the maximum value", () => {
      // Arrange
      const data = [3, 1, 4, 1, 5, 9, 2];

      // Act
      const result = max(data);

      // Assert
      expect(result).toBe(9);
    });
  });

  describe("correlation", () => {
    it("should calculate positive correlation", () => {
      // Arrange
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];

      // Act
      const result = correlation(x, y);

      // Assert
      expect(result).toBeCloseTo(1, 5);
    });

    it("should calculate negative correlation", () => {
      // Arrange
      const x = [1, 2, 3, 4, 5];
      const y = [5, 4, 3, 2, 1];

      // Act
      const result = correlation(x, y);

      // Assert
      expect(result).toBeCloseTo(-1, 5);
    });

    it("should throw an error when array lengths don't match", () => {
      // Arrange
      const x = [1, 2, 3];
      const y = [1, 2];

      // Act & Assert
      expect(() => correlation(x, y)).toThrow("Arrays must have the same length");
    });
  });

  describe("linearRegression", () => {
    it("should calculate linear regression", () => {
      // Arrange
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];

      // Act
      const result = linearRegression(x, y);

      // Assert
      expect(result.slope).toBeCloseTo(2, 5);
      expect(result.intercept).toBeCloseTo(0, 5);
      expect(result.rSquared).toBeCloseTo(1, 5);
      expect(result.equation).toContain("y =");
    });

    it("should throw an error when there are fewer than 2 data points", () => {
      // Arrange
      const x = [1];
      const y = [2];

      // Act & Assert
      expect(() => linearRegression(x, y)).toThrow("At least 2 data points are required");
    });
  });

  describe("normalize", () => {
    it("should normalize using min-max method", () => {
      // Arrange
      const data = [10, 20, 30, 40, 50];

      // Act
      const result = normalize(data, { method: "min-max" });

      // Assert
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(1);
    });

    it("should normalize using z-score method", () => {
      // Arrange
      const data = [10, 20, 30, 40, 50];

      // Act
      const result = normalize(data, { method: "z-score" });

      // Assert
      const resultMean = result.reduce((a, b) => a + b, 0) / result.length;
      expect(resultMean).toBeCloseTo(0, 5);
    });

    it("should return empty array when array is empty", () => {
      // Arrange
      const data: number[] = [];

      // Act
      const result = normalize(data);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("quantile", () => {
    it("should calculate quantile", () => {
      // Arrange
      const data = [1, 2, 3, 4, 5];

      // Act
      const result = quantile(data, 0.5);

      // Assert
      expect(result).toBe(3);
    });

    it("should throw an error when percentile is out of range", () => {
      // Arrange
      const data = [1, 2, 3, 4, 5];

      // Act & Assert
      expect(() => quantile(data, 1.5)).toThrow("Percentile must be between 0 and 1");
    });
  });

  describe("summary", () => {
    it("should calculate statistical summary", () => {
      // Arrange
      const data = [1, 2, 3, 4, 5];

      // Act
      const result = summary(data);

      // Assert
      expect(result.count).toBe(5);
      expect(result.mean).toBe(3);
      expect(result.median).toBe(3);
      expect(result.min).toBe(1);
      expect(result.max).toBe(5);
      expect(result).toHaveProperty("variance");
      expect(result).toHaveProperty("standardDeviation");
      expect(result).toHaveProperty("q25");
      expect(result).toHaveProperty("q75");
    });
  });
});
