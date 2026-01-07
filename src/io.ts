import chalk from "chalk";

type LogLevel = "verbose" | "normal" | "quiet";

class Logger {
  private level: LogLevel = "normal";

  setVerbose(enabled: boolean): void {
    this.level = enabled ? "verbose" : "normal";
  }

  setQuiet(enabled: boolean): void {
    this.level = enabled ? "quiet" : "normal";
  }

  red(message: string): void {
    if (this.level !== "quiet") {
      console.log(chalk.red(message));
    }
  }

  green(message: string): void {
    if (this.level !== "quiet") {
      console.log(chalk.green(message));
    }
  }

  yellow(message: string): void {
    if (this.level !== "quiet") {
      console.log(chalk.yellow(message));
    }
  }

  blue(message: string): void {
    if (this.level === "verbose") {
      console.log(chalk.blue(message));
    }
  }

  gray(message: string): void {
    if (this.level === "verbose") {
      console.log(chalk.gray(message));
    }
  }

  logTitle(message: string): void {
    if (this.level !== "quiet") {
      console.log(chalk.blue(message));
    }
  }

  logError(message: string, error?: Error): void {
    console.error(chalk.red(message), error ? error.message : "");
  }
}

const logger = new Logger();

export { logger };
