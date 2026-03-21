import { Anthropic } from "@anthropic-ai/sdk";
import readline from "readline";

// Replace with your actual Claude API key
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "YOUR_API_KEY_HERE",
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Claude AI Initialized. Type your message (or 'exit' to quit).");

function ask() {
    rl.question("You: ", async (userInput) => {
        if (userInput.toLowerCase() === 'exit') {
            process.exit(0);
        }

        try {
            const response = await anthropic.messages.create({
                model: "claude-3-opus-20240229", // Or claude-3-sonnet-20240229, claude-3-haiku-20240307
                max_tokens: 1024,
                messages: [{ role: "user", content: userInput }],
            });

            console.log(`Claude: ${response.content[0].text}`);
        } catch (error) {
            console.error("Error communicating with Claude:", error.message);
        }
        ask();
    });
}

ask();
