import { generateDemoCandles } from "@massifx/core";
import type { Candle } from "@massifx/core";

export interface MarketDataProvider {
  getCandles(symbol: string, interval: string, limit: number): Promise<Candle[]>;
}

export class BinancePublicDataProvider implements MarketDataProvider {
  constructor(private readonly baseUrl = process.env.BINANCE_BASE_URL ?? "https://api.binance.com") {}

  async getCandles(symbol: string, interval = "1h", limit = 180): Promise<Candle[]> {
    const url = new URL("/api/v3/klines", this.baseUrl);
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("limit", String(limit));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Binance request failed: ${response.status}`);
    const rows = await response.json() as Array<[number, string, string, string, string, string]>;
    return rows.map((row) => ({
      timestamp: row[0],
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5])
    }));
  }
}

export class DemoMarketDataProvider implements MarketDataProvider {
  async getCandles(_symbol = "BTCUSDT", _interval = "1h", limit = 180): Promise<Candle[]> {
    return generateDemoCandles(limit);
  }
}
