import { renderHook } from "@testing-library/react-native"
import { usePrivySmartAccountAdapter } from "../../adapters/PrivySmartAccountAdapter"

// Simple working mocks
jest.mock("@privy-io/expo", () => ({
    usePrivy: () => ({
        user: { id: "test-user" },
        logout: jest.fn(),
    }),
    useEmbeddedEthereumWallet: () => ({
        wallets: [
            {
                address: "0x1234567890123456789012345678901234567890",
                getProvider: () =>
                    Promise.resolve({
                        request: jest.fn().mockResolvedValue("0xmocksignature"),
                    }),
            },
        ],
    }),
    useLoginWithOAuth: () => ({
        login: jest.fn(),
    }),
}))

describe("PrivySmartAccountAdapter", () => {
    it("should initialize correctly", () => {
        const { result } = renderHook(() => usePrivySmartAccountAdapter())

        expect(result.current).toBeDefined()
        expect(result.current.isAuthenticated).toBe(true)
        expect(typeof result.current.buildSmartAccountTransaction).toBe("function")
        expect(typeof result.current.signMessage).toBe("function")
        expect(typeof result.current.getAccount).toBe("function")
    })

    it("should provide all required SmartAccountAdapter methods", () => {
        const { result } = renderHook(() => usePrivySmartAccountAdapter())

        const adapter = result.current

        // Basic wallet methods
        expect(adapter.login).toBeDefined()
        expect(adapter.logout).toBeDefined()
        expect(adapter.signMessage).toBeDefined()
        expect(adapter.signTransaction).toBeDefined()
        expect(adapter.signTypedData).toBeDefined()
        expect(adapter.getAccount).toBeDefined()

        // Smart account specific methods
        expect(adapter.buildSmartAccountTransaction).toBeDefined()
        expect(adapter.isSmartAccountDeployed).toBeDefined()
        expect(adapter.getSmartAccountConfig).toBeDefined()

        // Properties
        expect(typeof adapter.isAuthenticated).toBe("boolean")
    })
})
