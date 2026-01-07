import readline from "readline";

const prompt = async (question: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on("error", (error) => {
      rl.close();
      reject(new Error(`Readline error: ${error.message}`));
    });

    process.stdin.on("error", (error) => {
      rl.close();
      reject(new Error(`stdin error: ${error.message}`));
    });

    process.stdout.on("error", (error) => {
      rl.close();
      reject(new Error(`stdout error: ${error.message}`));
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

export { prompt };
