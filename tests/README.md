# Tests

This directory contains automated tests for the Rugplay Logger project.

## Test Files

### test-sdk.js
Tests the core SDK functionality including:
- WebSocket connection to `wss://ws.rugplay.com/`
- Event listener registration
- Connection handling and graceful disconnection
- Basic event processing

**Duration**: ~10 seconds (automatically terminates)

### test-export.js
Tests the export functionality including:
- JSON, CSV, and YAML export formats
- Sample trade event processing
- File output generation
- Format validation

**Duration**: ~30 seconds per format (processes sample data)

## Running Tests

### Local Testing

```bash
# Build the project first
npm run build

# Run all tests
npm run test:all

# Run individual tests
npm run test:sdk              # SDK connection test
npm run test:export:json      # JSON export test
npm run test:export:csv       # CSV export test  
npm run test:export:yaml      # YAML export test
```

### Cross-Platform Test Runners

The project includes cross-platform test runners that handle timeouts and process management:

- `run-sdk-test.js` - Wraps the SDK test with 15-second timeout
- `run-export-test.js` - Wraps export tests with 30-second timeout

These runners work on Windows, macOS, and Linux.

## GitHub Actions

Automated tests run on:
- Every push to `main` or `dev` branches
- Pull requests
- Manual workflow dispatch
- Scheduled runs every 6 hours (SDK connectivity test)

Tests run on Node.js versions 18.x and 20.x.

## Test Output

### Successful SDK Test
```
🧪 Testing SDK...
✅ SDK test successful - connected via SDK
🏁 SDK test completed
```

### Successful Export Test
```
📊 Testing export functionality...
✅ JSON export completed: exports/rugplay-trades.json
✅ Export test completed successfully
```

## Troubleshooting

### WebSocket Connection Issues
- Tests may timeout if `wss://ws.rugplay.com/` is unreachable
- This is normal and tests are designed to handle connection failures gracefully
- Export tests use sample data and don't require network connectivity

### File Permissions
- Ensure the `exports/` directory is writable
- Test runners automatically create the directory if needed

### Timeout Issues
- SDK test: 15-second timeout (can be increased in `run-sdk-test.js`)
- Export test: 30-second timeout (can be increased in `run-export-test.js`)

## Adding New Tests

To add new tests:

1. Create test file in `tests/` directory
2. Add corresponding npm script in `package.json`
3. Update GitHub Actions workflow if needed
4. Document the test in this README
