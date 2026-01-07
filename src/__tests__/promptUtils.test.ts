import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prompt } from "../promptUtils.js";
import readline from "readline";

// Mock readline module
vi.mock("readline", () => ({
  default: {
    createInterface: vi.fn(),
  },
}));

describe("Prompt Utils", () => {
  let mockRl: any;
  let mockQuestion: any;
  let mockClose: any;

  beforeEach(() => {
    // Create mock readline interface
    mockQuestion = vi.fn();
    mockClose = vi.fn();
    const mockOn = vi.fn().mockReturnThis();
    mockRl = {
      question: mockQuestion,
      close: mockClose,
      on: mockOn,
    };

    // Mock createInterface to return our mock readline interface
    vi.mocked(readline.createInterface).mockReturnValue(mockRl);

    // Mock process stdin/stdout .on() methods
    vi.spyOn(process.stdin, "on").mockReturnValue(process.stdin as any);
    vi.spyOn(process.stdout, "on").mockReturnValue(process.stdout as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic functionality", () => {
    it("should create readline interface with correct options", async () => {
      // Setup mock to call callback immediately
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("test answer");
        },
      );

      await prompt("Test question?");

      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout,
      });
    });

    it("should ask the provided question", async () => {
      const testQuestion = "What is your name?";

      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("John");
        },
      );

      await prompt(testQuestion);

      expect(mockQuestion).toHaveBeenCalledWith(
        testQuestion,
        expect.any(Function),
      );
    });

    it("should return user input as string", async () => {
      const expectedAnswer = "John Doe";

      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback(expectedAnswer);
        },
      );

      const result = await prompt("Name?");

      expect(result).toBe(expectedAnswer);
    });

    it("should close readline interface after getting answer", async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("answer");
        },
      );

      await prompt("Question?");

      expect(mockClose).toHaveBeenCalledOnce();
    });
  });

  describe("Input validation and edge cases", () => {
    it("should handle empty input", async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("");
        },
      );

      const result = await prompt("Optional field?");

      expect(result).toBe("");
    });

    it("should handle whitespace-only input", async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("   ");
        },
      );

      const result = await prompt("Enter value:");

      expect(result).toBe("   ");
    });

    it("should handle special characters", async () => {
      const specialInput = "Special chars: éñ中文🚀!@#$%^&*()";

      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback(specialInput);
        },
      );

      const result = await prompt("Special input:");

      expect(result).toBe(specialInput);
    });

    it("should handle multiline input", async () => {
      const multilineInput = "Line 1\nLine 2\nLine 3";

      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback(multilineInput);
        },
      );

      const result = await prompt("Multiline:");

      expect(result).toBe(multilineInput);
    });

    it("should handle very long input", async () => {
      const longInput = "a".repeat(10000);

      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback(longInput);
        },
      );

      const result = await prompt("Long input:");

      expect(result).toBe(longInput);
      expect(result.length).toBe(10000);
    });
  });

  describe("Promise behavior", () => {
    it("should return a Promise", () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("answer");
        },
      );

      const result = prompt("Test?");

      expect(result).toBeInstanceOf(Promise);
    });

    it("should resolve promise with user input", async () => {
      const testAnswer = "test response";

      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback(testAnswer);
        },
      );

      await expect(prompt("Test?")).resolves.toBe(testAnswer);
    });

    it("should handle concurrent prompts", async () => {
      let callback1: ((answer: string) => void) | undefined;
      let callback2: ((answer: string) => void) | undefined;

      mockQuestion
        .mockImplementationOnce(
          (question: string, callback: (answer: string) => void) => {
            callback1 = callback;
          },
        )
        .mockImplementationOnce(
          (question: string, callback: (answer: string) => void) => {
            callback2 = callback;
          },
        );

      const promise1 = prompt("Question 1?");
      const promise2 = prompt("Question 2?");

      // Simulate answers in reverse order
      callback2?.("Answer 2");
      callback1?.("Answer 1");

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe("Answer 1");
      expect(result2).toBe("Answer 2");
    });

    it("should handle delayed responses", async () => {
      let delayedCallback: ((answer: string) => void) | undefined;

      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          delayedCallback = callback;
        },
      );

      const promptPromise = prompt("Delayed question?");

      // Simulate delay before answering
      setTimeout(() => {
        delayedCallback?.("Delayed answer");
      }, 10);

      const result = await promptPromise;
      expect(result).toBe("Delayed answer");
    });
  });

  describe("Readline interface management", () => {
    it("should create new interface for each prompt", async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("answer");
        },
      );

      await prompt("First prompt");
      await prompt("Second prompt");

      expect(readline.createInterface).toHaveBeenCalledTimes(2);
    });

    it("should close interface even with empty questions", async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("answer");
        },
      );

      await prompt("");

      expect(mockClose).toHaveBeenCalledOnce();
    });

    it("should pass correct parameters to readline.createInterface", async () => {
      mockQuestion.mockImplementation(
        (question: string, callback: (answer: string) => void) => {
          callback("answer");
        },
      );

      await prompt("Test question");

      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout,
      });
    });
  });
});
