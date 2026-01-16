import { renderHook } from "@testing-library/react-hooks"
import { useQuery } from "@tanstack/react-query"

import { TestWrapper } from "~Test"

import { defaultMainNetwork } from "~Constants"
import { HexUtils } from "~Utils"

import { useHomeCollectibles } from "./useHomeCollectibles"
import { useIndexerClient } from "~Hooks/useIndexerClient"

const mockGet = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    useIndexerClient: jest.fn(),
}))

const DEFAULT_ACCOUNT = HexUtils.normalize("0xCF130b42Ae33C5531277B4B7c0F1D994B8732957")

const createMockNftState = (overrides?: {
    blackListedAddresses?: string[]
    reportedAddresses?: string[]
    favoriteNfts?: Record<string, any>
}) => ({
    nft: {
        blackListedCollections: {
            mainnet: overrides?.blackListedAddresses
                ? { [DEFAULT_ACCOUNT]: { addresses: overrides.blackListedAddresses } }
                : {},
            other: {},
            solo: {},
            testnet: {},
        },
        reportedCollections: {
            mainnet: overrides?.reportedAddresses
                ? { [DEFAULT_ACCOUNT]: { addresses: overrides.reportedAddresses } }
                : {},
            other: {},
            solo: {},
            testnet: {},
        },
        favoriteNfts: overrides?.favoriteNfts || {},
        collectionRegistryInfo: {
            mainnet: [],
            other: [],
            solo: [],
            testnet: [],
        },
        collections: {},
        error: undefined,
        isLoading: false,
        nfts: {},
        _persist: {
            version: 31,
            rehydrated: true,
        },
    },
})

describe("useHomeCollectibles", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGet.mockResolvedValue({
            data: {
                data: [
                    {
                        id: "1",
                        tokenId: "1",
                        contractAddress: "0x0",
                        owner: "0x0",
                        txId: "0x0",
                        blockNumber: 1,
                        blockId: "0x0",
                    },
                ],
                paginations: {},
            },
        })
        ;(useIndexerClient as jest.Mock).mockReturnValue({
            GET: mockGet,
        })
    })
    it("should fetch nfts when there are less than 4 favorites", async () => {
        const { result, waitFor } = renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
            expect(result.current.data!.data).toHaveLength(1)
        })
    })
    it("should not fetch nfts when there are 4 favorites", async () => {
        const favoriteNfts = {
            [defaultMainNetwork.genesis.id]: {
                [DEFAULT_ACCOUNT]: {
                    ["0x0_1"]: { address: "0x0", tokenId: "1", createdAt: Date.now() },
                    ["0x0_2"]: { address: "0x0", tokenId: "2", createdAt: Date.now() },
                    ["0x0_3"]: { address: "0x0", tokenId: "3", createdAt: Date.now() },
                    ["0x0_4"]: { address: "0x0", tokenId: "4", createdAt: Date.now() },
                    ["0x0_5"]: { address: "0x0", tokenId: "5", createdAt: Date.now() },
                    ["0x0_6"]: { address: "0x0", tokenId: "6", createdAt: Date.now() },
                },
            },
        }

        renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockNftState({ favoriteNfts }),
            },
        })

        expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    })

    it("should pass excludeCollections to API when blacklisted collections exist", async () => {
        const blacklistedAddress = "0x1111111111111111111111111111111111111111"

        const { waitFor } = renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockNftState({
                    blackListedAddresses: [blacklistedAddress],
                }),
            },
        })

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(
                "/api/v1/nfts",
                expect.objectContaining({
                    params: {
                        query: expect.objectContaining({
                            excludeCollections: [blacklistedAddress],
                        }),
                    },
                }),
            )
        })
    })

    it("should combine blacklisted and reported collections in excludeCollections", async () => {
        const blacklistedAddress = "0x1111111111111111111111111111111111111111"
        const reportedAddress = "0x2222222222222222222222222222222222222222"

        const { waitFor } = renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockNftState({
                    blackListedAddresses: [blacklistedAddress],
                    reportedAddresses: [reportedAddress],
                }),
            },
        })

        await waitFor(() => {
            expect(mockGet).toHaveBeenCalledWith(
                "/api/v1/nfts",
                expect.objectContaining({
                    params: {
                        query: expect.objectContaining({
                            excludeCollections: expect.arrayContaining([blacklistedAddress, reportedAddress]),
                        }),
                    },
                }),
            )
        })
    })

    it("should deduplicate addresses in excludeCollections", async () => {
        const duplicateAddress = "0x1111111111111111111111111111111111111111"

        const { waitFor } = renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockNftState({
                    blackListedAddresses: [duplicateAddress],
                    reportedAddresses: [duplicateAddress.toUpperCase()],
                }),
            },
        })

        await waitFor(() => {
            const call = mockGet.mock.calls[mockGet.mock.calls.length - 1]
            const excludeCollections = call[1].params.query.excludeCollections
            expect(excludeCollections).toHaveLength(1)
        })
    })

    it("should not include excludeCollections parameter when no collections are excluded", async () => {
        const { waitFor } = renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockNftState(),
            },
        })

        await waitFor(() => {
            const call = mockGet.mock.calls[mockGet.mock.calls.length - 1]
            const queryParams = call[1].params.query
            expect(queryParams.excludeCollections).toBeUndefined()
        })
    })

    it("should include excludeCollections in queryKey for cache invalidation", async () => {
        const blacklistedAddress = "0x1111111111111111111111111111111111111111"

        renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createMockNftState({
                    blackListedAddresses: [blacklistedAddress],
                }),
            },
        })

        const lastCall = (useQuery as jest.Mock).mock.calls[(useQuery as jest.Mock).mock.calls.length - 1]
        const queryKey = lastCall[0].queryKey
        expect(queryKey[queryKey.length - 1]).toEqual([blacklistedAddress])
    })
})
