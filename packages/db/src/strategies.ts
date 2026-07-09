import { Prisma } from "@prisma/client";
import { builtInStrategyPlugins } from "@massifx/sdk";
import type { StrategyPluginManifest } from "@massifx/sdk";
import { prisma, type DbClient } from "./index";

export type StrategyCatalogStatus = "approved" | "pending_review" | "disabled";
export type StrategyCatalogSource = "built_in" | "community" | "private";

export async function seedBuiltInStrategies(client: DbClient = prisma) {
  for (const plugin of builtInStrategyPlugins) {
    await upsertStrategyCatalogEntry({
      manifest: plugin.manifest,
      source: "built_in",
      status: "approved",
      client
    });
  }
}

export async function upsertStrategyCatalogEntry(params: {
  manifest: StrategyPluginManifest;
  source: StrategyCatalogSource;
  status: StrategyCatalogStatus;
  client?: DbClient;
}) {
  const client = params.client ?? prisma;
  const { manifest } = params;
  return client.strategyCatalogEntry.upsert({
    where: { id: manifest.id },
    update: {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      riskDisclosure: manifest.riskDisclosure,
      tags: manifest.tags,
      parameters: manifest.parameters as unknown as Prisma.InputJsonValue,
      source: params.source,
      status: params.status
    },
    create: {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      riskDisclosure: manifest.riskDisclosure,
      tags: manifest.tags,
      parameters: manifest.parameters as unknown as Prisma.InputJsonValue,
      source: params.source,
      status: params.status
    }
  });
}

export async function getStrategyMarketplace(params: {
  portfolioId: string;
  client?: DbClient;
}) {
  const client = params.client ?? prisma;
  const [strategies, activations] = await Promise.all([
    client.strategyCatalogEntry.findMany({ orderBy: [{ source: "asc" }, { name: "asc" }] }),
    client.portfolioStrategy.findMany({ where: { portfolioId: params.portfolioId } })
  ]);
  const activationsByStrategyId = new Map(activations.map((activation) => [activation.strategyId, activation]));
  return strategies.map((strategy) => ({
    ...strategy,
    activation: activationsByStrategyId.get(strategy.id) ?? null
  }));
}

export async function setPortfolioStrategyEnabled(params: {
  portfolioId: string;
  strategyId: string;
  enabled: boolean;
  parameters?: Prisma.InputJsonValue;
  client?: DbClient;
}) {
  const client = params.client ?? prisma;
  return client.portfolioStrategy.upsert({
    where: {
      portfolioId_strategyId: {
        portfolioId: params.portfolioId,
        strategyId: params.strategyId
      }
    },
    update: {
      enabled: params.enabled,
      parameters: params.parameters ?? {}
    },
    create: {
      portfolioId: params.portfolioId,
      strategyId: params.strategyId,
      enabled: params.enabled,
      parameters: params.parameters ?? {}
    }
  });
}
