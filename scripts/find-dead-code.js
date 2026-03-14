const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking for unused files and dependencies...');

// 1. Basic check for node_modules
if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
}

// 2. We can use a pattern matching to find files not imported.
// For a robust check, we recommend using 'knip' or 'depcheck'.
// This script will install 'knip' temporarily and run it.

try {
    console.log('🚀 Running Knip to find unused files and exports...');
    execSync('npx knip', { stdio: 'inherit' });
} catch (error) {
    // Knip exits with 1 if issues are found, which is expected
    console.log('✅ Analysis complete.');
}
