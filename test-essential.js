#!/usr/bin/env node

// Simple test runner for essential tests only
const { execSync } = require('child_process')

console.log('🧪 Running Essential Tests Only...\n')

try {
  // Run only the essential tests
  execSync(
    'npx vitest run src/__tests__/essential.test.ts src/__tests__/dataHandling.test.ts src/__tests__/transactions.test.ts src/__tests__/useApi.test.ts src/__tests__/useMoneyFormat.test.ts src/__tests__/App.test.ts src/__tests__/router.test.ts src/__tests__/TagsPage.test.ts',
    {
      stdio: 'inherit',
      cwd: process.cwd(),
    }
  )

  console.log('\n✅ Essential tests completed successfully!')
  console.log('🎉 Your app is protected against the original runtime errors.')
} catch (error) {
  console.error('\n❌ Some essential tests failed.')
  console.error('Please check the output above for details.')
  process.exit(1)
}
