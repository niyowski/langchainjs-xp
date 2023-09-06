import dotenv from "dotenv";

dotenv.config();

const ENV_VARS = ["OPENAI_API_KEY"];

const ensureEnvironmentVariables = () => {
  () => {
    ENV_VARS.forEach((key) => {
      if (!process.env[key]) {
        throw new Error(`Missing environment variable: ${key}.`);
      }
    });
  };
};

ensureEnvironmentVariables();

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
