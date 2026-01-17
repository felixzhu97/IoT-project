import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "@iot/test-utils";
import { screen } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("Tabs", () => {
  describe("Tabs component", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      // Assert
      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
    });

    it("should have correct data-slot attribute", () => {
      // Arrange & Act
      renderWithProviders(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      // Assert
      const tabs = screen.getByText("Tab").closest('[data-slot="tabs"]');
      expect(tabs).toBeInTheDocument();
    });
  });

  describe("TabsList", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      // Assert
      expect(screen.getByText("Tab")).toBeInTheDocument();
    });
  });

  describe("TabsTrigger", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Trigger</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      // Assert
      expect(screen.getByText("Trigger")).toBeInTheDocument();
    });
  });

  describe("TabsContent", () => {
    it("should render correctly", () => {
      // Arrange & Act
      renderWithProviders(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );

      // Assert
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });
});
