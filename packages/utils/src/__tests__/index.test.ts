import { describe, it, expect } from "vitest";
import { cn } from "../index";

describe("cn", () => {
  describe("when input is a single string", () => {
    it("should return the original string", () => {
      // Arrange
      const input = "test-class";

      // Act
      const result = cn(input);

      // Assert
      expect(result).toBe("test-class");
    });
  });

  describe("when input is multiple strings", () => {
    it("should merge all class names", () => {
      // Arrange
      const input1 = "class1";
      const input2 = "class2";
      const input3 = "class3";

      // Act
      const result = cn(input1, input2, input3);

      // Assert
      expect(result).toContain("class1");
      expect(result).toContain("class2");
      expect(result).toContain("class3");
    });
  });

  describe("when input is conditional class names", () => {
    it("should only include class names where condition is true", () => {
      // Arrange
      const condition = true;
      const falseCondition = false;

      // Act
      const result = cn("base", condition && "active", falseCondition && "hidden");

      // Assert
      expect(result).toContain("base");
      expect(result).toContain("active");
      expect(result).not.toContain("hidden");
    });
  });

  describe("when input is object-form class names", () => {
    it("should only include properties with true values", () => {
      // Arrange
      const classObj = {
        "class-a": true,
        "class-b": false,
        "class-c": true,
      };

      // Act
      const result = cn(classObj);

      // Assert
      expect(result).toContain("class-a");
      expect(result).not.toContain("class-b");
      expect(result).toContain("class-c");
    });
  });

  describe("when input is array-form class names", () => {
    it("should merge all class names in the array", () => {
      // Arrange
      const classArray = ["class1", "class2", "class3"];

      // Act
      const result = cn(classArray);

      // Assert
      expect(result).toContain("class1");
      expect(result).toContain("class2");
      expect(result).toContain("class3");
    });
  });

  describe("when input has conflicting Tailwind class names", () => {
    it("should use tailwind-merge to resolve conflicts", () => {
      // Arrange
      // px-2 和 px-4 冲突，应该只保留 px-4
      const input1 = "px-2";
      const input2 = "px-4";

      // Act
      const result = cn(input1, input2);

      // Assert
      expect(result).toContain("px-4");
      expect(result).not.toContain("px-2");
    });
  });

  describe("when input is undefined or null", () => {
    it("should ignore undefined and null values", () => {
      // Arrange
      const input1 = "class1";
      const input2 = undefined;
      const input3 = null;

      // Act
      const result = cn(input1, input2, input3);

      // Assert
      expect(result).toBe("class1");
    });
  });
});
