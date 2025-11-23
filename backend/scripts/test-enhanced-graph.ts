/**
 * Enhanced Graph Test Script
 * Tests the multi-layer evidence graph with secondary sources and semantic edges
 */

import { researchAgent } from '../src/services/researchAgent';
import { answerAgent } from '../src/services/answerAgent';
import { buildEvidenceGraph } from '../src/services/evidenceGraph';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function formatTimestamp() {
  return new Date().toISOString();
}

async function testEnhancedGraph() {
  console.log(`${colors.bright}============================================================`);
  console.log(`Enhanced Evidence Graph Test - Multi-Layer Network Ball`);
  console.log(`============================================================${colors.reset}\n`);

  const question = "What is AI transparency?";
  console.log(`${colors.cyan}Test Question: "${question}"${colors.reset}\n`);

  try {
    // Step 1: Research
    console.log(`${colors.cyan}Step 1: Fetching sources...${colors.reset}`);
    const researchStart = Date.now();
    const sources = await researchAgent(question);
    const researchTime = Date.now() - researchStart;
    console.log(`${colors.green}✓ Retrieved ${sources.length} sources in ${researchTime}ms${colors.reset}\n`);

    // Step 2: Answer
    console.log(`${colors.cyan}Step 2: Generating answer...${colors.reset}`);
    const answerStart = Date.now();
    const answer = await answerAgent(question, sources);
    const answerTime = Date.now() - answerStart;
    console.log(`${colors.green}✓ Generated answer with ${answer.blocks.length} blocks in ${answerTime}ms${colors.reset}\n`);

    // Step 3: Build Enhanced Graph
    console.log(`${colors.cyan}Step 3: Building enhanced evidence graph...${colors.reset}`);
    const graphStart = Date.now();
    const graph = await buildEvidenceGraph(question, answer, sources);
    const graphTime = Date.now() - graphStart;
    console.log(`${colors.green}✓ Built graph in ${graphTime}ms${colors.reset}\n`);

    // Analysis
    console.log(`${colors.bright}============================================================`);
    console.log(`Graph Analysis`);
    console.log(`============================================================${colors.reset}\n`);

    console.log(`${colors.bright}Overall Stats:${colors.reset}`);
    console.log(`  Total Nodes: ${graph.nodes.length}`);
    console.log(`  Total Edges: ${graph.edges.length}`);
    console.log(`  Total Time: ${researchTime + answerTime + graphTime}ms\n`);

    console.log(`${colors.bright}Nodes by Layer:${colors.reset}`);
    const nodesByLayer = graph.nodes.reduce((acc, node) => {
      const layer = node.metadata?.layer ?? -1;
      acc[layer] = (acc[layer] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log(`  Layer 0 (Center): ${nodesByLayer[0] || 0}`);
    console.log(`  Layer 1 (Answer Blocks): ${nodesByLayer[1] || 0}`);
    console.log(`  Layer 2 (Direct Sources): ${nodesByLayer[2] || 0}`);
    console.log(`  Layer 3 (Secondary Sources): ${nodesByLayer[3] || 0}\n`);

    console.log(`${colors.bright}Nodes by Type:${colors.reset}`);
    const nodesByType = graph.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(nodesByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log();

    console.log(`${colors.bright}Edges by Relation:${colors.reset}`);
    const edgesByRelation = graph.edges.reduce((acc, edge) => {
      acc[edge.relation] = (acc[edge.relation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(edgesByRelation).forEach(([relation, count]) => {
      console.log(`  ${relation}: ${count}`);
    });
    console.log();

    // Edge weights analysis
    const weightedEdges = graph.edges.filter(e => e.weight !== undefined);
    if (weightedEdges.length > 0) {
      const avgWeight = weightedEdges.reduce((sum, e) => sum + (e.weight || 0), 0) / weightedEdges.length;
      const maxWeight = Math.max(...weightedEdges.map(e => e.weight || 0));
      const minWeight = Math.min(...weightedEdges.map(e => e.weight || 0));

      console.log(`${colors.bright}Edge Weights:${colors.reset}`);
      console.log(`  Weighted Edges: ${weightedEdges.length}/${graph.edges.length}`);
      console.log(`  Min Weight: ${minWeight.toFixed(3)}`);
      console.log(`  Max Weight: ${maxWeight.toFixed(3)}`);
      console.log(`  Avg Weight: ${avgWeight.toFixed(3)}\n`);
    }

    // Sample nodes from each layer
    console.log(`${colors.bright}============================================================`);
    console.log(`Sample Nodes from Each Layer`);
    console.log(`============================================================${colors.reset}\n`);

    for (let layer = 0; layer <= 3; layer++) {
      const layerNodes = graph.nodes.filter(n => n.metadata?.layer === layer);
      if (layerNodes.length > 0) {
        console.log(`${colors.magenta}Layer ${layer} Sample (showing 1/${layerNodes.length}):${colors.reset}`);
        const sample = layerNodes[0];
        console.log(`  ID: ${sample.id}`);
        console.log(`  Type: ${sample.type}`);
        console.log(`  Label: ${sample.label}`);
        if (sample.metadata?.branchId) {
          console.log(`  Branch ID: ${sample.metadata.branchId}`);
        }
        if (sample.metadata?.primaryParentId) {
          console.log(`  Parent ID: ${sample.metadata.primaryParentId}`);
        }
        if (sample.metadata?.importance) {
          console.log(`  Importance: ${sample.metadata.importance.toFixed(2)}`);
        }
        console.log();
      }
    }

    // Validation checks
    console.log(`${colors.bright}============================================================`);
    console.log(`Validation Checks`);
    console.log(`============================================================${colors.reset}\n`);

    const checks: { name: string; passed: boolean; message: string }[] = [];

    // Check 1: All answer blocks have at least one direct source
    const blockNodes = graph.nodes.filter(n => n.type === 'answer_block');
    let allBlocksHaveSources = true;
    for (const block of blockNodes) {
      const outgoingEdges = graph.edges.filter(e => e.from === block.id && e.relation === 'supports');
      if (outgoingEdges.length === 0) {
        allBlocksHaveSources = false;
        break;
      }
    }
    checks.push({
      name: 'All answer blocks have ≥1 direct source',
      passed: allBlocksHaveSources,
      message: allBlocksHaveSources ? 'All blocks properly sourced' : 'Some blocks missing sources'
    });

    // Check 2: No semantic edges to answer_root
    const semanticToAnswer = graph.edges.some(e =>
      e.relation === 'semantic_related' && (e.from === 'answer' || e.to === 'answer')
    );
    checks.push({
      name: 'No semantic edges to answer_root',
      passed: !semanticToAnswer,
      message: semanticToAnswer ? 'Found semantic edges to answer_root' : 'Answer node properly isolated'
    });

    // Check 3: All secondary sources have parent
    const secondarySources = graph.nodes.filter(n => n.type === 'secondary_source');
    const allSecondaryHaveParent = secondarySources.every(n => n.metadata?.parentSourceId);
    checks.push({
      name: 'All secondary sources have parentSourceId',
      passed: allSecondaryHaveParent || secondarySources.length === 0,
      message: allSecondaryHaveParent
        ? `All ${secondarySources.length} secondary sources have parent`
        : 'Some secondary sources missing parent'
    });

    // Check 4: All edges reference valid nodes
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    const allEdgesValid = graph.edges.every(e => nodeIds.has(e.from) && nodeIds.has(e.to));
    checks.push({
      name: 'All edges reference valid nodes',
      passed: allEdgesValid,
      message: allEdgesValid ? 'All edge references valid' : 'Some edges reference missing nodes'
    });

    // Check 5: Edge weights in valid range
    const allWeightsValid = graph.edges.every(e => {
      if (e.weight === undefined) return true;
      return e.weight >= 0 && e.weight <= 1;
    });
    checks.push({
      name: 'All edge weights in [0, 1]',
      passed: allWeightsValid,
      message: allWeightsValid ? 'All weights valid' : 'Some weights out of range'
    });

    // Print check results
    checks.forEach(check => {
      const icon = check.passed ? colors.green + '✓' : colors.red + '✗';
      const status = check.passed ? colors.green : colors.red;
      console.log(`${icon} ${check.name}${colors.reset}`);
      console.log(`  ${status}${check.message}${colors.reset}`);
    });

    const allPassed = checks.every(c => c.passed);
    console.log();
    if (allPassed) {
      console.log(`${colors.green}${colors.bright}All validation checks passed!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}${colors.bright}Some validation checks failed${colors.reset}\n`);
    }

    // Print sample JSON
    console.log(`${colors.bright}============================================================`);
    console.log(`Sample JSON Output (first 3 nodes, 5 edges)`);
    console.log(`============================================================${colors.reset}\n`);

    const sampleOutput = {
      nodes: graph.nodes.slice(0, 3),
      edges: graph.edges.slice(0, 5),
      metadata: graph.metadata
    };

    console.log(JSON.stringify(sampleOutput, null, 2));
    console.log();

    console.log(`${colors.bright}============================================================`);
    console.log(`Test Complete - Enhanced Graph Ready for 3D Visualization`);
    console.log(`============================================================${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}${colors.bright}Test Failed:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run test
testEnhancedGraph();
