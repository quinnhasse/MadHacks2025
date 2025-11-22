/**
 * Test harness for researchAgent
 *
 * This script tests the researchAgent function directly with sample questions
 * to verify Exa integration is working correctly.
 *
 * Usage:
 *   npm run test:research
 *
 * Or directly with tsx:
 *   npx tsx scripts/test-research-agent.ts
 */

import { researchAgent } from '../src/services/researchAgent';
import { config } from '../src/config/env';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m'
};

/**
 * Test questions to validate researchAgent
 */
const testQuestions = [
  'What is Transparens AI?',
  'How does retrieval-augmented generation work?',
  'What are the benefits of AI transparency?'
];

/**
 * Formats and displays source information
 */
function displaySource(source: any, index: number) {
  console.log(`\n  ${colors.bright}[${index + 1}] ${source.title}${colors.reset}`);
  console.log(`      ${colors.blue}ID:${colors.reset} ${source.id}`);
  console.log(`      ${colors.blue}URL:${colors.reset} ${source.url}`);
  console.log(`      ${colors.blue}Score:${colors.reset} ${source.score?.toFixed(3) || 'N/A'}`);
  console.log(`      ${colors.blue}Snippet:${colors.reset} ${source.snippet.substring(0, 150)}${source.snippet.length > 150 ? '...' : ''}`);

  if (source.full_text) {
    const textPreview = source.full_text.substring(0, 200);
    console.log(`      ${colors.blue}Text:${colors.reset} ${textPreview}${source.full_text.length > 200 ? '...' : ''}`);
  }

  if (source.metadata) {
    console.log(`      ${colors.blue}Provider:${colors.reset} ${source.metadata.provider || 'N/A'}`);
    if (source.metadata.published_date) {
      console.log(`      ${colors.blue}Published:${colors.reset} ${source.metadata.published_date}`);
    }
    if (source.metadata.author) {
      console.log(`      ${colors.blue}Author:${colors.reset} ${source.metadata.author}`);
    }
  }
}

/**
 * Validates that a source has all required fields
 */
function validateSource(source: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!source.id) errors.push('Missing id');
  if (!source.title) errors.push('Missing title');
  if (!source.url) errors.push('Missing url');
  if (!source.snippet) errors.push('Missing snippet');
  if (source.score === undefined) errors.push('Missing score');

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`\n${colors.bright}${'='.repeat(60)}`);
  console.log('Research Agent Test Harness');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  // Display configuration
  console.log(`${colors.yellow}Configuration:${colors.reset}`);
  console.log(`  EXA_API_KEY: ${config.exaApiKey ? colors.green + '✓ Set' + colors.reset : colors.red + '✗ Not set' + colors.reset}`);
  console.log(`  LLM_API_KEY: ${config.llmApiKey ? colors.green + '✓ Set' + colors.reset : colors.red + '✗ Not set' + colors.reset}`);
  console.log(`  Environment: ${config.nodeEnv}`);

  if (!config.exaApiKey) {
    console.log(`\n${colors.yellow}⚠ Warning: EXA_API_KEY not set. Tests will use stub sources.${colors.reset}`);
    console.log(`${colors.yellow}To test real Exa integration, create a .env file with your API key.${colors.reset}\n`);
  }

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // Run tests for each question
  for (const question of testQuestions) {
    console.log(`\n${colors.bright}${'-'.repeat(60)}`);
    console.log(`Test Question: "${question}"`);
    console.log(`${'-'.repeat(60)}${colors.reset}\n`);

    totalTests++;

    try {
      const startTime = Date.now();
      const sources = await researchAgent(question);
      const duration = Date.now() - startTime;

      console.log(`${colors.green}✓ Request completed in ${duration}ms${colors.reset}`);
      console.log(`${colors.green}✓ Retrieved ${sources.length} sources${colors.reset}\n`);

      // Validate sources
      let allValid = true;
      sources.forEach((source, index) => {
        const validation = validateSource(source);
        if (!validation.valid) {
          console.log(`${colors.red}✗ Source ${index + 1} validation failed:${colors.reset}`);
          validation.errors.forEach(error => console.log(`    - ${error}`));
          allValid = false;
        }
      });

      if (allValid && sources.length > 0) {
        console.log(`${colors.green}✓ All sources validated successfully${colors.reset}`);
        passedTests++;
      } else if (sources.length === 0) {
        console.log(`${colors.yellow}⚠ No sources returned${colors.reset}`);
        failedTests++;
      } else {
        failedTests++;
      }

      // Display sources
      console.log(`\n${colors.bright}Sources:${colors.reset}`);
      sources.forEach((source, index) => displaySource(source, index));

    } catch (error) {
      console.log(`${colors.red}✗ Test failed with error:${colors.reset}`);
      console.error(error);
      failedTests++;
    }
  }

  // Summary
  console.log(`\n${colors.bright}${'='.repeat(60)}`);
  console.log('Test Summary');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`  ${failedTests > 0 ? colors.red : colors.reset}Failed: ${failedTests}${colors.reset}`);
  console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
