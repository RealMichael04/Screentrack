import "server-only";
import OpenAI from "openai";

// A small, inexpensive model. Set OPENAI_MODEL to try a different one.
const DEFAULT_MODEL = "gpt-5.4-mini";

let client = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 45_000,
      maxRetries: 1,
    });
  }
  return client;
}

/**
 * Asks the model a question and returns JSON matching `schema`.
 * The schema is enforced by OpenAI, so callers get a predictable shape.
 *
 * @param {object} options
 * @param {string} options.name - Short identifier for the schema, e.g. "search_filters"
 * @param {object} options.schema - JSON Schema (every property required, additionalProperties false)
 * @param {string} options.system - Instructions for the model
 * @param {string} options.user - The user's input, or data to work from
 */
export async function askForJSON({ name, schema, system, user }) {
  const response = await getClient().responses.create({
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    reasoning: { effort: "low" },
    instructions: system,
    input: user,
    text: {
      format: { type: "json_schema", name, schema, strict: true },
    },
  });

  if (response.status === "incomplete") {
    throw new Error(`The AI response was cut off (${response.incomplete_details?.reason || "unknown"}).`);
  }

  const refusal = response.output
    ?.flatMap((item) => item.content ?? [])
    .find((part) => part.type === "refusal");
  if (refusal) {
    throw new Error("The AI declined this request.");
  }

  return JSON.parse(response.output_text);
}
