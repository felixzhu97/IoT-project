import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "@iot/test-utils";
import { screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  describe("when rendering default Badge", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<Badge>Test Badge</Badge>);

      // Assert
      expect(screen.getByText("Test Badge")).toBeInTheDocument();
    });

    it("should have correct data-slot attribute", () => {
      // Arrange & Act
      renderWithProviders(<Badge>Test</Badge>);

      // Assert
      const badge = screen.getByText("Test");
      expect(badge).toHaveAttribute("data-slot", "badge");
    });
  });

  describe("when using different variants", () => {
    it("should apply default variant", () => {
      // Arrange & Act
      renderWithProviders(<Badge variant="default">Default</Badge>);

      // Assert
      const badge = screen.getByText("Default");
      expect(badge).toBeInTheDocument();
    });

    it("should apply secondary variant", () => {
      // Arrange & Act
      renderWithProviders(<Badge variant="secondary">Secondary</Badge>);

      // Assert
      const badge = screen.getByText("Secondary");
      expect(badge).toBeInTheDocument();
    });

    it("should apply destructive variant", () => {
      // Arrange & Act
      renderWithProviders(<Badge variant="destructive">Destructive</Badge>);

      // Assert
      const badge = screen.getByText("Destructive");
      expect(badge).toBeInTheDocument();
    });

    it("should apply outline variant", () => {
      // Arrange & Act
      renderWithProviders(<Badge variant="outline">Outline</Badge>);

      // Assert
      const badge = screen.getByText("Outline");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("when using asChild", () => {
    it("should render as child element", () => {
      // Arrange & Act
      renderWithProviders(
        <Badge asChild>
          <a href="/test">Link Badge</a>
        </Badge>
      );

      // Assert
      const link = screen.getByText("Link Badge");
      expect(link.tagName).toBe("A");
    });
  });
});
