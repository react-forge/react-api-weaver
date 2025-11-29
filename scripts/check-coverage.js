#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const COVERAGE_THRESHOLD = 15;

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
  if (value < COVERAGE_THRESHOLD) {
    failures.push(`${metric}: ${value.toFixed(2)}% (required: ${COVERAGE_THRESHOLD}%)`);
  }
});

if (failures.length > 0) {
  console.error('❌ Coverage check FAILED!');
  console.error(`\nThe following metrics are below ${COVERAGE_THRESHOLD}%:`);
  failures.forEach(failure => console.error(`  - ${failure}`));
  console.error('\nPlease add more tests to increase coverage.\n');
  process.exit(1);
}

console.log(`✅ All coverage metrics meet the ${COVERAGE_THRESHOLD}% threshold!\n`);
process.exit(0);

