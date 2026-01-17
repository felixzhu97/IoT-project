import { describe, it, expect } from "vitest";
import React from "react";
import { renderWithProviders } from "@iot/test-utils";
import { DeviceStatusPie } from "../device-status-pie";

// Skip: echarts requires canvas context which is not available in jsdom
describe.skip("DeviceStatusPie", () => {
  it("should be able to render", () => {
    // Arrange & Act
    const { container } = renderWithProviders(<DeviceStatusPie />);

    // Assert
    expect(container).toBeDefined();
  });
});
