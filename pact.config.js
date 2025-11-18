/**
 * Pact Configuration
 * 
 * Configuration for Pact contract testing
 */

module.exports = {
  consumer: 'Pinaka Web App',
  provider: 'Pinaka API',
  pactDir: './pacts',
  logDir: './logs',
  logLevel: 'INFO',
  spec: 2,
  cors: false,
  pactfileWriteMode: 'update',
  dir: './pacts',
  log: './logs/pact.log',
};

