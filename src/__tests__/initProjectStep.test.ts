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

vi.mock("fs/promises", () => ({
  chmod: vi.fn(),
}));

vi.mock("fs", () => ({
  existsSync: vi.fn(),
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
      const { chmod } = await import("fs/promises");
      const { logger } = await import("../io.js");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean => {
        return (
          String(path).includes("setup.sh") ||
          String(path).includes("init_server.sh")
        );
      });
      vi.mocked(chmod).mockResolvedValue(undefined);

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
      expect(chmod).toHaveBeenCalledWith("/test/project/setup.sh", 0o755);
      expect(chmod).toHaveBeenCalledWith("/test/project/init_server.sh", 0o755);
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/setup.sh is now executable",
      );
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/init_server.sh is now executable",
      );
    });

    it("should only make setup.sh executable when only it exists", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");
      const { logger } = await import("../io.js");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean => {
        return (
          String(path).includes("setup.sh") &&
          !String(path).includes("init_server.sh")
        );
      });
      vi.mocked(chmod).mockResolvedValue(undefined);

      await initProjectStep(baseConfig);

      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/setup.sh executable...",
      );
      expect(logger.gray).toHaveBeenCalledWith(
        "\tinit_server.sh does not exist",
      );
      expect(chmod).toHaveBeenCalledWith("/test/project/setup.sh", 0o755);
      expect(chmod).toHaveBeenCalledTimes(1);
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/setup.sh is now executable",
      );
    });

    it("should only make init_server.sh executable when only it exists", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");
      const { logger } = await import("../io.js");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean => {
        return (
          String(path).includes("init_server.sh") &&
          !String(path).includes("setup.sh")
        );
      });
      vi.mocked(chmod).mockResolvedValue(undefined);

      await initProjectStep(baseConfig);

      expect(logger.gray).toHaveBeenCalledWith("\tsetup.sh does not exist");
      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/init_server.sh executable...",
      );
      expect(chmod).toHaveBeenCalledWith("/test/project/init_server.sh", 0o755);
      expect(chmod).toHaveBeenCalledTimes(1);
      expect(logger.green).toHaveBeenCalledWith(
        "\t/test/project/init_server.sh is now executable",
      );
    });

    it("should log gray messages when neither script exists", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");
      const { logger } = await import("../io.js");

      vi.mocked(fs.existsSync).mockReturnValue(false);

      await initProjectStep(baseConfig);

      expect(logger.gray).toHaveBeenCalledWith("\tsetup.sh does not exist");
      expect(logger.gray).toHaveBeenCalledWith(
        "\tinit_server.sh does not exist",
      );
      expect(chmod).not.toHaveBeenCalled();
      expect(logger.blue).not.toHaveBeenCalled();
      expect(logger.green).not.toHaveBeenCalled();
    });
  });

  describe("Different execution contexts", () => {
    it("should handle different execution context paths", async () => {
      const config = { ...baseConfig, executionContext: "/custom/path/my-app" };
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(chmod).mockResolvedValue(undefined);

      await initProjectStep(config);

      expect(chmod).toHaveBeenCalledWith("/custom/path/my-app/setup.sh", 0o755);
      expect(chmod).toHaveBeenCalledWith(
        "/custom/path/my-app/init_server.sh",
        0o755,
      );
    });
  });

  describe("Error handling", () => {
    it("should report setup.sh when chmod fails for setup.sh", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean =>
        String(path).includes("setup.sh"),
      );
      vi.mocked(chmod).mockRejectedValueOnce(new Error("Permission denied"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow(
        "Failed to make setup.sh executable: Permission denied",
      );
    });

    it("should report init_server.sh when chmod fails for init_server.sh", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");

      vi.mocked(fs.existsSync).mockImplementation((path: PathLike): boolean =>
        String(path).includes("init_server.sh"),
      );
      vi.mocked(chmod).mockRejectedValueOnce(new Error("File not found"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow(
        "Failed to make init_server.sh executable: File not found",
      );
    });

    it("should report the failing script when the first succeeds", async () => {
      const config = { ...baseConfig, executionContext: "/custom/project" };
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(chmod)
        .mockResolvedValueOnce(undefined) // setup.sh succeeds
        .mockRejectedValueOnce(new Error("Network error")); // init_server.sh fails

      let thrown: unknown;
      try {
        await initProjectStep(config);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(CreateSkipServiceError);
      expect((thrown as CreateSkipServiceError).message).toBe(
        "Failed to make init_server.sh executable: Network error",
      );
      expect((thrown as CreateSkipServiceError).executionContext).toBe(
        "/custom/project",
      );
    });

    it("should handle different error types", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(chmod).mockRejectedValueOnce(new TypeError("Invalid argument"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow(
        CreateSkipServiceError,
      );
    });
  });

  describe("Command execution order", () => {
    it("should chmod scripts in correct order when both files exist", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");

      const chmodCalls: string[] = [];
      vi.mocked(chmod).mockImplementation(async (path) => {
        chmodCalls.push(String(path));
      });
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await initProjectStep(baseConfig);

      expect(chmodCalls).toEqual([
        "/test/project/setup.sh",
        "/test/project/init_server.sh",
      ]);
    });
  });

  describe("Logging behavior", () => {
    it("should log making files executable in correct order", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");
      const { logger } = await import("../io.js");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(chmod).mockResolvedValue(undefined);

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

    it("should not log success messages when chmod fails", async () => {
      const fs = await import("fs");
      const { chmod } = await import("fs/promises");
      const { logger } = await import("../io.js");

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(chmod).mockRejectedValueOnce(new Error("Chmod failed"));

      await expect(initProjectStep(baseConfig)).rejects.toThrow();

      expect(logger.blue).toHaveBeenCalledWith(
        "\tMaking /test/project/setup.sh executable...",
      );
      expect(logger.green).not.toHaveBeenCalled();
    });
  });
});
