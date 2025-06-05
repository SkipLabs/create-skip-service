import { describe, it, expect, vi, beforeEach } from "vitest";
import { initProjectStep } from "../initProjectStep.js";
import { Config } from "../types.js";
import { CreateSkipServiceError } from "../errors.js";
import type { PathLike } from "fs";

// Mock all external dependencies
vi.mock("../io.js", () => ({
  logger: {
    blue: vi.fn(),
    green: vi.fn(),
    gray: vi.fn(),
  },
}));

vi.mock("execa", () => ({
  execa: vi.fn(),
}));

vi.mock("fs", () => ({
  existsSync: vi.fn(),
}));

vi.mock("../errors.js", () => ({
  CreateSkipServiceError: vi.fn().mockImplementation((message, context) => {
    const error = new CreateSkipServiceError(message, context);
    return error;
  }),
}));

describe("initProjectStep", () => {
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

  describe("Script file existence checks", () => {
    it("should make both scripts executable when they exist", async () => {
      const fs = await import("fs");
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean => {
        return (
          String(path).includes("setup.sh") ||
          String(path).includes("init_server.sh")
        );
      });
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(baseConfig);

      expect(fs.existsSync).toHaveBeenCalledWith("/test/project/setup.sh");
      expect(fs.existsSync).toHaveBeenCalledWith(
        "/test/project/init_server.sh",
      );
      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/setup.sh executable...",
      );
      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/init_server.sh executable...",
      );
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/test/project/setup.sh",
      ]);
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/test/project/init_server.sh",
      ]);
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/setup.sh is now executable",
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/init_server.sh is now executable",
      );
    });

    it("should only make setup.sh executable when only it exists", async () => {
      const fs = await import("fs");
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean => {
        return (
          String(path).includes("setup.sh") &&
          !String(path).includes("init_server.sh")
        );
      });
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(baseConfig);

      expect(fs.existsSync).toHaveBeenCalledWith("/test/project/setup.sh");
      expect(fs.existsSync).toHaveBeenCalledWith(
        "/test/project/init_server.sh",
      );
      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/setup.sh executable...",
      );
      expect(logger.gray).toHaveBeenCalledWith(
        "\tinit_server.sh does not exist",
      );
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/test/project/setup.sh",
      ]);
      expect(execa).toHaveBeenCalledTimes(1);
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/setup.sh is now executable",
      );
    });

    it("should only make init_server.sh executable when only it exists", async () => {
      const fs = await import("fs");
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean => {
        return (
          String(path).includes("init_server.sh") &&
          !String(path).includes("setup.sh")
        );
      });
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(baseConfig);

      expect(fs.existsSync).toHaveBeenCalledWith("/test/project/setup.sh");
      expect(fs.existsSync).toHaveBeenCalledWith(
        "/test/project/init_server.sh",
      );
      expect(logger.gray).toHaveBeenCalledWith("\tsetup.sh does not exist");
      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/init_server.sh executable...",
      );
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/test/project/init_server.sh",
      ]);
      expect(execa).toHaveBeenCalledTimes(1);
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/init_server.sh is now executable",
      );
    });

    it("should log gray messages when neither script exists", async () => {
      const fs = await import("fs");
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockReturnValue(false);

      await initProjectStep(baseConfig);

      expect(fs.existsSync).toHaveBeenCalledWith("/test/project/setup.sh");
      expect(fs.existsSync).toHaveBeenCalledWith(
        "/test/project/init_server.sh",
      );
      expect(logger.gray).toHaveBeenCalledWith("\tsetup.sh does not exist");
      expect(logger.gray).toHaveBeenCalledWith(
        "\tinit_server.sh does not exist",
      );
      expect(execa).not.toHaveBeenCalled();
      expect(logger.blue).not.toHaveBeenCalled();
      expect(logger.green).not.toHaveBeenCalled();
    });
  });

  describe("Different execution contexts", () => {
    it("should handle different execution context paths", async () => {
      const config = { ...baseConfig, executionContext: "/custom/path/my-app" };
      const fs = await import("fs");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(config);

      expect(fs.existsSync).toHaveBeenCalledWith(
        "/custom/path/my-app/setup.sh",
      );
      expect(fs.existsSync).toHaveBeenCalledWith(
        "/custom/path/my-app/init_server.sh",
      );
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/custom/path/my-app/setup.sh",
      ]);
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/custom/path/my-app/init_server.sh",
      ]);
    });

    it("should handle paths with special characters", async () => {
      const config = {
        ...baseConfig,
        executionContext: "/test/project with spaces/特殊字符",
      };
      const fs = await import("fs");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(config);

      expect(fs.existsSync).toHaveBeenCalledWith(
        "/test/project with spaces/特殊字符/setup.sh",
      );
      expect(fs.existsSync).toHaveBeenCalledWith(
        "/test/project with spaces/特殊字符/init_server.sh",
      );
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/test/project with spaces/特殊字符/setup.sh",
      ]);
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "/test/project with spaces/特殊字符/init_server.sh",
      ]);
    });
  });

  describe("Error handling", () => {
    it("should throw CreateSkipServiceError when chmod fails for setup.sh", async () => {
      const fs = await import("fs");
      const { execa } = await import("execa");
      const { CreateSkipServiceError } = await import("../errors.js");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean =>
        String(path).includes("setup.sh"),
      );
      vi.mocked(execa).mockRejectedValueOnce(new Error("Permission denied"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow();

      expect(CreateSkipServiceError).toHaveBeenCalledWith(
        "Failed to make init_server.sh executable: Permission denied",
        "/test/project",
      );
    });

    it("should throw CreateSkipServiceError when chmod fails for init_server.sh", async () => {
      const fs = await import("fs");
      const { execa } = await import("execa");
      const { CreateSkipServiceError } = await import("../errors.js");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean =>
        String(path).includes("init_server.sh"),
      );
      vi.mocked(execa).mockRejectedValueOnce(new Error("File not found"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow();

      expect(CreateSkipServiceError).toHaveBeenCalledWith(
        "Failed to make init_server.sh executable: File not found",
        "/test/project",
      );
    });

    it("should throw CreateSkipServiceError with correct context when multiple scripts fail", async () => {
      const config = { ...baseConfig, executionContext: "/custom/project" };
      const fs = await import("fs");
      const { execa } = await import("execa");
      const { CreateSkipServiceError } = await import("../errors.js");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(execa)
        .mockResolvedValueOnce({} as any) // setup.sh succeeds
        .mockRejectedValueOnce(new Error("Network error")); // init_server.sh fails

      await expect(initProjectStep(config)).rejects.toThrow();

      expect(CreateSkipServiceError).toHaveBeenCalledWith(
        "Failed to make init_server.sh executable: Network error",
        "/custom/project",
      );
    });

    it("should handle different error types", async () => {
      const fs = await import("fs");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(execa).mockRejectedValueOnce(new TypeError("Invalid argument"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow();
    });
  });

  describe("Command execution order", () => {
    it("should execute chmod commands in correct order when both files exist", async () => {
      const fs = await import("fs");
      const { execa } = await import("execa");

      const execaCalls: string[][] = [];
      (vi.mocked(execa) as any).mockImplementation(
        async (command: any, args?: any) => {
          execaCalls.push([String(command), ...(args || [])]);
          return {} as any;
        },
      );
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await initProjectStep(baseConfig);

      expect(execaCalls).toEqual([
        ["chmod", "+x", "/test/project/setup.sh"],
        ["chmod", "+x", "/test/project/init_server.sh"],
      ]);
    });

    it("should only execute chmod for existing files", async () => {
      const fs = await import("fs");
      const { execa } = await import("execa");

      const execaCalls: string[][] = [];
      (vi.mocked(execa) as any).mockImplementation(
        async (command: any, args?: any) => {
          execaCalls.push([String(command), ...(args || [])]);
          return {} as any;
        },
      );
      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean =>
        String(path).includes("setup.sh"),
      );

      await initProjectStep(baseConfig);

      expect(execaCalls).toEqual([["chmod", "+x", "/test/project/setup.sh"]]);
    });
  });

  describe("Logging behavior", () => {
    it("should log making files executable in correct order", async () => {
      const fs = await import("fs");
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(baseConfig);

      expect(logger.blue).toHaveBeenNthCalledWith(
        1,
        "\tMaking /test/project/setup.sh executable...",
      );
      expect(logger.green).toHaveBeenNthCalledWith(
        1,
        "\t/test/project/setup.sh is now executable",
      );
      expect(logger.blue).toHaveBeenNthCalledWith(
        2,
        "\tMaking /test/project/init_server.sh executable...",
      );
      expect(logger.green).toHaveBeenNthCalledWith(
        2,
        "\t/test/project/init_server.sh is now executable",
      );
    });

    it("should not log success messages when chmod commands fail", async () => {
      const fs = await import("fs");
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(execa).mockRejectedValueOnce(new Error("Chmod failed"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow();

      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/setup.sh executable...",
      );
      expect(logger.green).not.toHaveBeenCalled();
    });

    it("should log correct file paths in messages", async () => {
      const config = { ...baseConfig, executionContext: "/different/path" };
      const fs = await import("fs");
      const { logger } = await import("../io.js");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean =>
        String(path).includes("setup.sh"),
      );
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(config);

      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /different/path/setup.sh executable...",
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t/different/path/setup.sh is now executable",
      );
      expect(logger.gray).toHaveBeenCalledWith(
        "\tinit_server.sh does not exist",
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle empty execution context", async () => {
      const config = { ...baseConfig, executionContext: "" };
      const fs = await import("fs");

      vi.mocked(fs.existsSync).mockReturnValue(false);

      await initProjectStep(config);

      expect(fs.existsSync).toHaveBeenCalledWith("setup.sh");
      expect(fs.existsSync).toHaveBeenCalledWith("init_server.sh");
    });

    it("should handle relative execution context paths", async () => {
      const config = { ...baseConfig, executionContext: "./relative/path" };
      const fs = await import("fs");
      const { execa } = await import("execa");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(execa).mockResolvedValue({} as any);

      await initProjectStep(config);

      expect(fs.existsSync).toHaveBeenCalledWith("relative/path/setup.sh");
      expect(fs.existsSync).toHaveBeenCalledWith(
        "relative/path/init_server.sh",
      );
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "relative/path/setup.sh",
      ]);
      expect(execa).toHaveBeenCalledWith("chmod", [
        "+x",
        "relative/path/init_server.sh",
      ]);
    });
  });
});
