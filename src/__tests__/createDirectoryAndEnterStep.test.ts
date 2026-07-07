import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDirectoryAndEnterStep } from "../createDirectoryAndEnterStep.js";
import { Config } from "../types.js";
import { access, mkdir, rm } from "fs/promises";
import * as promptUtils from "../promptUtils.js";

vi.mock("fs/promises", () => ({
  access: vi.fn(),
  mkdir: vi.fn(),
  rm: vi.fn(),
}));
vi.mock("../promptUtils.js");
vi.mock("../io.js");

const mockAccess = vi.mocked(access);
const mockMkdir = vi.mocked(mkdir);
const mockRm = vi.mocked(rm);
const mockPrompt = vi.mocked(promptUtils.prompt);

describe("createDirectoryAndEnterStep", () => {
  let originalCwd: string;
  let mockChdir: any;
  let mockExit: any;

  const baseConfig: Config = {
    projectName: "test-project",
    executionContext: "/path/to/test-project",
    withGit: true,
    quiet: false,
    verbose: false,
    force: false,
    example: null,
    template: {
      repo: "SkipLabs/create-skip-service",
      path: "templates",
      name: "default",
    },
  };

  beforeEach(() => {
    originalCwd = process.cwd();
    vi.clearAllMocks();
    mockChdir = vi.spyOn(process, "chdir").mockImplementation(() => undefined);
    mockExit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as any);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
  });

  describe("when directory does not exist", () => {
    it("should create directory and change to it", async () => {
      mockAccess.mockRejectedValue(new Error("ENOENT"));
      mockMkdir.mockResolvedValue(undefined);

      await createDirectoryAndEnterStep(baseConfig);

      expect(mockMkdir).toHaveBeenCalledWith("/path/to/test-project", {
        recursive: true,
      });
      expect(mockRm).not.toHaveBeenCalled();
      expect(mockChdir).toHaveBeenCalledWith("/path/to/test-project");
      expect(mockPrompt).not.toHaveBeenCalled();
    });
  });

  describe("when directory exists with force flag", () => {
    it("should remove and recreate directory without prompting", async () => {
      const configWithForce = { ...baseConfig, force: true };
      mockAccess.mockResolvedValue(undefined);
      mockRm.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);

      await createDirectoryAndEnterStep(configWithForce);

      expect(mockRm).toHaveBeenCalledWith("/path/to/test-project", {
        recursive: true,
        force: true,
      });
      expect(mockMkdir).toHaveBeenCalledWith("/path/to/test-project", {
        recursive: true,
      });
      expect(mockChdir).toHaveBeenCalledWith("/path/to/test-project");
      expect(mockPrompt).not.toHaveBeenCalled();
    });
  });

  describe("when directory exists without force flag", () => {
    beforeEach(() => {
      mockAccess.mockResolvedValue(undefined);
      mockRm.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
    });

    it("should prompt user and proceed when user confirms", async () => {
      mockPrompt.mockResolvedValue("y");

      await createDirectoryAndEnterStep(baseConfig);

      expect(mockPrompt).toHaveBeenCalledWith(
        expect.stringContaining("Do you want to delete it and continue?"),
      );
      expect(mockRm).toHaveBeenCalledWith("/path/to/test-project", {
        recursive: true,
        force: true,
      });
      expect(mockMkdir).toHaveBeenCalledWith("/path/to/test-project", {
        recursive: true,
      });
      expect(mockChdir).toHaveBeenCalledWith("/path/to/test-project");
    });

    it("should accept uppercase Y", async () => {
      mockPrompt.mockResolvedValue("Y");

      await createDirectoryAndEnterStep(baseConfig);

      expect(mockRm).toHaveBeenCalled();
      expect(mockMkdir).toHaveBeenCalled();
    });

    it("should exit with code 0 when user declines", async () => {
      mockPrompt.mockResolvedValue("n");

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "process.exit called",
      );

      expect(mockExit).toHaveBeenCalledWith(0);
      expect(mockRm).not.toHaveBeenCalled();
      expect(mockMkdir).not.toHaveBeenCalled();
      expect(mockChdir).not.toHaveBeenCalled();
    });

    it("should exit with code 0 when user provides empty response", async () => {
      mockPrompt.mockResolvedValue("");

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "process.exit called",
      );

      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it("should exit for any response other than y/Y", async () => {
      mockPrompt.mockResolvedValue("maybe");

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "process.exit called",
      );

      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe("error handling", () => {
    it("should propagate errors from mkdir", async () => {
      mockAccess.mockRejectedValue(new Error("ENOENT"));
      mockMkdir.mockRejectedValue(new Error("mkdir failed"));

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "mkdir failed",
      );
    });

    it("should propagate errors from rm when overwriting", async () => {
      mockAccess.mockResolvedValue(undefined);
      mockPrompt.mockResolvedValue("y");
      mockRm.mockRejectedValue(new Error("rm failed"));

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "rm failed",
      );
    });

    it("should propagate errors from prompt", async () => {
      mockAccess.mockResolvedValue(undefined);
      mockPrompt.mockRejectedValue(new Error("prompt failed"));

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "prompt failed",
      );
    });
  });
});
