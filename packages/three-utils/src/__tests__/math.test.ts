import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  distance3D,
  normalizeVector,
  angleBetweenVectors,
  sphericalToCartesian,
  cartesianToSpherical,
  clamp,
  degToRad,
  radToDeg,
  lerp,
  lerpVector,
  smoothstep,
} from "../math";

describe("distance3D", () => {
  it("should calculate distance between two Vector3 points", () => {
    // Arrange
    const point1 = new THREE.Vector3(0, 0, 0);
    const point2 = new THREE.Vector3(3, 4, 0);

    // Act
    const result = distance3D(point1, point2);

    // Assert
    expect(result).toBe(5);
  });

  it("should calculate distance between array-form coordinates", () => {
    // Arrange
    const point1: [number, number, number] = [0, 0, 0];
    const point2: [number, number, number] = [0, 0, 5];

    // Act
    const result = distance3D(point1, point2);

    // Assert
    expect(result).toBe(5);
  });
});

describe("normalizeVector", () => {
  it("should normalize a Vector3", () => {
    // Arrange
    const vector = new THREE.Vector3(3, 4, 0);

    // Act
    const result = normalizeVector(vector);

    // Assert
    expect(result.length()).toBeCloseTo(1, 5);
  });

  it("should normalize array-form vector", () => {
    // Arrange
    const vector: [number, number, number] = [3, 4, 0];

    // Act
    const result = normalizeVector(vector);

    // Assert
    expect(result.length()).toBeCloseTo(1, 5);
  });
});

describe("angleBetweenVectors", () => {
  it("should calculate angle between two vectors", () => {
    // Arrange
    const v1 = new THREE.Vector3(1, 0, 0);
    const v2 = new THREE.Vector3(0, 1, 0);

    // Act
    const result = angleBetweenVectors(v1, v2);

    // Assert
    expect(result).toBeCloseTo(Math.PI / 2, 5);
  });
});

describe("sphericalToCartesian and cartesianToSpherical", () => {
  it("should correctly convert spherical to Cartesian coordinates", () => {
    // Arrange
    const radius = 1;
    const theta = Math.PI / 2; // 90 degrees
    const phi = 0;

    // Act
    const result = sphericalToCartesian(radius, theta, phi);

    // Assert
    expect(result.x).toBeCloseTo(1, 5);
    expect(result.y).toBeCloseTo(0, 5);
    expect(result.z).toBeCloseTo(0, 5);
  });

  it("should correctly convert Cartesian to spherical coordinates", () => {
    // Arrange
    const vector = new THREE.Vector3(1, 0, 0);

    // Act
    const [radius, theta, phi] = cartesianToSpherical(vector);

    // Assert
    expect(radius).toBeCloseTo(1, 5);
    expect(phi).toBeCloseTo(0, 5);
  });
});

describe("clamp", () => {
  it("should clamp value within range", () => {
    // Arrange & Act
    const result1 = clamp(5, 0, 10);
    const result2 = clamp(-5, 0, 10);
    const result3 = clamp(15, 0, 10);

    // Assert
    expect(result1).toBe(5);
    expect(result2).toBe(0);
    expect(result3).toBe(10);
  });
});

describe("degToRad and radToDeg", () => {
  it("should correctly convert degrees to radians", () => {
    // Arrange & Act
    const result = degToRad(180);

    // Assert
    expect(result).toBeCloseTo(Math.PI, 5);
  });

  it("should correctly convert radians to degrees", () => {
    // Arrange & Act
    const result = radToDeg(Math.PI);

    // Assert
    expect(result).toBeCloseTo(180, 5);
  });
});

describe("lerp", () => {
  it("should perform linear interpolation", () => {
    // Arrange & Act
    const result = lerp(0, 100, 0.5);

    // Assert
    expect(result).toBe(50);
  });

  it("should return start value when t=0", () => {
    // Arrange & Act
    const result = lerp(0, 100, 0);

    // Assert
    expect(result).toBe(0);
  });

  it("should return end value when t=1", () => {
    // Arrange & Act
    const result = lerp(0, 100, 1);

    // Assert
    expect(result).toBe(100);
  });
});

describe("lerpVector", () => {
  it("should perform vector linear interpolation", () => {
    // Arrange
    const v1 = new THREE.Vector3(0, 0, 0);
    const v2 = new THREE.Vector3(10, 10, 10);

    // Act
    const result = lerpVector(v1, v2, 0.5);

    // Assert
    expect(result.x).toBe(5);
    expect(result.y).toBe(5);
    expect(result.z).toBe(5);
  });
});

describe("smoothstep", () => {
  it("should perform smoothstep within boundaries", () => {
    // Arrange & Act
    const result = smoothstep(0, 10, 5);

    // Assert
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });

  it("should return 0 when x is less than edge0", () => {
    // Arrange & Act
    const result = smoothstep(10, 20, 5);

    // Assert
    expect(result).toBe(0);
  });

  it("should return 1 when x is greater than edge1", () => {
    // Arrange & Act
    const result = smoothstep(10, 20, 25);

    // Assert
    expect(result).toBe(1);
  });
});
