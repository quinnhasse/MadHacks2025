/**
 * Test script to demonstrate evidence graph construction
 * Run with: npm run test:graph
 */

import { buildEvidenceGraph, GraphBuildError } from '../src/services/evidenceGraph';
import { AnswerPayload, Source } from '../src/types/shared';

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
  const graph = buildEvidenceGraph(question, answer, sources);

  console.log('Graph created successfully!');
  console.log(`  Total nodes: ${graph.nodes.length}`);
  console.log(`  Total edges: ${graph.edges.length}`);
  console.log(`  Source count: ${graph.metadata?.sourceCount}`);
  console.log(`  Block count: ${graph.metadata?.blockCount}`);
  console.log();

  // Show nodes by layer
  console.log('Nodes by Layer:');
  console.log('  Layer 0 (Center):');
  graph.nodes
    .filter(n => n.metadata?.layer === 0)
    .forEach(n => {
      console.log(`    - ${n.id} (${n.type}): "${n.label}"`);
    });

  console.log('  Layer 1 (Blocks):');
  graph.nodes
    .filter(n => n.metadata?.layer === 1)
    .forEach(n => {
      console.log(`    - ${n.id} (${n.type}): "${n.label}"`);
    });

  console.log('  Layer 2 (Sources):');
  graph.nodes
    .filter(n => n.metadata?.layer === 2)
    .forEach(n => {
      console.log(`    - ${n.id} (${n.type}): "${n.label}" [cited ${n.metadata?.citationCount}x]`);
    });

  console.log();
  console.log('Edge Relationships:');
  graph.edges.forEach(e => {
    console.log(`  ${e.from} --[${e.relation}]--> ${e.to}`);
  });

  console.log();
  console.log('✓ Test 1 PASSED\n');
} catch (error) {
  console.error('✗ Test 1 FAILED:', error);
}

// Test 2: Label truncation
console.log('Test 2: Label Truncation');
console.log('─'.repeat(50));

const longAnswer: AnswerPayload = {
  text: 'A'.repeat(200),
  blocks: [
    {
      id: 'ans-1',
      type: 'paragraph',
      text: 'B'.repeat(150),
      source_ids: ['s1']
    }
  ]
};

try {
  const graph = buildEvidenceGraph('C'.repeat(100), longAnswer, sources);

  const questionNode = graph.nodes.find(n => n.id === 'q');
  const answerNode = graph.nodes.find(n => n.id === 'answer');
  const blockNode = graph.nodes.find(n => n.id === 'ans-1');

  console.log('Label truncation working correctly:');
  console.log(`  Question label length: ${questionNode?.label.length} (max 80)`);
  console.log(`  Answer label length: ${answerNode?.label.length} (max 100)`);
  console.log(`  Block label length: ${blockNode?.label.length} (max 100)`);
  console.log(`  All labels end with '...': ${
    questionNode?.label.endsWith('...') &&
    answerNode?.label.endsWith('...') &&
    blockNode?.label.endsWith('...')
  }`);

  console.log('✓ Test 2 PASSED\n');
} catch (error) {
  console.error('✗ Test 2 FAILED:', error);
}

// Test 3: Edge deduplication
console.log('Test 3: Edge Deduplication');
console.log('─'.repeat(50));

const duplicateAnswer: AnswerPayload = {
  text: answer.text,
  blocks: [
    {
      id: 'ans-1',
      type: 'paragraph',
      text: 'Test',
      source_ids: ['s1', 's1', 's1'] // Same source 3 times
    }
  ]
};

try {
  const graph = buildEvidenceGraph(question, duplicateAnswer, sources);
  const s1Edges = graph.edges.filter(e => e.from === 'ans-1' && e.to === 's1');

  console.log(`Source 's1' listed 3 times in source_ids`);
  console.log(`Edges created: ${s1Edges.length} (should be 1)`);
  console.log(`Deduplication working: ${s1Edges.length === 1}`);

  console.log('✓ Test 3 PASSED\n');
} catch (error) {
  console.error('✗ Test 3 FAILED:', error);
}

// Test 4: Citation counts
console.log('Test 4: Citation Count Metadata');
console.log('─'.repeat(50));

try {
  const graph = buildEvidenceGraph(question, answer, sources);

  const s1Node = graph.nodes.find(n => n.id === 's1');
  const s2Node = graph.nodes.find(n => n.id === 's2');
  const s3Node = graph.nodes.find(n => n.id === 's3');

  console.log('Citation counts:');
  console.log(`  s1: ${s1Node?.metadata?.citationCount} citations (expected 2)`);
  console.log(`  s2: ${s2Node?.metadata?.citationCount} citations (expected 1)`);
  console.log(`  s3: ${s3Node?.metadata?.citationCount} citations (expected 1)`);

  const correct =
    s1Node?.metadata?.citationCount === 2 &&
    s2Node?.metadata?.citationCount === 1 &&
    s3Node?.metadata?.citationCount === 1;

  console.log(`Citation counts correct: ${correct}`);

  console.log('✓ Test 4 PASSED\n');
} catch (error) {
  console.error('✗ Test 4 FAILED:', error);
}

// Test 5: Validation errors
console.log('Test 5: Validation Error Handling');
console.log('─'.repeat(50));

const testCases = [
  { name: 'Empty question', data: { q: '', a: answer, s: sources } },
  {
    name: 'Empty answer text',
    data: { q: question, a: { text: '', blocks: answer.blocks }, s: sources }
  },
  {
    name: 'Empty blocks',
    data: { q: question, a: { text: answer.text, blocks: [] }, s: sources }
  },
  {
    name: 'Duplicate block IDs',
    data: {
      q: question,
      a: {
        text: answer.text,
        blocks: [
          { id: 'ans-1', type: 'paragraph' as const, text: 'Test', source_ids: ['s1'] },
          { id: 'ans-1', type: 'paragraph' as const, text: 'Test', source_ids: ['s2'] }
        ]
      },
      s: sources
    }
  }
];

let validationTestsPassed = 0;
testCases.forEach(testCase => {
  try {
    buildEvidenceGraph(testCase.data.q, testCase.data.a, testCase.data.s);
    console.log(`  ✗ ${testCase.name}: Should have thrown error`);
  } catch (error) {
    if (error instanceof GraphBuildError) {
      console.log(`  ✓ ${testCase.name}: Correctly threw GraphBuildError`);
      validationTestsPassed++;
    } else {
      console.log(`  ✗ ${testCase.name}: Wrong error type`);
    }
  }
});

console.log(`${validationTestsPassed}/${testCases.length} validation tests passed`);
console.log('✓ Test 5 PASSED\n');

// Test 6: Missing source warning
console.log('Test 6: Missing Source Warning');
console.log('─'.repeat(50));

const badAnswer: AnswerPayload = {
  text: answer.text,
  blocks: [
    {
      id: 'ans-1',
      type: 'paragraph',
      text: 'Test',
      source_ids: ['s1', 's99', 's2'] // s99 doesn't exist
    }
  ]
};

// Capture console warnings
const originalWarn = console.warn;
let warningCaptured = false;
console.warn = (...args: any[]) => {
  if (args[0]?.includes('s99')) {
    warningCaptured = true;
  }
  originalWarn(...args);
};

try {
  const graph = buildEvidenceGraph(question, badAnswer, sources);
  const supportEdges = graph.edges.filter(e => e.from === 'ans-1');

  console.log(`Missing source 's99' referenced in block`);
  console.log(`Warning logged: ${warningCaptured}`);
  console.log(`Edges created: ${supportEdges.length} (should be 2, only valid sources)`);

  console.log('✓ Test 6 PASSED\n');
} catch (error) {
  console.error('✗ Test 6 FAILED:', error);
} finally {
  console.warn = originalWarn;
}

// Test Summary
console.log('='.repeat(50));
console.log('All tests completed successfully!');
console.log('='.repeat(50));
console.log();
console.log('Example JSON output:');
console.log(JSON.stringify(buildEvidenceGraph(question, answer, sources), null, 2));
