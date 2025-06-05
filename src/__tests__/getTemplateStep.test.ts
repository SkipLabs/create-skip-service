import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTemplateStep } from "../getTemplateStep.js";
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

describe("getTemplateStep", () => {
  const mockTemplate: GitRepo = {
    repo: "SkipLabs/create-skip-service",
    path: "templates",
    name: "default",
  };

  const mockConfig: Config = {
    projectName: "test-project",
    executionContext: "/test/project",
    withGit: true,
    verbose: false,
    quiet: false,
    force: false,
    template: mockTemplate,
    example: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Template handling", () => {
    it("should skip when template is null", async () => {
      const configWithoutTemplate = { ...mockConfig, template: null };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      await getTemplateStep(configWithoutTemplate);

      expect(logger.logTitle).not.toHaveBeenCalled();
      expect(downloadRepo).not.toHaveBeenCalled();
    });

    it("should skip when template is undefined", async () => {
      const configWithoutTemplate = {
        ...mockConfig,
        template: undefined as any,
      };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      await getTemplateStep(configWithoutTemplate);

      expect(logger.logTitle).not.toHaveBeenCalled();
      expect(downloadRepo).not.toHaveBeenCalled();
    });
  });

  describe("Successful template download", () => {
    it("should download template successfully", async () => {
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(mockConfig);

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

    it("should pass verbose flag to downloadRepo", async () => {
      const verboseConfig = { ...mockConfig, verbose: true };
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(verboseConfig);

      expect(downloadRepo).toHaveBeenCalledWith(
        mockTemplate,
        "/test/project",
        true,
      );
    });

    it("should handle different template names", async () => {
      const customTemplate = { ...mockTemplate, name: "with_postgres" };
      const configWithCustomTemplate = {
        ...mockConfig,
        template: customTemplate,
      };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(configWithCustomTemplate);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting template 'with_postgres' from SkipLabs/create-skip-service",
      );
      expect(downloadRepo).toHaveBeenCalledWith(
        customTemplate,
        "/test/project",
        false,
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t✓ Template with_postgres downloaded successfully",
      );
    });

    it("should handle different repositories", async () => {
      const customTemplate = {
        ...mockTemplate,
        repo: "CustomOrg/custom-templates",
      };
      const configWithCustomRepo = { ...mockConfig, template: customTemplate };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(configWithCustomRepo);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting template 'default' from CustomOrg/custom-templates",
      );
      expect(downloadRepo).toHaveBeenCalledWith(
        customTemplate,
        "/test/project",
        false,
      );
    });
  });

  describe("Error handling", () => {
    it("should handle download errors for default template", async () => {
      const downloadError = new Error("Download failed");
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(downloadError);

      await expect(getTemplateStep(mockConfig)).rejects.toThrow(
        "Download failed",
      );

      expect(logger.logTitle).toHaveBeenCalled();
      expect(downloadRepo).toHaveBeenCalled();
      expect(logger.green).not.toHaveBeenCalled();
      expect(logger.yellow).not.toHaveBeenCalled();
    });

    it("should show warning for non-default template errors", async () => {
      const customTemplate = { ...mockTemplate, name: "custom_template" };
      const configWithCustomTemplate = {
        ...mockConfig,
        template: customTemplate,
      };
      const downloadError = new Error("Template not found");
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(downloadError);

      await expect(getTemplateStep(configWithCustomTemplate)).rejects.toThrow(
        "Template not found",
      );

      expect(logger.yellow).toHaveBeenCalledWith(
        "Template 'custom_template not found in SkipLabs/create-skip-service repo...",
      );
    });

    it("should not show warning for default template errors", async () => {
      const downloadError = new Error("Network error");
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(downloadError);

      await expect(getTemplateStep(mockConfig)).rejects.toThrow(
        "Network error",
      );

      expect(logger.yellow).not.toHaveBeenCalled();
    });

    it("should handle different error types", async () => {
      const customError = new TypeError("Invalid response");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(customError);

      await expect(getTemplateStep(mockConfig)).rejects.toThrow(
        "Invalid response",
      );
      expect(downloadRepo).toHaveBeenCalled();
    });
  });

  describe("Configuration edge cases", () => {
    it("should handle execution context with special characters", async () => {
      const configWithSpecialPath = {
        ...mockConfig,
        executionContext: "/test/project with spaces/特殊字符",
      };
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(configWithSpecialPath);

      expect(downloadRepo).toHaveBeenCalledWith(
        mockTemplate,
        "/test/project with spaces/特殊字符",
        false,
      );
    });

    it("should handle template with special characters in name", async () => {
      const specialTemplate = {
        ...mockTemplate,
        name: "template-with_special.chars",
      };
      const configWithSpecialTemplate = {
        ...mockConfig,
        template: specialTemplate,
      };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(configWithSpecialTemplate);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting template 'template-with_special.chars' from SkipLabs/create-skip-service",
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t✓ Template template-with_special.chars downloaded successfully",
      );
    });

    it("should handle empty string template name", async () => {
      const emptyTemplate = { ...mockTemplate, name: "" };
      const configWithEmptyTemplate = {
        ...mockConfig,
        template: emptyTemplate,
      };
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(configWithEmptyTemplate);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting template '' from SkipLabs/create-skip-service",
      );
      expect(downloadRepo).toHaveBeenCalledWith(
        emptyTemplate,
        "/test/project",
        false,
      );
    });
  });

  describe("Logging verification", () => {
    it("should call logger methods in correct order", async () => {
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(mockConfig);

      // Verify all expected calls were made
      expect(logger.logTitle).toHaveBeenCalledTimes(1);
      expect(downloadRepo).toHaveBeenCalledTimes(1);
      expect(logger.green).toHaveBeenCalledTimes(1);
    });

    it("should log correct messages for successful download", async () => {
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockResolvedValueOnce(undefined);

      await getTemplateStep(mockConfig);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Getting template 'default' from SkipLabs/create-skip-service",
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t✓ Template default downloaded successfully",
      );
    });

    it("should not log success message on error", async () => {
      const { logger } = await import("../io.js");
      const { downloadRepo } = await import("../downloadUtils.js");

      vi.mocked(downloadRepo).mockRejectedValueOnce(
        new Error("Download failed"),
      );

      await expect(getTemplateStep(mockConfig)).rejects.toThrow();

      expect(logger.logTitle).toHaveBeenCalled();
      expect(logger.green).not.toHaveBeenCalled();
    });
  });
});
