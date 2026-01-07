const RESERVED_NAMES = [
  "node",
  "npm",
  "pnpm",
  "yarn",
  "package",
  "node_modules",
  "package.json",
  "package-lock.json",
  "pnpm-lock.yaml",
  ".git",
  ".env",
];

export const validateProjectName = (
  name: string,
): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Project name cannot be empty" };
  }

  const trimmed = name.trim();

  if (trimmed !== name) {
    return {
      valid: false,
      error: "Project name cannot have leading or trailing whitespace",
    };
  }

  if (trimmed.includes("/") || trimmed.includes("\\")) {
    return { valid: false, error: "Project name cannot contain slashes" };
  }

  if (trimmed.startsWith(".")) {
    return { valid: false, error: "Project name cannot start with a dot" };
  }

  if (trimmed.startsWith("-") || trimmed.startsWith("_")) {
    return {
      valid: false,
      error: "Project name cannot start with a dash or underscore",
    };
  }

  if (trimmed.includes("..")) {
    return {
      valid: false,
      error: "Project name cannot contain path traversal sequences",
    };
  }

  if (/[\s]/.test(trimmed)) {
    return { valid: false, error: "Project name cannot contain spaces" };
  }

  if (/[<>:"|?*]/.test(trimmed)) {
    return {
      valid: false,
      error: 'Project name cannot contain special characters: < > : " | ? *',
    };
  }

  if (trimmed.length > 214) {
    return {
      valid: false,
      error: "Project name is too long (max 214 characters)",
    };
  }

  if (RESERVED_NAMES.includes(trimmed.toLowerCase())) {
    return {
      valid: false,
      error: `Project name "${trimmed}" is a reserved name`,
    };
  }

  return { valid: true };
};

export const validateTemplateName = (
  name: string,
): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Template/example name cannot be empty" };
  }

  const trimmed = name.trim();

  if (
    trimmed.includes("..") ||
    trimmed.includes("/") ||
    trimmed.includes("\\")
  ) {
    return {
      valid: false,
      error: "Template/example name cannot contain path traversal sequences",
    };
  }

  if (/[\s<>:"|?*]/.test(trimmed)) {
    return {
      valid: false,
      error: "Template/example name cannot contain special characters",
    };
  }

  return { valid: true };
};
