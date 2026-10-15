import { ENV } from "./env";
import { scrubSovereignOutput } from "../utils/sanitize";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

export interface ProviderCandidate {
  name: string;
  url: string;
  apiKey: string;
  model: string;
}

export function getProviderCandidates(): ProviderCandidate[] {
  const candidates: ProviderCandidate[] = [];

  // 1. Google Gemini (Primary high-speed, non-exhausted sovereign engine)
  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (geminiKey) {
    candidates.push({
      name: "gemini",
      url: process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      apiKey: geminiKey,
      model: process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    });
  }

  // 2. DeepSeek (Secondary reasoning & Arabic legal drafting)
  const deepseekKey = process.env.DEEPSEEK_API_KEY || "";
  if (deepseekKey) {
    candidates.push({
      name: "deepseek",
      url: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions",
      apiKey: deepseekKey,
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    });
  }

  // 3. Perplexity (Tertiary statutory search & citation validation)
  const pplxKey = process.env.PERPLEXITY_API_KEY || "";
  if (pplxKey) {
    candidates.push({
      name: "perplexity",
      url: process.env.PERPLEXITY_API_URL || "https://api.perplexity.ai/chat/completions",
      apiKey: pplxKey,
      model: process.env.PERPLEXITY_MODEL || "sonar",
    });
  }

  // Optional: Pin primary provider via LLM_PRIMARY_PROVIDER env
  const pinned = process.env.LLM_PRIMARY_PROVIDER?.toLowerCase();
  if (pinned) {
    const idx = candidates.findIndex(c => c.name.toLowerCase() === pinned);
    if (idx > 0) {
      const [fav] = candidates.splice(idx, 1);
      candidates.unshift(fav);
    }
  }

  return candidates;
}

const resolveApiUrl = () => {
  const candidates = getProviderCandidates();
  return candidates[0]?.url || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
};

const resolveApiKey = () => {
  const candidates = getProviderCandidates();
  return candidates[0]?.apiKey || "";
};

const assertApiKey = () => {
  const candidates = getProviderCandidates();
  if (!candidates.length) {
    throw new Error("No LLM API keys are configured (checked Gemini, DeepSeek, Perplexity)");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

export type StreamChunk = {
  id: string;
  choices: Array<{
    index: number;
    delta: {
      role?: Role;
      content?: string;
    };
    finish_reason: string | null;
  }>;
};

export async function* invokeLLMStream(params: InvokeParams): AsyncGenerator<StreamChunk> {
  const candidates = getProviderCandidates();
  if (!candidates.length) {
    throw new Error("No LLM API keys are configured (checked Gemini, DeepSeek, Perplexity)");
  }

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      const payload: Record<string, unknown> = {
        model: candidate.model,
        messages: messages.map(normalizeMessage),
        stream: true,
        max_tokens: params.maxTokens || params.max_tokens || 4096,
      };

      if (tools && tools.length > 0) {
        payload.tools = tools;
      }
      if (normalizedToolChoice) {
        payload.tool_choice = normalizedToolChoice;
      }
      if (normalizedResponseFormat) {
        payload.response_format = normalizedResponseFormat;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Number(process.env.LLM_TIMEOUT_MS) || 20000);

      const response = await fetch(candidate.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${candidate.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[LLM Stream Cascade] ${candidate.name} (${candidate.model}) returned ${response.status}: ${errorText.substring(0, 150)}`);
        lastError = new Error(`LLM stream ${candidate.name} failed: ${response.status} – ${errorText.substring(0, 150)}`);
        continue;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        lastError = new Error(`No response body for streaming from ${candidate.name}`);
        continue;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (trimmed.startsWith("data: ")) {
            try {
              const chunk = JSON.parse(trimmed.slice(6)) as StreamChunk;
              yield chunk;
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Stream successfully completed
      return;
    } catch (err: any) {
      console.warn(`[LLM Stream Cascade] ${candidate.name} failed:`, err?.message || err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("All LLM stream candidates failed");
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const candidates = getProviderCandidates();
  if (!candidates.length) {
    throw new Error("No LLM API keys are configured (checked Gemini, DeepSeek, Perplexity)");
  }

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  let lastError: Error | null = null;

  for (const candidate of candidates) {
    try {
      const payload: Record<string, unknown> = {
        model: candidate.model,
        messages: messages.map(normalizeMessage),
        max_tokens: params.maxTokens || params.max_tokens || 4096,
      };

      if (tools && tools.length > 0) {
        payload.tools = tools;
      }
      if (normalizedToolChoice) {
        payload.tool_choice = normalizedToolChoice;
      }
      if (normalizedResponseFormat) {
        payload.response_format = normalizedResponseFormat;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Number(process.env.LLM_TIMEOUT_MS) || 20000);

      const response = await fetch(candidate.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${candidate.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[LLM Cascade] ${candidate.name} (${candidate.model}) returned ${response.status}: ${errorText.substring(0, 150)}`);
        lastError = new Error(`LLM ${candidate.name} failed: ${response.status} – ${errorText.substring(0, 150)}`);
        continue;
      }

      const result = (await response.json()) as InvokeResult;
      if (result?.choices) {
        for (const choice of result.choices) {
          if (typeof choice.message?.content === "string") {
            choice.message.content = scrubSovereignOutput(choice.message.content);
          }
        }
      }
      return result;
    } catch (err: any) {
      console.warn(`[LLM Cascade] ${candidate.name} attempt failed:`, err?.message || err);
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error("All LLM cascade candidates failed");
}
