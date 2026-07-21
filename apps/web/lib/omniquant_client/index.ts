import type { BacktestResult, Candle } from "@massifx/core";

export interface OmniQuantBacktestRequest {
  symbol: string;
  strategyId: string;
  initialBalance: number;
  candles: Candle[];
}

export interface OmniQuantBacktestResponse extends BacktestResult {
  engine?: {
    provider: "omniquant";
    endpoint: string;
  };
}

export class OmniQuantClientUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OmniQuantClientUnavailableError";
  }
}

const defaultTimeoutMs = 6_000;

export async function runOmniQuantBacktest(request: OmniQuantBacktestRequest): Promise<OmniQuantBacktestResponse> {
  const baseUrl = process.env.OMNIQUANT_API_URL;
  if (!baseUrl) {
    throw new OmniQuantClientUnavailableError("OMNIQUANT_API_URL is not configured.");
  }

  const endpoint = new URL("/v1/backtests", baseUrl).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OMNIQUANT_TIMEOUT_MS ?? defaultTimeoutMs));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.OMNIQUANT_API_KEY ? { authorization: `Bearer ${process.env.OMNIQUANT_API_KEY}` } : {})
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new OmniQuantClientUnavailableError(`OmniQuantAI backtest request failed with HTTP ${response.status}.`);
    }

    const result = await response.json() as BacktestResult;
    return {
      ...result,
      engine: {
        provider: "omniquant",
        endpoint
      }
    };
  } catch (error) {
    if (error instanceof OmniQuantClientUnavailableError) throw error;
    const message = error instanceof Error ? error.message : "Unknown OmniQuantAI client error.";
    throw new OmniQuantClientUnavailableError(message);
  } finally {
    clearTimeout(timeout);
  }
}
