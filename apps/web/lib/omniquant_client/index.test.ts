import { afterEach, describe, expect, it, vi } from "vitest";
import { OmniQuantClientUnavailableError, runOmniQuantBacktest, runOmniQuantExecutePaperOrder, runOmniQuantPrepareOrder, runOmniQuantRiskEvaluation, runOmniQuantSignalGeneration } from "./index";

const originalApiUrl = process.env.OMNIQUANT_API_URL;
const originalApiKey = process.env.OMNIQUANT_API_KEY;
const originalTimeout = process.env.OMNIQUANT_TIMEOUT_MS;

describe("MassifX OmniQuantAI client boundary", () => {
  afterEach(() => {
    restoreEnv("OMNIQUANT_API_URL", originalApiUrl);
    restoreEnv("OMNIQUANT_API_KEY", originalApiKey);
    restoreEnv("OMNIQUANT_TIMEOUT_MS", originalTimeout);
    vi.restoreAllMocks();
  });

  it("posts backtests through OmniQuantAI instead of local core logic", async () => {
    process.env.OMNIQUANT_API_URL = "https://omniquant.internal";
    process.env.OMNIQUANT_API_KEY = "secret";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      id: "bt_moving-average-trend_BTCUSDT_1_2",
      strategyId: "moving-average-trend",
      symbol: "BTCUSDT",
      totalReturn: 0.12,
      maxDrawdown: 0.04,
      sharpeRatio: 1.3,
      winRate: 0.5,
      trades: [],
      equityCurve: [],
      engine: {
        provider: "omniquant",
        model: "deterministic-trend-following-v1",
        dataMode: "provided_candles"
      }
    }));

    const result = await runOmniQuantBacktest({
      symbol: "BTCUSDT",
      strategyId: "moving-average-trend",
      initialBalance: 100000,
      candles: []
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://omniquant.internal/v1/backtests");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      "content-type": "application/json",
      authorization: "Bearer secret"
    });
    expect(String(init?.body)).toContain("\"strategyId\":\"moving-average-trend\"");
    expect(result.engine).toMatchObject({
      provider: "omniquant",
      endpoint: "https://omniquant.internal/v1/backtests"
    });
  });

  it("raises a typed error so the route can fall back locally when OmniQuantAI is unavailable", async () => {
    process.env.OMNIQUANT_API_URL = "https://omniquant.internal";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      error: {
        code: "not_implemented"
      }
    }, 501));

    await expect(runOmniQuantBacktest({
      symbol: "BTCUSDT",
      strategyId: "moving-average-trend",
      initialBalance: 100000,
      candles: []
    })).rejects.toBeInstanceOf(OmniQuantClientUnavailableError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("posts risk evaluations through OmniQuantAI", async () => {
    process.env.OMNIQUANT_API_URL = "https://omniquant.internal";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      id: "risk_demo_BTCUSDT_1",
      approved: true,
      reasons: [],
      cappedPositionSize: 5000,
      maxPositionSize: 25000,
      maxLeverage: 2,
      killSwitchActive: false,
      staleMarketData: false,
      engine: {
        provider: "omniquant",
        model: "deterministic-risk-controls-v1",
        evaluatedAt: "2026-01-01T00:00:00.000Z"
      }
    }));

    const result = await runOmniQuantRiskEvaluation({
      portfolioId: "demo-paper",
      symbol: "BTCUSDT",
      side: "buy",
      notional: 5000,
      leverage: 1,
      stopLoss: 0.03,
      marketDataTimestamp: "2026-01-01T00:00:00.000Z",
      decision: {
        strategy: "Trend Following",
        signal: "buy",
        confidence: 0.7,
        riskScore: 0.25,
        suggestedPositionSize: 5000,
        stopLossPct: 0.03,
        explanation: "test"
      },
      state: {
        portfolioValue: 100000,
        dailyPnlPct: -0.004,
        openPositions: 1,
        volatilityScore: 0.25
      }
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://omniquant.internal/v1/risk/evaluate");
    expect(init?.method).toBe("POST");
    expect(String(init?.body)).toContain("\"portfolioId\":\"demo-paper\"");
    expect(result).toMatchObject({
      approved: true,
      engine: {
        provider: "omniquant",
        endpoint: "https://omniquant.internal/v1/risk/evaluate"
      }
    });
  });

  it("posts signal generation through OmniQuantAI", async () => {
    process.env.OMNIQUANT_API_URL = "https://omniquant.internal";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      id: "sig_moving-average-trend_BTCUSDT_1",
      strategyId: "moving-average-trend",
      symbol: "BTCUSDT",
      side: "BUY",
      confidence: 0.64,
      rationale: "Fast average is above the slow average.",
      createdAt: "2026-01-01T00:00:00.000Z",
      decision: {
        strategy: "Trend Following",
        signal: "buy",
        confidence: 0.64,
        riskScore: 0.2,
        suggestedPositionSize: 5000,
        stopLossPct: 0.035,
        explanation: "Fast average is above the slow average."
      },
      engine: {
        provider: "omniquant",
        model: "deterministic-signal-engine-v1",
        dataMode: "provided_candles"
      }
    }));

    const result = await runOmniQuantSignalGeneration({
      strategyId: "moving-average-trend",
      symbol: "BTCUSDT",
      portfolioValue: 100000,
      candles: []
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://omniquant.internal/v1/signals/generate");
    expect(init?.method).toBe("POST");
    expect(String(init?.body)).toContain("\"strategyId\":\"moving-average-trend\"");
    expect(result).toMatchObject({
      side: "BUY",
      engine: {
        provider: "omniquant",
        endpoint: "https://omniquant.internal/v1/signals/generate"
      }
    });
  });

  it("posts paper order preparation through OmniQuantAI", async () => {
    process.env.OMNIQUANT_API_URL = "https://omniquant.internal";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      id: "ord_demo-paper_BTCUSDT_1",
      portfolioId: "demo-paper",
      signalId: "sig_1",
      riskApprovalId: "risk_1",
      symbol: "BTCUSDT",
      side: "buy",
      type: "market",
      quantity: 0.25,
      notional: 17500,
      status: "prepared",
      reasons: [],
      mode: "paper",
      createdAt: "2026-01-01T00:00:00.000Z",
      engine: {
        provider: "omniquant",
        model: "deterministic-paper-order-prep-v1"
      }
    }));

    const result = await runOmniQuantPrepareOrder({
      portfolioId: "demo-paper",
      signalId: "sig_1",
      riskApprovalId: "risk_1",
      symbol: "BTCUSDT",
      side: "buy",
      type: "market",
      quantity: 0.25,
      price: 70000,
      riskApproved: true,
      mode: "paper"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://omniquant.internal/v1/orders/prepare");
    expect(init?.method).toBe("POST");
    expect(String(init?.body)).toContain("\"riskApproved\":true");
    expect(result).toMatchObject({
      status: "prepared",
      engine: {
        provider: "omniquant",
        endpoint: "https://omniquant.internal/v1/orders/prepare"
      }
    });
  });

  it("posts paper order execution through OmniQuantAI", async () => {
    process.env.OMNIQUANT_API_URL = "https://omniquant.internal";
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      id: "exec_ord_demo-paper_BTCUSDT_1",
      orderId: "ord_demo-paper_BTCUSDT_1",
      mode: "paper",
      status: "filled",
      filledQuantity: 0.25,
      averagePrice: 70000,
      message: "Paper order executed.",
      reasons: [],
      account: {
        balance: 32500,
        openPositions: [],
        trades: []
      },
      createdAt: "2026-01-01T00:00:00.000Z",
      engine: {
        provider: "omniquant",
        model: "deterministic-paper-execution-v1"
      }
    }));

    const result = await runOmniQuantExecutePaperOrder({
      orderId: "ord_demo-paper_BTCUSDT_1",
      mode: "paper",
      account: {
        balance: 50000,
        openPositions: [],
        trades: []
      },
      preparedOrder: {
        id: "ord_demo-paper_BTCUSDT_1",
        portfolioId: "demo-paper",
        symbol: "BTCUSDT",
        side: "buy",
        type: "market",
        quantity: 0.25,
        status: "prepared",
        reasons: []
      },
      price: 70000,
      strategy: "Trend Following"
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://omniquant.internal/v1/orders/execute");
    expect(init?.method).toBe("POST");
    expect(String(init?.body)).toContain("\"mode\":\"paper\"");
    expect(result).toMatchObject({
      status: "filled",
      engine: {
        provider: "omniquant",
        endpoint: "https://omniquant.internal/v1/orders/execute"
      }
    });
  });

  it("raises a typed error when OmniQuantAI risk is unavailable", async () => {
    process.env.OMNIQUANT_API_URL = "https://omniquant.internal";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({
      error: {
        code: "not_implemented"
      }
    }, 501));

    await expect(runOmniQuantRiskEvaluation({
      symbol: "BTCUSDT",
      decision: {
        strategy: "Trend Following",
        signal: "buy",
        confidence: 0.7,
        riskScore: 0.25,
        suggestedPositionSize: 5000,
        stopLossPct: 0.03,
        explanation: "test"
      },
      state: {
        portfolioValue: 100000,
        dailyPnlPct: -0.004,
        openPositions: 1,
        volatilityScore: 0.25
      }
    })).rejects.toBeInstanceOf(OmniQuantClientUnavailableError);
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
