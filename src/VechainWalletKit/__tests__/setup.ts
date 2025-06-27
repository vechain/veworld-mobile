// Test setup for VechainWalletKit
import "@testing-library/jest-native/extend-expect"

// Mock React Native modules that might cause issues in tests
jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
    NativeModules: {},
    Platform: {
        OS: "ios",
        select: jest.fn(config => config.ios),
    },
}))

// Global test timeout
jest.setTimeout(10000)
