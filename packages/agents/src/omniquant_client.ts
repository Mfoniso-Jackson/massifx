import type { Candle, StrategyDecision } from "@massifx/core";

export interface OmniQuantSignalRequest {
  strategyId: string;
  symbol: string;
  portfolioValue: number;
  candles: Candle[];
}

export interface OmniQuantSignalResponse {
  id: string;
  strategyId: string;
  symbol: string;
  side: "BUY" | "SELL" | "HOLD";
  confidence: number;
  rationale?: string;
  createdAt: string;
  decision: StrategyDecision;
  engine?: {
    provider: "omniquant";
    endpoint: string;
    model?: string;
    dataMode?: "provided_candles" | "deterministic_demo";
  };
}

export class OmniQuantClientUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OmniQuantClientUnavailableError";
  }
}

const defaultTimeoutMs = 6_000;

export async function runOmniQuantSignalGeneration(request: OmniQuantSignalRequest): Promise<OmniQuantSignalResponse> {
  const endpoint = privateEndpoint("/v1/signals/generate");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OMNIQUANT_TIMEOUT_MS ?? defaultTimeoutMs));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": createRequestId(),
        ...(process.env.OMNIQUANT_API_KEY ? { authorization: `Bearer ${process.env.OMNIQUANT_API_KEY}` } : {})
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new OmniQuantClientUnavailableError(`OmniQuantAI signal request failed with HTTP ${response.status}.`);
    }

    const result = await response.json() as Omit<OmniQuantSignalResponse, "engine"> & {
      engine?: {
        provider?: "omniquant";
        model?: string;
        dataMode?: "provided_candles" | "deterministic_demo";
      };
    };
    return {
      ...result,
      engine: {
        provider: "omniquant",
        endpoint,
        model: result.engine?.model,
        dataMode: result.engine?.dataMode
      }
    };
  } catch (error) {
    if (error instanceof OmniQuantClientUnavailableError) throw error;
    const message = error instanceof Error ? error.message : "Unknown OmniQuantAI signal client error.";
    throw new OmniQuantClientUnavailableError(message);
  } finally {
    clearTimeout(timeout);
  }
}

function privateEndpoint(path: string): string {
  const baseUrl = process.env.OMNIQUANT_API_URL;
  if (!baseUrl) {
    throw new OmniQuantClientUnavailableError("OMNIQUANT_API_URL is not configured.");
  }

  return new URL(path, baseUrl).toString();
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
