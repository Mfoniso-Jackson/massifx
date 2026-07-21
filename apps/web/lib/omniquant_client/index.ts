import type { BacktestResult, Candle } from "@massifx/core";
import type { RiskResult, RiskState, StrategyDecision } from "@massifx/core";

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

export interface OmniQuantRiskRequest {
  portfolioId?: string;
  symbol: string;
  side?: "buy" | "sell";
  notional?: number;
  leverage?: number;
  stopLoss?: number;
  marketDataTimestamp?: string;
  killSwitchActive?: boolean;
  decision: StrategyDecision;
  state: RiskState;
}

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

export interface OmniQuantPrepareOrderRequest {
  portfolioId?: string;
  signalId?: string;
  riskApprovalId?: string;
  symbol: string;
  side: "buy" | "sell" | "hold";
  type?: "market" | "limit";
  quantity: number;
  price?: number;
  limitPrice?: number;
  maxQuantity?: number;
  riskApproved: boolean;
  riskReasons?: string[];
  mode?: "paper";
}

export interface OmniQuantPreparedOrderResponse {
  id: string;
  portfolioId: string;
  signalId?: string;
  riskApprovalId?: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  quantity: number;
  limitPrice?: number;
  notional?: number;
  status: "prepared" | "rejected";
  reasons: string[];
  mode?: "paper";
  createdAt?: string;
  engine?: {
    provider: "omniquant";
    endpoint: string;
    model?: string;
  };
}

export interface OmniQuantPaperTrade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  openedAt: number;
  strategy?: string;
}

export interface OmniQuantPaperAccount {
  balance: number;
  openPositions: OmniQuantPaperTrade[];
  trades: OmniQuantPaperTrade[];
}

export interface OmniQuantExecutePaperOrderRequest {
  orderId?: string;
  mode: "paper";
  account: OmniQuantPaperAccount;
  preparedOrder: OmniQuantPreparedOrderResponse;
  price: number;
  strategy?: string;
}

export interface OmniQuantExecutionResponse {
  id: string;
  orderId: string;
  mode: "paper";
  status: "filled" | "rejected";
  filledQuantity?: number;
  averagePrice?: number;
  message: string;
  reasons: string[];
  account: OmniQuantPaperAccount;
  createdAt: string;
  engine?: {
    provider: "omniquant";
    endpoint: string;
    model?: string;
  };
}

export interface OmniQuantRiskResponse extends RiskResult {
  id?: string;
  maxPositionSize?: number;
  maxLeverage?: number;
  killSwitchActive?: boolean;
  staleMarketData?: boolean;
  checks?: Record<string, boolean>;
  engine?: {
    provider: "omniquant";
    endpoint: string;
    model?: string;
    evaluatedAt?: string;
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

export async function runOmniQuantRiskEvaluation(request: OmniQuantRiskRequest): Promise<OmniQuantRiskResponse> {
  const endpoint = privateEndpoint("/v1/risk/evaluate");
  const response = await postJson(endpoint, request);
  const result = await response.json() as RiskResult & {
    id?: string;
    maxPositionSize?: number;
    maxLeverage?: number;
    killSwitchActive?: boolean;
    staleMarketData?: boolean;
    checks?: Record<string, boolean>;
    engine?: {
      provider?: "omniquant";
      model?: string;
      evaluatedAt?: string;
    };
  };
  return {
    ...result,
    engine: {
      provider: "omniquant",
      endpoint,
      model: result.engine?.model,
      evaluatedAt: result.engine?.evaluatedAt
    }
  };
}

export async function runOmniQuantSignalGeneration(request: OmniQuantSignalRequest): Promise<OmniQuantSignalResponse> {
  const endpoint = privateEndpoint("/v1/signals/generate");
  const response = await postJson(endpoint, request);
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
}

export async function runOmniQuantPrepareOrder(request: OmniQuantPrepareOrderRequest): Promise<OmniQuantPreparedOrderResponse> {
  const endpoint = privateEndpoint("/v1/orders/prepare");
  const response = await postJson(endpoint, request);
  const result = await response.json() as Omit<OmniQuantPreparedOrderResponse, "engine"> & {
    engine?: {
      provider?: "omniquant";
      model?: string;
    };
  };
  return {
    ...result,
    engine: {
      provider: "omniquant",
      endpoint,
      model: result.engine?.model
    }
  };
}

export async function runOmniQuantExecutePaperOrder(request: OmniQuantExecutePaperOrderRequest): Promise<OmniQuantExecutionResponse> {
  if (request.mode !== "paper") {
    throw new OmniQuantClientUnavailableError("Only paper execution is supported.");
  }
  const endpoint = privateEndpoint("/v1/orders/execute");
  const response = await postJson(endpoint, request);
  const result = await response.json() as Omit<OmniQuantExecutionResponse, "engine"> & {
    engine?: {
      provider?: "omniquant";
      model?: string;
    };
  };
  return {
    ...result,
    engine: {
      provider: "omniquant",
      endpoint,
      model: result.engine?.model
    }
  };
}

function privateEndpoint(path: string): string {
  const baseUrl = process.env.OMNIQUANT_API_URL;
  if (!baseUrl) {
    throw new OmniQuantClientUnavailableError("OMNIQUANT_API_URL is not configured.");
  }

  return new URL(path, baseUrl).toString();
}

async function postJson(endpoint: string, request: unknown): Promise<Response> {
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
      throw new OmniQuantClientUnavailableError(`OmniQuantAI request failed with HTTP ${response.status}.`);
    }

    return response;
  } catch (error) {
    if (error instanceof OmniQuantClientUnavailableError) throw error;
    const message = error instanceof Error ? error.message : "Unknown OmniQuantAI client error.";
    throw new OmniQuantClientUnavailableError(message);
  } finally {
    clearTimeout(timeout);
  }
}
