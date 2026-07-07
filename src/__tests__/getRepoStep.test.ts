import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRepoStep } from "../getRepoStep.js";
import { Config, GitRepo } from "../types.js";

// Mock dependencies
vi.mock("../io.js", () => ({
  logger: {
    logTitle: vi.fn(),
    green: vi.fn(),
    yellow: vi.fn(),
  },
}));

vi.mock("../downloadUtils.js", () => ({
  downloadRepo: vi.fn(),
}));

describe("getRepoStep", () => {
  const mockTemplate: GitRepo = {
    repo: "SkipLabs/create-skip-service",
    path: "templates",
    name: "default",
  };

  const mockExample: GitRepo = {
    repo: "SkipLabs/skip",
    path: "examples",
    name: "blogger",
  };

  const baseConfig: Config = {
    projectName: "test-project",
    executionContext: "/test/project",
    withGit: true,
    verbose: false,
    quiet: false,
    force: false,
    template: null,
    example: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Skipping when repo is not configured", () => {
    it("should skip template step when template is null", async () => {
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      await getRepoStep(baseConfig, "template");

      expect(logger.logTitle).not.toHaveBeenCalled();
      expect(downloadRepo).not.toHaveBeenCalled();
    });

    it("should skip example step when example is null", async () => {
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      await getRepoStep(baseConfig, "example");

      expect(logger.logTitle).not.toHaveBeenCalled();
      expect(downloadRepo).not.toHaveBeenCalled();
    });
  });

  describe("Successful downloads", () => {
    it("should download template successfully", async () => {
      const config = { ...baseConfig, template: mockTemplate };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getRepoStep(config, "template");

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting template 'default' from SkipLabs/create-skip-service",
      );
      expect(downloadRepo).toHaveBeenCalledWith(
        mockTemplate,
        "/test/project",
        false,
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t✓ Template default downloaded successfully",
      );
    });

    it("should download example successfully", async () => {
      const config = { ...baseConfig, example: mockExample };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getRepoStep(config, "example");

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting example 'blogger' from SkipLabs/skip",
      );
      expect(downloadRepo).toHaveBeenCalledWith(
        mockExample,
        "/test/project",
        false,
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t✓ Example blogger downloaded successfully",
      );
    });

    it("should pass verbose flag to downloadRepo", async () => {
      const config = { ...baseConfig, template: mockTemplate, verbose: true };
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getRepoStep(config, "template");

      expect(downloadRepo).toHaveBeenCalledWith(
        mockTemplate,
        "/test/project",
        true,
      );
    });

    it("should handle different template names", async () => {
      const customTemplate = { ...mockTemplate, name: "with_postgres" };
      const config = { ...baseConfig, template: customTemplate };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getRepoStep(config, "template");

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting template 'with_postgres' from SkipLabs/create-skip-service",
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t✓ Template with_postgres downloaded successfully",
      );
    });
  });

  describe("Error handling", () => {
    it("should rethrow download errors", async () => {
      const config = { ...baseConfig, template: mockTemplate };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(
        new Error("Download failed"),
      );

      await expect(getRepoStep(config, "template")).rejects.toThrow(
        "Download failed",
      );

      expect(logger.green).not.toHaveBeenCalled();
    });

    it("should show a quoted not-found warning for non-default templates", async () => {
      const customTemplate = { ...mockTemplate, name: "custom_template" };
      const config = { ...baseConfig, template: customTemplate };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(
        new Error("Template not found"),
      );

      await expect(getRepoStep(config, "template")).rejects.toThrow(
        "Template not found",
      );

      expect(logger.yellow).toHaveBeenCalledWith(
        "Template 'custom_template' not found in SkipLabs/create-skip-service repo...",
      );
    });

    it("should show a quoted not-found warning for examples", async () => {
      const config = { ...baseConfig, example: mockExample };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(
        new Error("Example not found"),
      );

      await expect(getRepoStep(config, "example")).rejects.toThrow(
        "Example not found",
      );

      expect(logger.yellow).toHaveBeenCalledWith(
        "Example 'blogger' not found in SkipLabs/skip repo...",
      );
    });

    it("should not show warning for default template errors", async () => {
      const config = { ...baseConfig, template: mockTemplate };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(new Error("Network error"));

      await expect(getRepoStep(config, "template")).rejects.toThrow(
        "Network error",
      );

      expect(logger.yellow).not.toHaveBeenCalled();
    });

    it("should not show warning for rate limit errors", async () => {
      const config = { ...baseConfig, example: mockExample };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(
        new Error("GitHub API rate limit exceeded."),
      );

      await expect(getRepoStep(config, "example")).rejects.toThrow(
        "GitHub API rate limit exceeded",
      );

      expect(logger.yellow).not.toHaveBeenCalled();
    });
  });
});
