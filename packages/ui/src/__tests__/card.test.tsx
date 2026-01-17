import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "@iot/test-utils";
import { screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "../card";

describe("Card", () => {
  describe("Card component", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<Card>Card Content</Card>);

      // Assert
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("should have correct data-slot attribute", () => {
      // Arrange & Act
      renderWithProviders(<Card>Content</Card>);

      // Assert
      const card = screen.getByText("Content");
      expect(card).toHaveAttribute("data-slot", "card");
    });
  });

  describe("CardHeader", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<CardHeader>Header</CardHeader>);

      // Assert
      expect(screen.getByText("Header")).toBeInTheDocument();
    });
  });

  describe("CardTitle", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<CardTitle>Title</CardTitle>);

      // Assert
      expect(screen.getByText("Title")).toBeInTheDocument();
    });
  });

  describe("CardDescription", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<CardDescription>Description</CardDescription>);

      // Assert
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  describe("CardContent", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<CardContent>Content</CardContent>);

      // Assert
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("CardFooter", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<CardFooter>Footer</CardFooter>);

      // Assert
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });
  });

  describe("CardAction", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(<CardAction>Action</CardAction>);

      // Assert
      expect(screen.getByText("Action")).toBeInTheDocument();
    });
  });
});
