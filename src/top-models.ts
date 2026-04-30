import topModelsJson from "./top-models.json";

function loadTopModels(): string[] {
  const parsed = topModelsJson as unknown;
  if (
    !Array.isArray(parsed) ||
    parsed.some((value) => typeof value !== "string" || !value.trim())
  ) {
    throw new Error("top-models.json must be a JSON array of non-empty strings");
  }

  return [...parsed];
}

export const TOP_MODELS = Object.freeze(loadTopModels());
