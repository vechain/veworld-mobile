# VechainWalletKit Testing Strategy

## 🎯 **New Testing Approach**

We've adopted a fresh testing strategy that focuses on **adapter-based integration testing** and **user journey validation** rather than isolated unit testing of individual functions.

## 📋 **Testing Philosophy**

### **Focus Areas:**
1. **Adapter Integration** - Test complete workflows through the `SmartAccountAdapter` interface
2. **User Journeys** - Test real-world scenarios from authentication to transaction completion  
3. **Smart Account Lifecycles** - Test deployment, versioning, and state transitions
4. **Error Handling** - Test failure scenarios and recovery patterns

### **Why This Approach?**
- ✅ **Tests Real User Flows** - Validates actual usage patterns
- ✅ **Adapter Pattern Alignment** - Tests match the new architecture
- ✅ **Integration Focus** - Catches issues between components
- ✅ **Maintainable** - Less brittle than deep unit tests

## 🗂️ **Test Structure**

```
__tests__/
├── adapters/
│   └── PrivySmartAccountAdapter.test.ts    # Core adapter functionality
├── journeys/
│   └── SmartAccountUserJourney.test.ts     # End-to-end user flows
├── scenarios/
│   └── SmartAccountLifecycle.test.ts       # Lifecycle and state testing
└── setup.ts                               # Test utilities and mocks
```

## 🔧 **Test Utilities**

The `setup.ts` file provides helpful utilities for creating test data:

```typescript
// Create mock smart account configurations
const config = createMockSmartAccountConfig({
  isDeployed: false,
  version: 1
})

// Create mock transaction clauses
const txClause = createMockTransactionClause({
  to: "0xCustomRecipient",
  value: "500000000000000000"
})

// Create mock Privy wallets
const wallet = createMockPrivyWallet({
  address: "0xCustomWallet"
})
```

## 🧪 **Example Test Patterns**

### **User Journey Testing**
```typescript
describe("Smart Account First Transaction", () => {
  it("should deploy and execute first transaction", async () => {
    // Test complete flow: auth → config → deploy → execute
  })
})
```

### **Lifecycle Testing** 
```typescript
describe("Version Compatibility", () => {
  it("should use batch execution for V3+ smart accounts", async () => {
    // Test version-specific behavior
  })
})
```

### **Error Handling**
```typescript
describe("Error Recovery Journey", () => {
  it("should handle and recover from signing rejection", async () => {
    // Test failure scenarios and recovery
  })
})
```

## 🚀 **Running Tests**

```bash
# Run all tests
yarn test

# Run specific test file
yarn test PrivySmartAccountAdapter.test.ts

# Run with coverage
yarn test:coverage
```

## 🎭 **Mocking Strategy**

We mock at the **boundary level** (Privy SDK, VeChain SDK) rather than internal functions:

- ✅ Mock `@privy-io/expo` hooks
- ✅ Mock `@vechain/sdk-core` utilities  
- ✅ Mock external provider requests
- ❌ Don't mock internal adapter methods

This ensures we test the **actual business logic** while controlling external dependencies.

## 📈 **Coverage Goals**

- **Adapter Methods**: 100% - All public methods tested
- **User Journeys**: 90% - Major user flows covered
- **Error Scenarios**: 85% - Key failure modes tested
- **Edge Cases**: 75% - Unusual but possible scenarios

---

*This testing approach ensures our smart account functionality works reliably in real-world scenarios while maintaining clean, maintainable test code.* 