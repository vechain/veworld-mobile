import { getChainId } from "./chainId"
import { WalletError, WalletErrorType } from "./errors"

describe("getChainId", () => {
    describe("solo network", () => {
        it("should return the provided chainId for solo network", () => {
            const chainId = 1234
            const result = getChainId("solo", chainId)
            expect(result).toBe(chainId)
        })

        it("should return chainId at the upper boundary (65535)", () => {
            const result = getChainId("solo", 0xffff)
            expect(result).toBe(65535)
        })

        it("should throw WalletError when chainId is not provided", () => {
            expect(() => getChainId("solo")).toThrow(WalletError)
            try {
                getChainId("solo")
            } catch (error) {
                expect(error).toBeInstanceOf(WalletError)
                expect((error as WalletError).type).toBe(WalletErrorType.INVALID_CHAIN_ID)
                expect((error as WalletError).message).toBe("Chain ID is required for solo network type")
            }
        })

        it("should throw WalletError when chainId is negative", () => {
            expect(() => getChainId("solo", -1)).toThrow(WalletError)
            try {
                getChainId("solo", -1)
            } catch (error) {
                expect(error).toBeInstanceOf(WalletError)
                expect((error as WalletError).type).toBe(WalletErrorType.INVALID_CHAIN_ID)
                expect((error as WalletError).message).toBe("Chain ID must be the last 16 bits of the genesis block")
            }
        })

        it("should throw WalletError when chainId exceeds 16-bit limit", () => {
            expect(() => getChainId("solo", 65536)).toThrow(WalletError)
            try {
                getChainId("solo", 65536)
            } catch (error) {
                expect(error).toBeInstanceOf(WalletError)
                expect((error as WalletError).type).toBe(WalletErrorType.INVALID_CHAIN_ID)
                expect((error as WalletError).message).toBe("Chain ID must be the last 16 bits of the genesis block")
            }
        })

        it("should throw WalletError when chainId is way above limit", () => {
            expect(() => getChainId("solo", 100000)).toThrow(WalletError)
            try {
                getChainId("solo", 100000)
            } catch (error) {
                expect(error).toBeInstanceOf(WalletError)
                expect((error as WalletError).type).toBe(WalletErrorType.INVALID_CHAIN_ID)
                expect((error as WalletError).message).toBe("Chain ID must be the last 16 bits of the genesis block")
            }
        })

        it("should handle chainId of 1 for solo network", () => {
            const result = getChainId("solo", 1)
            expect(result).toBe(1)
        })

        it("should handle maximum valid chainId (0xffff) for solo network", () => {
            const result = getChainId("solo", 0xffff)
            expect(result).toBe(0xffff)
        })
    })

    describe("mainnet network", () => {
        it("should return 6986 for mainnet", () => {
            const result = getChainId("mainnet")
            expect(result).toBe(6986)
        })

        it("should return 6986 for mainnet even when chainId is provided", () => {
            const result = getChainId("mainnet", 1234)
            expect(result).toBe(6986)
        })
    })

    describe("testnet network", () => {
        it("should return 45351 for testnet", () => {
            const result = getChainId("testnet")
            expect(result).toBe(45351)
        })

        it("should return 45351 for testnet even when chainId is provided", () => {
            const result = getChainId("testnet", 5678)
            expect(result).toBe(45351)
        })
    })

    describe("invalid network type", () => {
        it("should throw error for unsupported network type", () => {
            expect(() => getChainId("invalid" as any)).toThrow("Unsupported network type: invalid")
        })

        it("should throw error for empty string network type", () => {
            expect(() => getChainId("" as any)).toThrow("Unsupported network type: ")
        })

        it("should throw error for null network type", () => {
            expect(() => getChainId(null as any)).toThrow("Unsupported network type: null")
        })

        it("should throw error for undefined network type", () => {
            expect(() => getChainId(undefined as any)).toThrow("Unsupported network type: undefined")
        })
    })
})
