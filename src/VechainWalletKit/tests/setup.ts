// Test setup for VechainWalletKit
import "@testing-library/jest-native/extend-expect"

// Mock VeChain SDK to avoid BigInt serialization issues
jest.mock("@vechain/sdk-core", () => ({
    Address: {
        of: jest.fn().mockImplementation((address: string) => ({
            toString: () => address,
            toJSON: () => address,
        })),
    },
    Clause: {
        callFunction: jest.fn().mockImplementation((address, _func, _params) => ({
            to: typeof address === "string" ? address : address.toString(),
            value: "0",
            data: "0xmocked",
        })),
    },
    Transaction: jest.fn().mockImplementation(() => ({
        getTransactionHash: jest.fn().mockReturnValue(Buffer.from("mockhash", "hex")),
    })),
    ABIContract: {
        ofAbi: jest.fn().mockReturnValue({
            getFunction: jest.fn().mockReturnValue({
                selector: "0xmocked",
                encodeData: jest.fn().mockReturnValue("0xmockeddata"),
            }),
        }),
    },
}))

// Mock viem to avoid BigInt issues
jest.mock("viem", () => ({
    encodeFunctionData: jest.fn().mockReturnValue("0xmockeddata"),
    bytesToHex: jest.fn().mockImplementation((bytes: Uint8Array) => `0x${Buffer.from(bytes).toString("hex")}`),
}))

// Mock Privy SDK
jest.mock("@privy-io/expo", () => ({
    usePrivy: jest.fn(() => ({
        user: { id: "test-user" },
        logout: jest.fn(),
    })),
    useEmbeddedEthereumWallet: jest.fn(() => ({
        wallets: [
            {
                address: "0x5555555555555555555555555555555555555555",
                getProvider: jest.fn().mockResolvedValue({
                    request: jest.fn().mockResolvedValue("0xmocksignature"),
                }),
            },
        ],
    })),
    useLoginWithOAuth: jest.fn(() => ({
        login: jest.fn(),
    })),
}))

// Global test utilities and mocks
global.crypto = {
    getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256)
        }
        return array
    },
} as any

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
}

// Test utilities for creating mock data
export const createMockSmartAccountConfig = (overrides = {}) => ({
    address: "0x1234567890123456789012345678901234567890",
    version: 3,
    isDeployed: true,
    hasV1SmartAccount: false,
    factoryAddress: "0xabcdef1234567890123456789012345678901234",
    ...overrides,
})

export const createMockTransactionClause = (overrides = {}) => ({
    to: "0x9876543210987654321098765432109876543210",
    value: "1000000000000000000",
    data: "0x",
    ...overrides,
})

export const createMockPrivyWallet = (overrides = {}) => ({
    address: "0x5555555555555555555555555555555555555555",
    getProvider: jest.fn().mockResolvedValue({
        request: jest.fn().mockResolvedValue("0xmocksignature"),
    }),
    ...overrides,
})

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
