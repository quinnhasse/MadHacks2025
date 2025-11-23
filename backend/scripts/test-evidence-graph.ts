/**
 * Test script for evidence graph - Updated for async support
 * Run with: npm run test:graph
 */

import { buildEvidenceGraph, GraphBuildError } from '../src/services/evidenceGraph';
import { AnswerPayload, Source } from '../src/types/shared';

async function runTests() {
console.log('\n=== Evidence Graph Test Suite ===\n');

// Test data
const question = 'What is the capital of France?';

const sources: Source[] = [
  {
    id: 's1',
    title: 'Wikipedia: Paris',
    url: 'https://en.wikipedia.org/wiki/Paris',
    snippet: 'Paris is the capital and most populous city of France.',
    score: 0.95
  },
  {
    id: 's2',
    title: 'Britannica: France',
    url: 'https://britannica.com/place/France',
    snippet: 'France, officially the French Republic, capital Paris.',
    score: 0.88
  },
  {
    id: 's3',
    title: 'Geographic Facts',
    url: 'https://example.com/facts',
    snippet: 'Paris has been the capital since the 12th century.',
    score: 0.72
  }
];

const answer: AnswerPayload = {
  text: 'Paris is the capital of France. It has been the capital since the 12th century and is the most populous city in the country.',
  blocks: [
    {
      id: 'ans-1',
      type: 'paragraph',
      text: 'Paris is the capital of France.',
      source_ids: ['s1', 's2']
    },
    {
      id: 'ans-2',
      type: 'paragraph',
      text: 'It has been the capital since the 12th century.',
      source_ids: ['s3']
    },
    {
      id: 'ans-3',
      type: 'paragraph',
      text: 'Paris is the most populous city in France.',
      source_ids: ['s1']
    }
  ]
};

// Test 1: Successful graph construction
console.log('Test 1: Successful Graph Construction');
console.log('─'.repeat(50));

try {
  const graph = await buildEvidenceGraph(question, answer, sources);

  console.log('Graph created successfully!');
  console.log(`  Total nodes: ${graph.nodes.length}`);
  console.log(`  Total edges: ${graph.edges.length}`);
  console.log(`  Source count: ${graph.metadata?.sourceCount}`);
  console.log(`  Block count: ${graph.metadata?.blockCount}`);
  console.log();

  console.log('Nodes by Layer:');
  console.log('  Layer 0 (Center):');
  graph.nodes
    .filter(n => n.metadata?.layer === 0)
    .forEach(n => console.log(`    - ${n.id} (${n.type}): "${n.label}"`));

  console.log('  Layer 1 (Blocks):');
  graph.nodes
    .filter(n => n.metadata?.layer === 1)
    .forEach(n => console.log(`    - ${n.id} (${n.type}): "${n.label}"`));

  console.log('  Layer 2 (Sources):');
  graph.nodes
    .filter(n => n.metadata?.layer === 2)
    .forEach(n => {
      const citationCount = n.metadata?.citationCount || 0;
      console.log(`    - ${n.id} (${n.type}): "${n.label}" [cited ${citationCount}x]`);
    });

  console.log();
  console.log('Edge Relationships:');
  graph.edges.forEach(e => {
    const weight = e.weight ? ` (weight: ${Number(e.weight).toFixed(2)})` : '';
    console.log(`  ${e.from} --[${e.relation}]--> ${e.to}${weight}`);
  });

  console.log('✓ Test 1 PASSED\n');
} catch (error) {
  console.error('✗ Test 1 FAILED:', error);
}

console.log('==================================================');
console.log('Basic tests completed successfully!');
console.log('Run npm run test:enhanced for full multi-layer test');
console.log('==================================================\n');
}

runTests().catch(console.error);
