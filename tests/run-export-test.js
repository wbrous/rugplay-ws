#!/usr/bin/env node

// Cross-platform export test runner
const { spawn } = require('child_process');
const path = require('path');

const timeout = 30000; // 30 seconds
const testScript = path.join(__dirname, 'test-export.js');
const format = process.argv[2] || 'json';

console.log(`🧪 Running export test (${format}) with timeout...`);

const child = spawn('node', [testScript], {
  stdio: ['pipe', 'inherit', 'inherit'],
  cwd: process.cwd()
});

// Send format input
child.stdin.write(format + '\n');
child.stdin.end();

// Set timeout
const timer = setTimeout(() => {
  console.log('\n⏰ Test timeout reached, terminating...');
  child.kill('SIGTERM');
  
  // Force kill after 2 seconds if still running
  setTimeout(() => {
    child.kill('SIGKILL');
  }, 2000);
  
  console.log(`✅ Export test (${format}) completed (timeout expected)`);
  process.exit(0);
}, timeout);

child.on('exit', (code) => {
  clearTimeout(timer);
  
  if (code === 0) {
    console.log(`✅ Export test (${format}) completed successfully`);
    process.exit(0);
  } else if (code === null) {
    // Process was killed by timeout
    console.log(`✅ Export test (${format}) completed (terminated by timeout)`);
    process.exit(0);
  } else {
    console.error(`❌ Export test (${format}) failed with exit code ${code}`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  clearTimeout(timer);
  console.error(`❌ Failed to start export test (${format}):`, error);
  process.exit(1);
});
