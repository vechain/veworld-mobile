// Mock Platform globally
Object.defineProperty(global, "Platform", {
    get: jest.fn(() => ({ OS: "ios", select: jest.fn(obj => obj.ios) })),
})

// Mock analytics tracking
jest.mock("~Hooks/useAnalyticTracking", () => ({
    useAnalyticTracking: jest.fn(() => jest.fn()),
}))

// Mock Utils with PlatformUtils
jest.mock("~Utils", () => ({
    ...jest.requireActual("~Utils"),
    PlatformUtils: {
        isAndroid: jest.fn(() => false),
        isIOS: jest.fn(() => true),
    },
}))

import { renderHook, act } from "@testing-library/react-hooks"
import { useCollectionsBookmarking } from "./useCollectionsBookmarking"
import { TestWrapper } from "~Test"
import { NftSliceState } from "~Storage/Redux/Slices/Nft"
import { Network, NETWORK_TYPE } from "~Model"
import { HexUtils } from "~Utils"

const TEST_COLLECTION_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678"
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
    const normalizedAddress = HexUtils.normalize(TEST_COLLECTION_ADDRESS)

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
        favoriteNfts: {},
        favoriteCollections: hasFavorite
            ? {
                  [TEST_GENESIS_ID]: {
                      [normalizedOwner]: {
                          [normalizedAddress]: {
                              address: normalizedAddress,
                              createdAt: Date.now(),
                          },
                      },
                  },
              }
            : {},
    }
}

describe("useCollectionsBookmarking", () => {
    it("should identify a non-favorited collection correctly", () => {
        const { result } = renderHook(() => useCollectionsBookmarking(TEST_COLLECTION_ADDRESS), {
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

        expect(result.current.isFavorite).toBe(false)
    })

    it("should identify a favorited collection correctly", () => {
        const { result } = renderHook(() => useCollectionsBookmarking(TEST_COLLECTION_ADDRESS), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    nft: {
                        ...createMockNftState(true),
                        _persist: { version: -1, rehydrated: true },
                    },
                    network: {
                        selectedNetwork: testNetwork,
                    },
                },
            },
        })

        expect(result.current.isFavorite).toBe(true)
    })

    it("should add a favorite when toggled on a non-favorited collection", async () => {
        const { result, waitFor } = renderHook(() => useCollectionsBookmarking(TEST_COLLECTION_ADDRESS), {
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

        await act(async () => {
            result.current.toggleFavoriteCollection()
        })

        await waitFor(() => {
            expect(result.current.isFavorite).toBe(true)
        })
    })

    it("should remove a favorite when toggled on a favorited collection", async () => {
        const { result, waitFor } = renderHook(() => useCollectionsBookmarking(TEST_COLLECTION_ADDRESS), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    nft: {
                        ...createMockNftState(true),
                        _persist: { version: -1, rehydrated: true },
                    },
                    network: {
                        selectedNetwork: testNetwork,
                    },
                },
            },
        })

        await act(async () => {
            result.current.toggleFavoriteCollection()
        })

        await waitFor(() => {
            expect(result.current.isFavorite).toBe(false)
        })
    })

    it("should toggle a favorite off when called twice", async () => {
        const { result, waitFor } = renderHook(() => useCollectionsBookmarking(TEST_COLLECTION_ADDRESS), {
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

        await act(async () => {
            result.current.toggleFavoriteCollection()
        })

        await waitFor(() => {
            expect(result.current.isFavorite).toBe(true)
        })

        await act(async () => {
            result.current.toggleFavoriteCollection()
        })

        await waitFor(() => {
            expect(result.current.isFavorite).toBe(false)
        })
    })

    it("should handle address normalization correctly", () => {
        const nonNormalizedAddress = "0xABCDEF1234567890ABCDEF1234567890ABCDEF12"
        const { result } = renderHook(() => useCollectionsBookmarking(nonNormalizedAddress), {
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

        expect(result.current.isFavorite).toBe(false)
        expect(result.current.toggleFavoriteCollection).toBeDefined()
    })
})
