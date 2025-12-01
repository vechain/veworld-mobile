import { renderHook } from "@testing-library/react-hooks"
import { useQuery } from "@tanstack/react-query"

import { TestWrapper } from "~Test"

import { defaultMainNetwork } from "~Constants"
import { HexUtils } from "~Utils"

import { useHomeCollectibles } from "./useHomeCollectibles"

jest.mock("~Hooks/useIndexerClient", () => ({
    useIndexerClient: jest.fn().mockReturnValue({
        GET: jest.fn().mockResolvedValue({
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
        }),
    }),
}))

describe("useHomeCollectibles", () => {
    beforeEach(() => {
        jest.clearAllMocks()
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
        renderHook(() => useHomeCollectibles(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    nft: {
                        favoriteNfts: {
                            [defaultMainNetwork.genesis.id]: {
                                [HexUtils.normalize("0xCF130b42Ae33C5531277B4B7c0F1D994B8732957")]: {
                                    ["0x0_1"]: {
                                        address: "0x0",
                                        tokenId: "1",
                                        createdAt: Date.now(),
                                    },
                                    ["0x0_2"]: {
                                        address: "0x0",
                                        tokenId: "2",
                                        createdAt: Date.now(),
                                    },
                                    ["0x0_3"]: {
                                        address: "0x0",
                                        tokenId: "3",
                                        createdAt: Date.now(),
                                    },
                                    ["0x0_4"]: {
                                        address: "0x0",
                                        tokenId: "4",
                                        createdAt: Date.now(),
                                    },
                                    ["0x0_5"]: {
                                        address: "0x0",
                                        tokenId: "5",
                                        createdAt: Date.now(),
                                    },
                                    ["0x0_6"]: {
                                        address: "0x0",
                                        tokenId: "6",
                                        createdAt: Date.now(),
                                    },
                                },
                            },
                        },
                        blackListedCollections: {
                            mainnet: {},
                            other: {},
                            solo: {},
                            testnet: {},
                        },
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
                        reportedCollections: {
                            mainnet: {},
                            other: {},
                            solo: {},
                            testnet: {},
                        },
                        _persist: {
                            version: 31,
                            rehydrated: true,
                        },
                    },
                },
            },
        })

        expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    })
})
