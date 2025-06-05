import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadRepo } from "../downloadUtils.js";
import { CreateSkipServiceError } from "../errors.js";
import { GitRepo } from "../types.js";
import { mkdir, writeFile } from "fs/promises";

// Mock dependencies
vi.mock("fs/promises", () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("../io.js", () => ({
  logger: {
    gray: vi.fn(),
    logError: vi.fn(),
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Download Utils", () => {
  const mockRepo: GitRepo = {
    repo: "SkipLabs/create-skip-service",
    path: "templates",
    name: "default",
  };

  const mockExecutionContext = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic download functionality", () => {
    it("should download repo successfully with valid template", async () => {
      // Mock API responses
      const mockTemplateListResponse = [
        { name: "default", type: "dir", path: "templates/default" },
        { name: "with_postgres", type: "dir", path: "templates/with_postgres" },
      ];

      const mockTemplateContents = [
        {
          name: "package.json",
          type: "file",
          path: "templates/default/package.json",
          download_url:
            "https://raw.githubusercontent.com/SkipLabs/create-skip-service/main/templates/default/package.json",
        },
        {
          name: "README.md",
          type: "file",
          path: "templates/default/README.md",
          download_url:
            "https://raw.githubusercontent.com/SkipLabs/create-skip-service/main/templates/default/README.md",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTemplateListResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTemplateContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve('{"name": "test-project"}'),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve("# Test Project"),
        });

      await downloadRepo(mockRepo, mockExecutionContext, false);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.github.com/repos/SkipLabs/create-skip-service/contents/templates",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "create-skip-service",
          },
        },
      );
    });

    it("should handle GitHub API headers correctly", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        });

      await downloadRepo(mockRepo, mockExecutionContext, false);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "create-skip-service",
          },
        }),
      );
    });
  });

  describe("GitHub API rate limiting", () => {
    it("should handle 403 rate limit error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(
        downloadRepo(mockRepo, mockExecutionContext, false),
      ).rejects.toThrow("GitHub API rate limit exceeded");
    });

    it("should throw rate limit error with correct message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      try {
        await downloadRepo(mockRepo, mockExecutionContext, false);
      } catch (error) {
        expect(error).toBeInstanceOf(CreateSkipServiceError);
        expect((error as CreateSkipServiceError).message).toContain(
          "GitHub API rate limit exceeded",
        );
        expect((error as CreateSkipServiceError).executionContext).toBe(
          mockExecutionContext,
        );
      }
    });
  });

  describe("Network failures and error handling", () => {
    it("should handle network failures", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        downloadRepo(mockRepo, mockExecutionContext, false),
      ).rejects.toThrow("Network error");
    });

    it("should handle non-200 HTTP responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        downloadRepo(mockRepo, mockExecutionContext, false),
      ).rejects.toThrow("Failed to fetch repository contents");
    });

    it("should handle invalid JSON responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(
        downloadRepo(mockRepo, mockExecutionContext, false),
      ).rejects.toThrow(CreateSkipServiceError);
    });

    it("should preserve CreateSkipServiceError instances", async () => {
      const originalError = new CreateSkipServiceError(
        "Original error",
        "/original/path",
      );

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.reject(originalError),
        });

      try {
        await downloadRepo(mockRepo, mockExecutionContext, false);
      } catch (error) {
        expect(error).toBe(originalError);
        expect((error as CreateSkipServiceError).executionContext).toBe(
          "/original/path",
        );
      }
    });
  });

  describe("Template validation", () => {
    it("should validate template exists in repository", async () => {
      const mockTemplateListResponse = [
        { name: "with_postgres", type: "dir", path: "templates/with_postgres" },
        { name: "with_react", type: "dir", path: "templates/with_react" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTemplateListResponse),
      });

      const invalidRepo = { ...mockRepo, name: "nonexistent_template" };

      await expect(
        downloadRepo(invalidRepo, mockExecutionContext, false),
      ).rejects.toThrow("Invalid repository");
    });

    it("should list available templates when invalid template provided", async () => {
      const mockTemplateListResponse = [
        { name: "default", type: "dir", path: "templates/default" },
        { name: "with_postgres", type: "dir", path: "templates/with_postgres" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTemplateListResponse),
      });

      const { logger } = await import("../io.js");
      const invalidRepo = { ...mockRepo, name: "invalid_template" };

      try {
        await downloadRepo(invalidRepo, mockExecutionContext, false);
      } catch (error) {
        expect(logger.logError).toHaveBeenCalledWith(
          "  Invalid repository: invalid_template",
        );
        expect(logger.logError).toHaveBeenCalledWith(
          "  Available repositories:",
        );
        expect(logger.logError).toHaveBeenCalledWith("\t- default");
        expect(logger.logError).toHaveBeenCalledWith("\t- with_postgres");
      }
    });

    it("should filter only directories from repository contents", async () => {
      const mockMixedContents = [
        { name: "default", type: "dir", path: "templates/default" },
        { name: "README.md", type: "file", path: "templates/README.md" },
        { name: "with_postgres", type: "dir", path: "templates/with_postgres" },
        { name: ".gitignore", type: "file", path: "templates/.gitignore" },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockMixedContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        });

      await downloadRepo(mockRepo, mockExecutionContext, false);

      // Should not throw error as 'default' directory exists
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("File download and directory creation", () => {
    it("should create directories recursively", async () => {
      const mockTemplateContents = [
        {
          name: "src",
          type: "dir",
          path: "templates/default/src",
        },
      ];

      const mockSrcContents = [
        {
          name: "index.ts",
          type: "file",
          path: "templates/default/src/index.ts",
          download_url:
            "https://raw.githubusercontent.com/test/repo/main/templates/default/src/index.ts",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTemplateContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockSrcContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve('console.log("Hello World")'),
        });

      await downloadRepo(mockRepo, mockExecutionContext, false);

      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining("src"), {
        recursive: true,
      });
    });

    it("should write files with correct content", async () => {
      const mockFileContent = 'export default "test content"';
      const mockTemplateContents = [
        {
          name: "test.ts",
          type: "file",
          path: "templates/default/test.ts",
          download_url:
            "https://raw.githubusercontent.com/test/repo/main/templates/default/test.ts",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTemplateContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve(mockFileContent),
        });

      await downloadRepo(mockRepo, mockExecutionContext, false);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining("test.ts"),
        mockFileContent,
      );
    });

    it("should handle file download failures", async () => {
      const mockTemplateContents = [
        {
          name: "test.ts",
          type: "file",
          path: "templates/default/test.ts",
          download_url:
            "https://raw.githubusercontent.com/test/repo/main/templates/default/test.ts",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTemplateContents),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      await expect(
        downloadRepo(mockRepo, mockExecutionContext, false),
      ).rejects.toThrow(CreateSkipServiceError);
    });
  });

  describe("Verbose mode behavior", () => {
    it("should handle verbose mode without errors", async () => {
      const mockTemplateContents = [
        {
          name: "test.ts",
          type: "file",
          path: "templates/default/test.ts",
          download_url:
            "https://raw.githubusercontent.com/test/repo/main/test.ts",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockTemplateContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve("file content"),
        });

      await expect(
        downloadRepo(mockRepo, mockExecutionContext, true),
      ).resolves.toBeUndefined();
    });

    it("should handle normal mode without errors", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        });

      await expect(
        downloadRepo(mockRepo, mockExecutionContext, false),
      ).resolves.toBeUndefined();
    });
  });

  describe("Complex directory structures", () => {
    it("should handle nested directory structures", async () => {
      const mockNestedStructure = [
        {
          name: "src",
          type: "dir",
          path: "templates/default/src",
        },
      ];

      const mockSrcContents = [
        {
          name: "components",
          type: "dir",
          path: "templates/default/src/components",
        },
        {
          name: "index.ts",
          type: "file",
          path: "templates/default/src/index.ts",
          download_url:
            "https://raw.githubusercontent.com/test/repo/main/src/index.ts",
        },
      ];

      const mockComponentsContents = [
        {
          name: "Button.tsx",
          type: "file",
          path: "templates/default/src/components/Button.tsx",
          download_url:
            "https://raw.githubusercontent.com/test/repo/main/src/components/Button.tsx",
        },
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve([
              { name: "default", type: "dir", path: "templates/default" },
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockNestedStructure),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockSrcContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockComponentsContents),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () =>
            Promise.resolve("export const Button = () => <button></button>"),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: () => Promise.resolve('export * from "./components"'),
        });

      await downloadRepo(mockRepo, mockExecutionContext, false);

      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining("src"), {
        recursive: true,
      });
      expect(mkdir).toHaveBeenCalledWith(
        expect.stringContaining("components"),
        { recursive: true },
      );
    });
  });
});
