import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDirectoryAndEnterStep } from "../createDirectoryAndEnterStep.js";
import { Config } from "../types.js";
import * as fs from "fs";
import { execa } from "execa";
import * as promptUtils from "../promptUtils.js";
import { logger } from "../io.js";

vi.mock("execa");
vi.mock("../promptUtils.js");
vi.mock("../io.js");

const mockExeca = vi.mocked(execa);
const mockPrompt = vi.mocked(promptUtils.prompt);

describe("createDirectoryAndEnterStep", () => {
  let originalCwd: string;
  let mockChdir: any;
  let mockAccess: any;
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
    mockChdir = vi.spyOn(process, "chdir").mockImplementation(() => undefined);
    mockAccess = vi.spyOn(fs.promises, "access");
    mockExit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
  });

  describe("when directory does not exist", () => {
    it("should create directory and change to it", async () => {
      mockAccess.mockRejectedValue(new Error("ENOENT"));
      mockExeca.mockResolvedValue({} as any);

      await createDirectoryAndEnterStep(baseConfig);

      expect(mockExeca).toHaveBeenCalledWith("mkdir", [
        "-p",
        "/path/to/test-project",
      ]);
      expect(mockChdir).toHaveBeenCalledWith("/path/to/test-project");
      expect(mockPrompt).not.toHaveBeenCalled();
    });
  });

  describe("when directory exists with force flag", () => {
    it("should remove and recreate directory without prompting", async () => {
      const configWithForce = { ...baseConfig, force: true };
      mockAccess.mockResolvedValue(undefined);
      mockExeca.mockResolvedValue({} as any);

      await createDirectoryAndEnterStep(configWithForce);

      expect(mockExeca).toHaveBeenCalledWith("rm", [
        "-rf",
        "/path/to/test-project",
      ]);
      expect(mockExeca).toHaveBeenCalledWith("mkdir", [
        "-p",
        "/path/to/test-project",
      ]);
      expect(mockChdir).toHaveBeenCalledWith("/path/to/test-project");
      expect(mockPrompt).not.toHaveBeenCalled();
    });
  });

  describe("when directory exists without force flag", () => {
    beforeEach(() => {
      mockAccess.mockResolvedValue(undefined);
      mockExeca.mockResolvedValue({} as any);
    });

    it("should prompt user and proceed when user confirms", async () => {
      mockPrompt.mockResolvedValue("y");

      await createDirectoryAndEnterStep(baseConfig);

      expect(mockPrompt).toHaveBeenCalledWith(
        expect.stringContaining("Do you want to delete it and continue?"),
      );
      expect(mockExeca).toHaveBeenCalledWith("rm", [
        "-rf",
        "/path/to/test-project",
      ]);
      expect(mockExeca).toHaveBeenCalledWith("mkdir", [
        "-p",
        "/path/to/test-project",
      ]);
      expect(mockChdir).toHaveBeenCalledWith("/path/to/test-project");
    });

    it("should accept uppercase Y", async () => {
      mockPrompt.mockResolvedValue("Y");

      await createDirectoryAndEnterStep(baseConfig);

      expect(mockExeca).toHaveBeenCalledWith("rm", [
        "-rf",
        "/path/to/test-project",
      ]);
      expect(mockExeca).toHaveBeenCalledWith("mkdir", [
        "-p",
        "/path/to/test-project",
      ]);
    });

    it("should exit when user declines", async () => {
      mockPrompt.mockResolvedValue("n");

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "process.exit called",
      );

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockExeca).not.toHaveBeenCalled();
      expect(mockChdir).not.toHaveBeenCalled();
    });

    it("should exit when user provides empty response", async () => {
      mockPrompt.mockResolvedValue("");

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "process.exit called",
      );

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should exit for any response other than y/Y", async () => {
      mockPrompt.mockResolvedValue("maybe");

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "process.exit called",
      );

      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe("error handling", () => {
    it("should propagate errors from mkdir", async () => {
      mockAccess.mockRejectedValue(new Error("ENOENT"));
      mockExeca.mockRejectedValue(new Error("mkdir failed"));

      await expect(createDirectoryAndEnterStep(baseConfig)).rejects.toThrow(
        "mkdir failed",
      );
    });

    it("should propagate errors from rm when overwriting", async () => {
      mockAccess.mockResolvedValue(undefined);
      mockPrompt.mockResolvedValue("y");
      mockExeca
        .mockRejectedValueOnce(new Error("rm failed"))
        .mockResolvedValue({} as any);

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
