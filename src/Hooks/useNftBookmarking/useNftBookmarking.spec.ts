import { renderHook, act } from "@testing-library/react-hooks"
import { useNftBookmarking } from "./useNftBookmarking"
import { TestWrapper } from "~Test"
import { NftSliceState } from "~Storage/Redux/Slices/Nft"
import { Network, NETWORK_TYPE } from "~Model"
import { HexUtils } from "~Utils"

const TEST_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678"
const TEST_TOKEN_ID = "1"
const TEST_GENESIS_ID = "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"
const OWNER_ADDRESS = "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"

const testNetwork: Network = {
    id: NETWORK_TYPE.TEST,
    name: "testnet",
    type: NETWORK_TYPE.TEST,
    defaultNet: true,
    urls: ["https://testnet.vechain.com"],
    currentUrl: "https://testnet.vechain.com",
    explorerUrl: "https://explore-testnet.vechain.org",
    genesis: {
        id: TEST_GENESIS_ID,
        number: 0,
        timestamp: 0,
        parentID: "",
        gasLimit: 0,
        beneficiary: "",
        gasUsed: 0,
        totalScore: 0,
        txsRoot: "",
        txsFeatures: 0,
        stateRoot: "",
        receiptsRoot: "",
        signer: "",
        isTrunk: true,
        size: 0,
        transactions: [],
    },
}

const createMockNftState = (hasFavorite: boolean): NftSliceState => {
    const normalizedOwner = HexUtils.normalize(OWNER_ADDRESS)
    const normalizedAddress = HexUtils.normalize(TEST_ADDRESS)

    return {
        collectionRegistryInfo: {
            [NETWORK_TYPE.MAIN]: [],
            [NETWORK_TYPE.TEST]: [],
            [NETWORK_TYPE.SOLO]: [],
            [NETWORK_TYPE.OTHER]: [],
        },
        collections: {},
        nfts: {},
        blackListedCollections: {
            [NETWORK_TYPE.MAIN]: {},
            [NETWORK_TYPE.TEST]: {},
            [NETWORK_TYPE.SOLO]: {},
            [NETWORK_TYPE.OTHER]: {},
        },
        reportedCollections: {
            [NETWORK_TYPE.MAIN]: {},
            [NETWORK_TYPE.TEST]: {},
            [NETWORK_TYPE.SOLO]: {},
            [NETWORK_TYPE.OTHER]: {},
        },
        isLoading: false,
        error: undefined,
        favoriteNfts: hasFavorite
            ? {
                  [TEST_GENESIS_ID]: {
                      [normalizedOwner]: {
                          [`${normalizedAddress}_${TEST_TOKEN_ID}`]: {
                              address: normalizedAddress,
                              tokenId: TEST_TOKEN_ID,
                              createdAt: Date.now(),
                          },
                      },
                  },
              }
            : {},
        favoriteCollections: {},
    }
}

describe("useNftBookmarking", () => {
    it("should identify a non-favorited NFT correctly", () => {
        // GIVEN an NFT that is not favorited
        const { result } = renderHook(() => useNftBookmarking(TEST_ADDRESS, TEST_TOKEN_ID), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    nft: {
                        ...createMockNftState(false),
                        _persist: { version: -1, rehydrated: true },
                    },
                    network: {
                        selectedNetwork: testNetwork,
                    },
                },
            },
        })

        // THEN it should not be marked as favorite
        expect(result.current.isFavorite).toBe(false)
    })

    it("should add a favorite when toggled on a non-favorited NFT", async () => {
        // GIVEN an NFT that is not favorited
        const { result, waitFor } = renderHook(() => useNftBookmarking(TEST_ADDRESS, TEST_TOKEN_ID), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    nft: {
                        ...createMockNftState(false),
                        _persist: { version: -1, rehydrated: true },
                    },
                    network: {
                        selectedNetwork: testNetwork,
                    },
                },
            },
        })

        // WHEN toggling the favorite
        await act(async () => {
            result.current.toggleFavorite()
        })

        // THEN it should be marked as favorite
        await waitFor(() => {
            expect(result.current.isFavorite).toBe(true)
        })
    })

    it("should toggle a favorite off when called twice", async () => {
        // GIVEN an NFT that is not favorited
        const { result, waitFor } = renderHook(() => useNftBookmarking(TEST_ADDRESS, TEST_TOKEN_ID), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    nft: {
                        ...createMockNftState(false),
                        _persist: { version: -1, rehydrated: true },
                    },
                    network: {
                        selectedNetwork: testNetwork,
                    },
                },
            },
        })

        // WHEN toggling the favorite on, then off
        await act(async () => {
            result.current.toggleFavorite()
        })

        await waitFor(() => {
            expect(result.current.isFavorite).toBe(true)
        })

        await act(async () => {
            result.current.toggleFavorite()
        })

        // THEN it should no longer be marked as favorite
        await waitFor(() => {
            expect(result.current.isFavorite).toBe(false)
        })
    })
})
