import { Tiktoken } from "@dqbd/tiktoken/lite";
import { load } from "@dqbd/tiktoken/load";
import models from "@dqbd/tiktoken/model_to_encoding.json";
import registry from "@dqbd/tiktoken/registry.json";

import { Doc } from "../types";

type ModelKey = keyof typeof models;
type RegistryKey = keyof typeof registry;

interface CostCalculatorOptions {
  modelKey: ModelKey;
  ratePerThousandTokens: number;
}

interface CostCalculatorResult {
  tokenCount: number;
  cost: number;
}

const DEFAULT_COST_CALCULATOR_OPTIONS: CostCalculatorOptions = {
  modelKey: "text-embedding-ada-002",
  ratePerThousandTokens: 0.0004,
};

const createEncoder = async (modelKey: ModelKey) => {
  const modelName = models[modelKey] as RegistryKey;
  const model = await load(registry[modelName]);

  return new Tiktoken(model.bpe_ranks, model.special_tokens, model.pat_str);
};

export const calculateCost = async (
  docs: Doc[],
  options: Partial<CostCalculatorOptions> = {},
): Promise<CostCalculatorResult> => {
  const { modelKey, ratePerThousandTokens }: CostCalculatorOptions = {
    ...DEFAULT_COST_CALCULATOR_OPTIONS,
    ...options,
  };

  const encoder = await createEncoder(modelKey);
  const tokens = encoder.encode(JSON.stringify(docs));
  const tokenCount = tokens.length;
  const cost = (tokenCount / 1000) * ratePerThousandTokens;

  encoder.free();

  return {
    tokenCount,
    cost,
  };
};
