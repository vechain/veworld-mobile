import { queryClient } from "~Api/QueryProvider"
import { getNftNameAndSymbolOptions, getNftTotalSupplyOptions } from "./queries"
import { ContractCallError } from "@vechain/sdk-errors"

describe("getNftCollectionMetadata_queries", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })
    describe("getNftNameAndSymbolOptions", () => {
        it("should work fine with normal options", async () => {
            const result = await queryClient.fetchQuery({
                ...getNftNameAndSymbolOptions("0x0", "0x0", {
                    contracts: {
                        executeMultipleClausesCall: jest.fn().mockResolvedValue([
                            { result: { plain: "NAME" }, success: true },
                            { result: { plain: "SYMBOL" }, success: true },
                        ]),
                    },
                } as any),
                gcTime: Infinity,
            })
            expect(result.name).toBe("NAME")
            expect(result.symbol).toBe("SYMBOL")
        })
        it("should throw error if either one of the two fails", async () => {
            await expect(() =>
                queryClient.fetchQuery({
                    ...getNftNameAndSymbolOptions("0x0", "0x0", {
                        contracts: {
                            executeMultipleClausesCall: jest
                                .fn()
                                .mockResolvedValue([{ success: false }, { result: { plain: "SYMBOL" } }]),
                        },
                    } as any),
                    gcTime: Infinity,
                }),
            ).rejects.toThrow("Failed to get NFT collection name and symbol")
        })
    })
    describe("getNftTotalSupply", () => {
        it("should work fine with normal options", async () => {
            const result = await queryClient.fetchQuery({
                ...getNftTotalSupplyOptions("0x0", "0x0", {
                    contracts: {
                        load: jest.fn().mockReturnValue({
                            read: {
                                totalSupply: jest.fn().mockResolvedValue([10n]),
                            },
                        }),
                    },
                } as any),
                gcTime: Infinity,
            })
            expect(result.totalSupply).toBe(10n)
        })
        it("should return undefined when failing due to method not existing", async () => {
            const result = await queryClient.fetchQuery({
                ...getNftTotalSupplyOptions("0x0", "0x0", {
                    contracts: {
                        load: jest.fn().mockReturnValue({
                            read: {
                                totalSupply: jest
                                    .fn()
                                    .mockRejectedValue(new ContractCallError("totalSupply", "", {}, new Error())),
                            },
                        }),
                    },
                } as any),
                gcTime: Infinity,
            })
            expect(result.totalSupply).not.toBeDefined()
        })
        it("should throw when it's a different error", async () => {
            await expect(() =>
                queryClient.fetchQuery({
                    ...getNftTotalSupplyOptions("0x0", "0x0", {
                        contracts: {
                            load: jest.fn().mockReturnValue({
                                read: {
                                    totalSupply: jest.fn().mockRejectedValue(new Error("TEST ERROR")),
                                },
                            }),
                        },
                    } as any),
                    gcTime: Infinity,
                }),
            ).rejects.toThrow("TEST ERROR")
        })
    })
})
