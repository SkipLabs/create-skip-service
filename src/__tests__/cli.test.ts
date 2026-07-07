import { describe, it, expect } from "vitest";
import path from "path";
import { createCliParser, buildConfig } from "../cliParser.js";
import { Config } from "../types.js";

const parseCliArgs = (args: string[]): Config => {
  const program = createCliParser();

  // Silence error output and prevent exit for testing
  program.exitOverride();
  program.configureOutput({
    writeErr: () => {},
    writeOut: () => {},
  });

  try {
    program.parse(args, { from: "user" });
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err) {
      const cmdErr = err as { code: string };
      if (cmdErr.code === "commander.missingArgument") {
        throw new Error("Project name is required");
      }
      if (cmdErr.code === "commander.excessArguments") {
        throw new Error("Too many arguments");
      }
    }
    throw err;
  }

  return buildConfig(program);
};

describe("CLI Argument Parsing", () => {
  describe("Basic argument parsing", () => {
    it("should parse project name correctly", () => {
      const config: Config = parseCliArgs(["my-project"]);

      expect(config.projectName).toBe("my-project");
      expect(config.executionContext).toBe(
        path.join(process.cwd(), "my-project"),
      );
      expect(config.quiet).toBe(false);
      expect(config.verbose).toBe(false);
      expect(config.force).toBe(false);
      expect(config.withGit).toBe(true);
      expect(config.example).toBeNull();
      expect(config.template).toEqual({
        name: "default",
        path: "templates",
        repo: "SkipLabs/create-skip-service",
      });
    });

    it("should throw error when project name is missing", () => {
      expect(() => parseCliArgs([])).toThrow("Project name is required");
    });

    it("should reject invalid project names", () => {
      expect(() => parseCliArgs(["../escape"])).toThrow();
      expect(() => parseCliArgs([".hidden"])).toThrow();
      expect(() => parseCliArgs(["node_modules"])).toThrow();
    });
  });

  describe("Template options", () => {
    it("should use default template when no template specified", () => {
      const config = parseCliArgs(["my-project"]);

      expect(config.template).toEqual({
        repo: "SkipLabs/create-skip-service",
        path: "templates",
        name: "default",
      });
      expect(config.example).toBeNull();
    });

    it("should use specified template", () => {
      const config = parseCliArgs([
        "my-project",
        "--template",
        "with_postgres",
      ]);

      expect(config.template).toEqual({
        repo: "SkipLabs/create-skip-service",
        path: "templates",
        name: "with_postgres",
      });
      expect(config.example).toBeNull();
    });

    it("should use specified example", () => {
      const config = parseCliArgs(["my-project", "--example", "blogger"]);

      expect(config.example).toEqual({
        name: "blogger",
        repo: "SkipLabs/skip",
        path: "examples",
      });
      expect(config.template).toBeNull();
    });

    it("should throw error when both template and example are specified", () => {
      expect(() =>
        parseCliArgs([
          "my-project",
          "--template",
          "default",
          "--example",
          "blogger",
        ]),
      ).toThrow("Example and template cannot be used together");
    });

    it("should reject template names with path traversal", () => {
      expect(() =>
        parseCliArgs(["my-project", "--template", "../../etc"]),
      ).toThrow("Invalid template name");
    });

    it("should reject example names with path traversal", () => {
      expect(() => parseCliArgs(["my-project", "--example", "a/b"])).toThrow(
        "Invalid example name",
      );
    });
  });

  describe("Flag options", () => {
    it("should handle verbose flag", () => {
      const config = parseCliArgs(["my-project", "--verbose"]);

      expect(config.verbose).toBe(true);
      expect(config.quiet).toBe(false);
    });

    it("should handle quiet flag", () => {
      const config = parseCliArgs(["my-project", "--quiet"]);

      expect(config.quiet).toBe(true);
      expect(config.verbose).toBe(false);
    });

    it("should handle force flag", () => {
      const config = parseCliArgs(["my-project", "--force"]);

      expect(config.force).toBe(true);
    });

    it("should handle no-git-init flag", () => {
      const config = parseCliArgs(["my-project", "--no-git-init"]);

      expect(config.withGit).toBe(false);
    });

    it("should default git init to true", () => {
      const config = parseCliArgs(["my-project"]);

      expect(config.withGit).toBe(true);
    });
  });

  describe("Flag combinations", () => {
    it("should handle multiple flags correctly", () => {
      const config = parseCliArgs([
        "my-project",
        "--template",
        "with_postgres",
        "--verbose",
        "--force",
        "--no-git-init",
      ]);

      expect(config.projectName).toBe("my-project");
      expect(config.template?.name).toBe("with_postgres");
      expect(config.verbose).toBe(true);
      expect(config.force).toBe(true);
      expect(config.withGit).toBe(false);
    });

    it("should handle short flags", () => {
      const config = parseCliArgs([
        "my-project",
        "-t",
        "default",
        "-v",
        "-f",
        "-q",
      ]);

      expect(config.template?.name).toBe("default");
      expect(config.verbose).toBe(true);
      expect(config.force).toBe(true);
      expect(config.quiet).toBe(true);
    });
  });
});
