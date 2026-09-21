import { describe, it, expect } from "vitest";
import {
  validateProjectName,
  validateTemplateName,
} from "../utils/validators.js";

describe("validateProjectName", () => {
  it("should accept a simple project name", () => {
    expect(validateProjectName("my-project")).toEqual({ valid: true });
  });

  it("should accept names with underscores and digits", () => {
    expect(validateProjectName("my_project_2")).toEqual({ valid: true });
  });

  it("should reject empty names", () => {
    expect(validateProjectName("").valid).toBe(false);
    expect(validateProjectName("   ").valid).toBe(false);
  });

  it("should reject names with leading or trailing whitespace", () => {
    expect(validateProjectName(" my-project").valid).toBe(false);
    expect(validateProjectName("my-project ").valid).toBe(false);
  });

  it("should reject names containing slashes", () => {
    expect(validateProjectName("a/b").valid).toBe(false);
    expect(validateProjectName("a\\b").valid).toBe(false);
  });

  it("should reject names starting with a dot, dash, or underscore", () => {
    expect(validateProjectName(".hidden").valid).toBe(false);
    expect(validateProjectName("-project").valid).toBe(false);
    expect(validateProjectName("_project").valid).toBe(false);
  });

  it("should reject path traversal sequences", () => {
    expect(validateProjectName("a..b").valid).toBe(false);
  });

  it("should reject names with spaces", () => {
    expect(validateProjectName("my project").valid).toBe(false);
  });

  it("should reject special characters", () => {
    for (const char of ["<", ">", ":", '"', "|", "?", "*"]) {
      expect(validateProjectName(`my${char}project`).valid).toBe(false);
    }
  });

  it("should reject names longer than 214 characters", () => {
    expect(validateProjectName("a".repeat(215)).valid).toBe(false);
    expect(validateProjectName("a".repeat(214)).valid).toBe(true);
  });

  it("should reject reserved names regardless of case", () => {
    expect(validateProjectName("node_modules").valid).toBe(false);
    expect(validateProjectName("NPM").valid).toBe(false);
    expect(validateProjectName("bun").valid).toBe(false);
    expect(validateProjectName("bun.lock").valid).toBe(false);
    expect(validateProjectName("package.json").valid).toBe(false);
  });
});

describe("validateTemplateName", () => {
  it("should accept known template names", () => {
    expect(validateTemplateName("default")).toEqual({ valid: true });
    expect(validateTemplateName("with_postgres")).toEqual({ valid: true });
    expect(validateTemplateName("with_react_vite")).toEqual({ valid: true });
  });

  it("should reject empty names", () => {
    expect(validateTemplateName("").valid).toBe(false);
    expect(validateTemplateName("  ").valid).toBe(false);
  });

  it("should reject path traversal sequences", () => {
    expect(validateTemplateName("..").valid).toBe(false);
    expect(validateTemplateName("a/b").valid).toBe(false);
    expect(validateTemplateName("a\\b").valid).toBe(false);
  });

  it("should reject special characters and spaces", () => {
    expect(validateTemplateName("a b").valid).toBe(false);
    expect(validateTemplateName("a<b").valid).toBe(false);
    expect(validateTemplateName("a|b").valid).toBe(false);
  });
});
