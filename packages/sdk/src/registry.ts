import type { StrategyExecutionContext, StrategyPlugin, StrategyRegistryEntry } from "./types";
import { assertValidStrategyPlugin } from "./validation";

export class StrategyPluginRegistry {
  private readonly plugins = new Map<string, StrategyPlugin>();

  register(plugin: StrategyPlugin) {
    assertValidStrategyPlugin(plugin);
    if (this.plugins.has(plugin.manifest.id)) {
      throw new Error(`Strategy plugin ${plugin.manifest.id} is already registered.`);
    }
    this.plugins.set(plugin.manifest.id, plugin);
    return this;
  }

  registerMany(plugins: StrategyPlugin[]) {
    plugins.forEach((plugin) => this.register(plugin));
    return this;
  }

  get(id: string) {
    return this.plugins.get(id);
  }

  require(id: string) {
    const plugin = this.get(id);
    if (!plugin) throw new Error(`Strategy plugin ${id} is not registered.`);
    return plugin;
  }

  list(): StrategyRegistryEntry[] {
    return [...this.plugins.values()].map((plugin) => ({ manifest: plugin.manifest, plugin }));
  }

  async evaluate(id: string, context: StrategyExecutionContext) {
    return this.require(id).evaluate(context);
  }
}
