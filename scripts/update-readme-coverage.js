#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  statements: totals.statements.pct.toFixed(2),
  branches: totals.branches.pct.toFixed(2),
  functions: totals.functions.pct.toFixed(2),
  lines: totals.lines.pct.toFixed(2),
};

// Helper function to get status indicator
function getStatusIndicator(value) {
  const numValue = parseFloat(value);
  if (numValue >= 85) return '✅';
  if (numValue >= 60) return '⚠️';
  return '❌';
}

// Get current timestamp
const lastUpdated = new Date().toISOString().split('T')[0];

// Create coverage section in table format
const coverageSection = `## Test Coverage

| Metric | Coverage | Status |
|--------|----------|--------|
| Statements | ${metrics.statements}% | ${getStatusIndicator(metrics.statements)} |
| Branches | ${metrics.branches}% | ${getStatusIndicator(metrics.branches)} |
| Functions | ${metrics.functions}% | ${getStatusIndicator(metrics.functions)} |
| Lines | ${metrics.lines}% | ${getStatusIndicator(metrics.lines)} |

*Last Updated: ${lastUpdated}*

`;

// Read README
const readmePath = path.join(__dirname, '../README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Check if coverage section exists (match both old and new formats)
const coverageSectionRegex = /## Test Coverage\n(?:[\s\S]*?)(?=\n##|\n$|Convert OpenAPI)/;

if (coverageSectionRegex.test(readmeContent)) {
  // Update existing coverage section
  readmeContent = readmeContent.replace(coverageSectionRegex, coverageSection);
  console.log('📝 Updated existing coverage section in README.md');
} else {
  // Add coverage section after the title
  const titleRegex = /(# ⚡ React API Weaver\n\n)/;
  if (titleRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(titleRegex, `$1${coverageSection}`);
    console.log('📝 Added new coverage section to README.md');
  } else {
    // Fallback: add at the beginning
    readmeContent = coverageSection + readmeContent;
    console.log('📝 Added coverage section at the beginning of README.md');
  }
}

// Write updated README
fs.writeFileSync(readmePath, readmeContent, 'utf8');

console.log('✅ README.md updated with current coverage stats');
console.log(`   Statements: ${metrics.statements}%, Branches: ${metrics.branches}%, Functions: ${metrics.functions}%, Lines: ${metrics.lines}%\n`);

