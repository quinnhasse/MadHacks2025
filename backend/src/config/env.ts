/**
 * Environment configuration loader
 * Reads environment variables for API keys and config
 */

export interface Config {
  EXA_API_KEY: string;
  LLM_API_KEY: string;
  PORT: number;
  NODE_ENV: string;
}

export function loadConfig(): Config {
  return {
    EXA_API_KEY: process.env.EXA_API_KEY || '',
    LLM_API_KEY: process.env.LLM_API_KEY || '',
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

// Export singleton config instance
export const config = loadConfig();
