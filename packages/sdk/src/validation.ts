import type { PluginValidationIssue, StrategyParameterDefinition, StrategyPlugin } from "./types";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const semverPattern = /^\d+\.\d+\.\d+$/;

export function validateStrategyPlugin(plugin: StrategyPlugin): PluginValidationIssue[] {
  const issues: PluginValidationIssue[] = [];
  const { manifest } = plugin;

  if (!manifest.id || !idPattern.test(manifest.id)) issues.push({ field: "manifest.id", message: "Use a kebab-case stable id." });
  if (!manifest.name) issues.push({ field: "manifest.name", message: "Strategy name is required." });
  if (!semverPattern.test(manifest.version)) issues.push({ field: "manifest.version", message: "Use semantic versioning, for example 1.0.0." });
  if (!manifest.description || manifest.description.length < 12) issues.push({ field: "manifest.description", message: "Description should explain what the strategy does." });
  if (!manifest.author) issues.push({ field: "manifest.author", message: "Author is required for auditability." });
  if (!manifest.riskDisclosure || manifest.riskDisclosure.length < 20) issues.push({ field: "manifest.riskDisclosure", message: "Risk disclosure is required." });
  if (!Array.isArray(manifest.tags)) issues.push({ field: "manifest.tags", message: "Tags must be an array." });
  if (!Array.isArray(manifest.parameters)) issues.push({ field: "manifest.parameters", message: "Parameters must be an array." });
  else manifest.parameters.flatMap(validateParameter).forEach((issue) => issues.push(issue));
  if (typeof plugin.evaluate !== "function") issues.push({ field: "evaluate", message: "Strategy plugin must expose an evaluate function." });

  return issues;
}

export function assertValidStrategyPlugin(plugin: StrategyPlugin) {
  const issues = validateStrategyPlugin(plugin);
  if (issues.length > 0) {
    throw new Error(`Invalid strategy plugin ${plugin.manifest?.id ?? "unknown"}: ${issues.map((issue) => `${issue.field} ${issue.message}`).join("; ")}`);
  }
}

function validateParameter(parameter: StrategyParameterDefinition): PluginValidationIssue[] {
  const issues: PluginValidationIssue[] = [];
  if (!parameter.key || !idPattern.test(parameter.key)) issues.push({ field: `parameters.${parameter.key || "unknown"}`, message: "Parameter key must be kebab-case." });
  if (!parameter.label) issues.push({ field: `parameters.${parameter.key}.label`, message: "Parameter label is required." });
  if (parameter.type === "select" && (!parameter.options || parameter.options.length === 0)) {
    issues.push({ field: `parameters.${parameter.key}.options`, message: "Select parameters require options." });
  }
  if (parameter.min !== undefined && parameter.max !== undefined && parameter.min > parameter.max) {
    issues.push({ field: `parameters.${parameter.key}`, message: "Minimum cannot be greater than maximum." });
  }
  return issues;
}
