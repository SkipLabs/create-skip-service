import { describe, it, expect, vi, beforeEach } from "vitest";
import { gitStep } from "../gitStep.js";
import { Config, GitRepo } from "../types.js";

// Mock dependencies
vi.mock("../io.js", () => ({
  logger: {
    logTitle: vi.fn(),
    green: vi.fn(),
    gray: vi.fn(),
  },
}));

vi.mock("execa", () => ({
  execa: vi.fn(),
}));

describe("gitStep", () => {
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
    template: mockTemplate,
    example: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Git initialization enabled (withGit: true)", () => {
    it("should initialize git repository successfully with template", async () => {
      const config = { ...baseConfig, withGit: true };
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(config);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Initializing git repository",
      );
      expect(execa).toHaveBeenCalledWith("git", ["init"]);
      expect(logger.green).toHaveBeenCalledWith("\t✓ initialized");
      expect(execa).toHaveBeenCalledWith("git", ["add", "."]);
      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nCloned 'default' template from github.com/SkipLabs/create-skip-service",
      ]);
      expect(logger.green).toHaveBeenCalledWith("\t✓ initial commit created");
    });

    it("should initialize git repository successfully with example", async () => {
      const config = {
        ...baseConfig,
        withGit: true,
        template: null,
        example: mockExample,
      };
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(config);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Initializing git repository",
      );
      expect(execa).toHaveBeenCalledWith("git", ["init"]);
      expect(logger.green).toHaveBeenCalledWith("\t✓ initialized");
      expect(execa).toHaveBeenCalledWith("git", ["add", "."]);
      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nCloned 'blogger' example from github.com/SkipLabs/skip",
      ]);
      expect(logger.green).toHaveBeenCalledWith("\t✓ initial commit created");
    });

    it("should execute git commands in correct order", async () => {
      const config = { ...baseConfig, withGit: true };
      const { execa } = await import("execa");

      const execaCalls: string[][] = [];
      (vi.mocked(execa) as any).mockImplementation(
        async (command: any, args?: any) => {
          execaCalls.push([String(command), ...(args || [])]);
          return {} as any;
        },
      );

      await gitStep(config);

      expect(execaCalls).toEqual([
        ["git", "init"],
        ["git", "add", "."],
        ["git", "commit", "-m", expect.any(String)],
      ]);
    });
  });

  describe("Git initialization disabled (withGit: false)", () => {
    it("should skip git initialization when withGit is false", async () => {
      const config = { ...baseConfig, withGit: false };
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      await gitStep(config);

      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Initializing git repository",
      );
      expect(logger.gray).toHaveBeenCalledWith(
        "\t- Skipping git initialization",
      );
      expect(execa).not.toHaveBeenCalled();
      expect(logger.green).not.toHaveBeenCalled();
    });

    it("should not execute any git commands when disabled", async () => {
      const config = { ...baseConfig, withGit: false };
      const { execa } = await import("execa");

      await gitStep(config);

      expect(execa).not.toHaveBeenCalledWith("git", expect.anything());
    });
  });

  describe("Commit message generation", () => {
    it("should generate correct commit message for template", async () => {
      const templateConfig = {
        ...baseConfig,
        template: {
          repo: "CustomOrg/templates",
          path: "templates",
          name: "custom",
        },
        example: null,
      };
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(templateConfig);

      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nCloned 'custom' template from github.com/CustomOrg/templates",
      ]);
    });

    it("should generate correct commit message for example", async () => {
      const exampleConfig = {
        ...baseConfig,
        template: null,
        example: {
          repo: "CustomOrg/examples",
          path: "samples",
          name: "sample-app",
        },
      };
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(exampleConfig);

      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nCloned 'sample-app' example from github.com/CustomOrg/examples",
      ]);
    });

    it("should handle template names with special characters", async () => {
      const specialTemplateConfig = {
        ...baseConfig,
        template: {
          repo: "SkipLabs/create-skip-service",
          path: "templates",
          name: "template-with_special.chars-123",
        },
        example: null,
      };
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(specialTemplateConfig);

      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nCloned 'template-with_special.chars-123' template from github.com/SkipLabs/create-skip-service",
      ]);
    });

    it("should handle repository names with special characters", async () => {
      const specialRepoConfig = {
        ...baseConfig,
        template: {
          repo: "Org-Name/repo_with.special-chars",
          path: "templates",
          name: "default",
        },
        example: null,
      };
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(specialRepoConfig);

      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nCloned 'default' template from github.com/Org-Name/repo_with.special-chars",
      ]);
    });
  });

  describe("Error handling", () => {
    it("should handle git init failure", async () => {
      const config = { ...baseConfig, withGit: true };
      const { execa } = await import("execa");

      vi.mocked(execa).mockRejectedValueOnce(new Error("git init failed"));

      await expect(gitStep(config)).rejects.toThrow("git init failed");

      expect(execa).toHaveBeenCalledWith("git", ["init"]);
      // Should not proceed to further git commands
      expect(execa).toHaveBeenCalledTimes(1);
    });

    it("should handle git add failure", async () => {
      const config = { ...baseConfig, withGit: true };
      const { execa } = await import("execa");

      vi.mocked(execa)
        .mockResolvedValueOnce({} as any) // git init succeeds
        .mockRejectedValueOnce(new Error("git add failed")); // git add fails

      await expect(gitStep(config)).rejects.toThrow("git add failed");

      expect(execa).toHaveBeenCalledWith("git", ["init"]);
      expect(execa).toHaveBeenCalledWith("git", ["add", "."]);
      expect(execa).toHaveBeenCalledTimes(2);
    });

    it("should handle git commit failure", async () => {
      const config = { ...baseConfig, withGit: true };
      const { execa } = await import("execa");

      vi.mocked(execa)
        .mockResolvedValueOnce({} as any) // git init succeeds
        .mockResolvedValueOnce({} as any) // git add succeeds
        .mockRejectedValueOnce(new Error("git commit failed")); // git commit fails

      await expect(gitStep(config)).rejects.toThrow("git commit failed");

      expect(execa).toHaveBeenCalledWith("git", ["init"]);
      expect(execa).toHaveBeenCalledWith("git", ["add", "."]);
      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        expect.any(String),
      ]);
      expect(execa).toHaveBeenCalledTimes(3);
    });

    it("should handle different error types", async () => {
      const config = { ...baseConfig, withGit: true };
      const { execa } = await import("execa");

      const customError = new TypeError("Invalid git configuration");
      vi.mocked(execa).mockRejectedValueOnce(customError);

      await expect(gitStep(config)).rejects.toThrow(
        "Invalid git configuration",
      );
    });
  });

  describe("Logging behavior", () => {
    it("should log title for both enabled and disabled git", async () => {
      const { logger } = await import("../io.js");

      // Test with git enabled
      const enabledConfig = { ...baseConfig, withGit: true };
      const { execa } = await import("execa");
      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(enabledConfig);
      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Initializing git repository",
      );

      vi.clearAllMocks();

      // Test with git disabled
      const disabledConfig = { ...baseConfig, withGit: false };
      await gitStep(disabledConfig);
      expect(logger.logTitle).toHaveBeenCalledWith(
        " - Initializing git repository",
      );
    });

    it("should log success messages only when git commands succeed", async () => {
      const config = { ...baseConfig, withGit: true };
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(config);

      expect(logger.green).toHaveBeenCalledWith("\t✓ initialized");
      expect(logger.green).toHaveBeenCalledWith("\t✓ initial commit created");
      expect(logger.green).toHaveBeenCalledTimes(2);
    });

    it("should not log success messages on git command failure", async () => {
      const config = { ...baseConfig, withGit: true };
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(execa).mockRejectedValueOnce(new Error("git init failed"));

      await expect(gitStep(config)).rejects.toThrow();

      expect(logger.logTitle).toHaveBeenCalled();
      expect(logger.green).not.toHaveBeenCalled();
    });
  });

  describe("Configuration edge cases", () => {
    it("should handle config with both template and example (should prefer example)", async () => {
      const configWithBoth = {
        ...baseConfig,
        withGit: true,
        template: mockTemplate,
        example: mockExample,
      };
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(configWithBoth);

      // Should use example in commit message when both are present
      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nCloned 'blogger' example from github.com/SkipLabs/skip",
      ]);
    });

    it("should handle missing template and example with fallback message", async () => {
      const configWithoutTemplate = {
        ...baseConfig,
        withGit: true,
        template: null,
        example: null,
      };
      const { execa } = await import("execa");

      vi.mocked(execa).mockResolvedValue({} as any);

      await gitStep(configWithoutTemplate);

      expect(execa).toHaveBeenCalledWith("git", [
        "commit",
        "-m",
        "Initial setup by `create-skip-service`\n\nUnknown source",
      ]);
    });
  });
});
