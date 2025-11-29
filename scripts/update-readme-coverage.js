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

// Create coverage section
const coverageSection = `## Test Coverage
- **Statements**: ${metrics.statements}%
- **Branches**: ${metrics.branches}%
- **Functions**: ${metrics.functions}%
- **Lines**: ${metrics.lines}%

`;

// Read README
const readmePath = path.join(__dirname, '../README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Check if coverage section exists
const coverageSectionRegex = /## Test Coverage\n(?:- \*\*[^*]+\*\*: [0-9.]+%\n)+\n/;

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

