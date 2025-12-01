// gemini-2.5-pro
// gemini-2.5-flash
// gemini-2.5-flash-lite
// gemini-2.0-flash
// gemini-2.0-flash-lite

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set. Run: export GEMINI_API_KEY=\"YOUR_KEY\"");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });

  const result = await model.generateContent("Why is the sky blue?");
  console.log(result.response.text());
}

main().catch(console.error);