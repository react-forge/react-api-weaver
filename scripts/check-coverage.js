#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read thresholds from vitest.config.ts to ensure single source of truth
function getThresholdsFromConfig() {
  const configPath = path.join(__dirname, '../vitest.config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Extract thresholds from config file
  const thresholdsMatch = configContent.match(/thresholds:\s*\{[^}]*statements:\s*(\d+)[^}]*branches:\s*(\d+)[^}]*functions:\s*(\d+)[^}]*lines:\s*(\d+)/);
  
  if (thresholdsMatch) {
    return {
      statements: parseInt(thresholdsMatch[1]),
      branches: parseInt(thresholdsMatch[2]),
      functions: parseInt(thresholdsMatch[3]),
      lines: parseInt(thresholdsMatch[4]),
    };
  }
  
  // Fallback to 40% if parsing fails
  console.warn('⚠️  Could not parse thresholds from vitest.config.ts, using default 40%');
  return { statements: 40, branches: 40, functions: 40, lines: 40 };
}

const THRESHOLDS = getThresholdsFromConfig();

// Read coverage summary
const coverageSummaryPath = path.join(__dirname, '../coverage/coverage-summary.json');

if (!fs.existsSync(coverageSummaryPath)) {
  console.error('❌ Coverage summary file not found!');
  console.error('Please run "npm run test:coverage" first.');
  process.exit(1);
}

const coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
const totals = coverageSummary.total;

// Extract percentages
const metrics = {
  statements: totals.statements.pct,
  branches: totals.branches.pct,
  functions: totals.functions.pct,
  lines: totals.lines.pct,
};

console.log('\n📊 Coverage Report:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Statements: ${metrics.statements.toFixed(2)}%`);
console.log(`  Branches:   ${metrics.branches.toFixed(2)}%`);
console.log(`  Functions:  ${metrics.functions.toFixed(2)}%`);
console.log(`  Lines:      ${metrics.lines.toFixed(2)}%`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Check if all metrics meet threshold
const failures = [];
Object.entries(metrics).forEach(([metric, value]) => {
  const threshold = THRESHOLDS[metric];
  if (value < threshold) {
    failures.push(`${metric}: ${value.toFixed(2)}% (required: ${threshold}%)`);
  }
});

if (failures.length > 0) {
  console.error('❌ Coverage check FAILED!');
  console.error('\nThe following metrics are below their thresholds:');
  failures.forEach(failure => console.error(`  - ${failure}`));
  console.error('\nPlease add more tests to increase coverage.\n');
  process.exit(1);
}

console.log(`✅ All coverage metrics meet their required thresholds!`);
console.log(`   (statements: ${THRESHOLDS.statements}%, branches: ${THRESHOLDS.branches}%, functions: ${THRESHOLDS.functions}%, lines: ${THRESHOLDS.lines}%)\n`);
process.exit(0);

