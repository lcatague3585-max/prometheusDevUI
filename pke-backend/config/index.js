/**
 * Configuration Index
 * Central configuration export
 */

const { connectDB, disconnectDB } = require('./database');
const { getConfig, LLM_PROVIDERS, MODEL_CONFIGS } = require('./llm');

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // File paths
  templatesDir: process.env.TEMPLATES_DIR || './templates',
  outputsDir: process.env.OUTPUTS_DIR || './outputs',
};

module.exports = {
  config,
  connectDB,
  disconnectDB,
  getConfig,
  LLM_PROVIDERS,
  MODEL_CONFIGS,
};
