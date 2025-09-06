import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

/*
  Zod:-

  Think of Zod like a rule-maker for data.
  You tell it: "I want data that looks like this"  
  example:
  const schema = z.object({
    name: z.string(),
    age: z.number()
  });

  That means:
  - name must always be a string (like "Aditya")
  - age must always be a number (like 21)

  If something doesn't follow the rules, Zod will say "this is wrong."
*/

/*
  StructuredOutputParser:-

  AI usually gives messy text -> like:
  "The house is in Tokyo, 10 min walk from station, school 5 km away."

  But you want clean JSON:
  {
    "city": "Tokyo",
    "station_distance": 10,
    "school_distance": 5
  }

  That's where StructuredOutputParser comes in.
  It uses the Zod rules to tell the AI:
  "Hey AI, give me the answer in this format."
*/

const llmApi = async (description) => {
  // prefer explicit server-side key but fall back to VITE_ prefix if you used that in .env.local
  const key = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

  const llm = new ChatGoogleGenerativeAI({
    apiKey: key,
    model: "gemini-1.5-flash",
  });

  /*
    max_price: z
    .number()
    .default(30000000)
    .describe("Maximum price range of the property"),

    OR:-

    const max_price = z
    .number()
    .describe("Maximum price range of the property. If not mentioned, it will be 30000000");
  */
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      min_price: z
        .number()
        .default(1000000)
        .describe("Minimum price range of the property"),
      max_price: z
        .number()
        .default(30000000)
        .describe("Maximum price range of the property"),
      bedrooms: z
        .number()
        .default(1)
        .describe("Number of bedrooms of the property"),
      bathrooms: z
        .number()
        .default(1)
        .describe("Number of bathrooms of the property"),
    })
  );

  /*
    RunnableSequence.from([...]):-

    Think of this like a pipeline (chain of steps).

    - RunnableSequence lets you build a workflow: 
    input -> step1 -> step2 -> step3 -> output.

    - .from([...]) is a static helper method that takes 
    an array of components and links them together 
    into a single runnable chain.

    Sequence:-
    1. PromptTemplate.fromTemplate(...) -> formats your prompt text.
    2. llm -> sends that prompt to Gemini and gets an answer.
    3. parser -> parses Gemini's output into structured JSON (parser).
  */

  /*
    PromptTemplate.fromTemplate:-

    Normally you could just pass a string to the LLM, 
    but PromptTemplate makes it dynamic.

    Example:

    const prompt = PromptTemplate.fromTemplate(
      "Hello {name}, welcome to {place}"
    );

    Later you call:
    prompt.format({ name: "Aditya", place: "Japan" });

    This will give: 
    "Hello Aditya, welcome to Japan".
    

    So here, you're telling it:
    Parse the description provided by user...
    {format_instruction}
    {description}

    At runtime, those placeholders get filled with:
    {description}: your query like "looking for 3 bedroom house…"
    {format_instruction}: special instructions from parser.
  */

  /*
    # {format_instruction} and {description}:-

    {format_instruction} = rules for how to answer (the JSON schema).
    {description} = the actual user's request.

    - If you only gave description, the LLM would answer freely.
    - If you only gave format_instruction, the LLM wouldn't know what to fill in.

    Together, they tell it:
    "Here are the rules. Here is the request. Answer accordingly."
  */
  const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
      "Parse the description provided by user to extract information about the real estate preferences.\n{format_instruction}\n{description}."
    ),
    llm,
    parser,
  ]);

  /*
    chain.invoke vs llm.invoke:-

    If you called llm.invoke(...) directly, you'd just send text 
    to Gemini and get text back.

    By using chain.invoke(...), you're calling the entire pipeline:
    - Format the prompt with PromptTemplate.
    - Send it to Gemini (llm).
    - Parse the response into structured JSON (parser).

    chain.invoke(input) = one-shot execution of the full workflow.

    You could also use chain.stream(...) for streaming outputs, 
    but .invoke() is the simplest.
  */
  /*
    parser.getFormatInstructions() {format_instruction}:-

    This is very important.

    parser.getFormatInstructions() generates text like:
    You must format your response as a JSON object that matches this schema:
    {
      "max_price": number,
      "min_price": number,
      "bedrooms": number,
      "bathrooms": number
    }

    Without this, the LLM might just say:
    "The house has 3 bedrooms and 3 bathrooms with a price range 1-2 million"
    (totally useless for parsing).

    With it, you're forcing the LLM:
    "Answer ONLY in this JSON format so my parser can read it."

    That's why you put {format_instruction} before the {description} → so the LLM knows the rules first, then the data.
  */
  const response = await chain.invoke({
    description: description,
    format_instruction: parser.getFormatInstructions(),
  });

  // debug-friendly log
  console.log(response);

  // Ensure we return a plain JS object with fields (some runtimes nest in .output)
  return response?.output ?? response;
};

export default llmApi;
