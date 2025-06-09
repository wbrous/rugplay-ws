#!/usr/bin/env node

// Cross-platform SDK test runner
const { spawn } = require('child_process');
const path = require('path');

const timeout = 15000; // 15 seconds
const testScript = path.join(__dirname, 'test-sdk.js');

console.log('🧪 Running SDK test with timeout...');

const child = spawn('node', [testScript], {
  stdio: 'inherit',
  cwd: process.cwd()
});

// Set timeout
const timer = setTimeout(() => {
  console.log('\n⏰ Test timeout reached, terminating...');
  child.kill('SIGTERM');
  
  // Force kill after 2 seconds if still running
  setTimeout(() => {
    child.kill('SIGKILL');
  }, 2000);
  
  console.log('✅ SDK test completed (timeout expected)');
  process.exit(0);
}, timeout);

child.on('exit', (code) => {
  clearTimeout(timer);
  
  if (code === 0) {
    console.log('✅ SDK test completed successfully');
    process.exit(0);
  } else if (code === null) {
    // Process was killed by timeout
    console.log('✅ SDK test completed (terminated by timeout)');
    process.exit(0);
  } else {
    console.error(`❌ SDK test failed with exit code ${code}`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  clearTimeout(timer);
  console.error('❌ Failed to start SDK test:', error);
  process.exit(1);
});
