import { NETWORK_TYPE, NFTMediaType } from "~Model"
import { NftSlice, NftSliceState, toggleBlackListCollection, toggleFavorite, toggleFavoriteCollection } from "./Nft"
import HexUtils from "~Utils/HexUtils"

const initialState: NftSliceState = {
    nfts: {},
    collections: {},
    collectionRegistryInfo: {
        [NETWORK_TYPE.MAIN]: [],
        [NETWORK_TYPE.TEST]: [],
        [NETWORK_TYPE.SOLO]: [],
        [NETWORK_TYPE.OTHER]: [],
    },
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
    favoriteCollections: {},
}

describe("NftSlice", () => {
    it("should add a favorite nft", () => {
        jest.spyOn(Date, "now").mockReturnValue(1719859200000)
        const state = NftSlice.reducer(
            initialState,
            toggleFavorite({
                address: "0x1234567890abcdef1234567890abcdef12345678",
                tokenId: "1",
                owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            }),
        )
        expect(state.favoriteNfts).toMatchObject({
            ["0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"]: {
                [HexUtils.normalize("0xCF130b42Ae33C5531277B4B7c0F1D994B8732957")]: {
                    ["0x1234567890abcdef1234567890abcdef12345678_1"]: {
                        address: "0x1234567890abcdef1234567890abcdef12345678",
                        tokenId: "1",
                        createdAt: 1719859200000,
                    },
                },
            },
        })
    })

    it("should remove a favorite nft", () => {
        const state = NftSlice.reducer(
            initialState,
            toggleFavorite({
                address: "0x1234567890abcdef1234567890abcdef12345678",
                tokenId: "1",
                owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            }),
        )
        expect(state.favoriteNfts).toMatchObject({
            ["0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"]: {
                [HexUtils.normalize("0xCF130b42Ae33C5531277B4B7c0F1D994B8732957")]: {},
            },
        })
    })

    it("should add a favorite collection", () => {
        jest.spyOn(Date, "now").mockReturnValue(1719859200000)
        const state = NftSlice.reducer(
            initialState,
            toggleFavoriteCollection({
                address: "0x1234567890abcdef1234567890abcdef12345678",
                owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            }),
        )
        expect(state.favoriteCollections).toMatchObject({
            ["0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"]: {
                [HexUtils.normalize("0xCF130b42Ae33C5531277B4B7c0F1D994B8732957")]: {
                    ["0x1234567890abcdef1234567890abcdef12345678"]: {
                        address: "0x1234567890abcdef1234567890abcdef12345678",
                        createdAt: 1719859200000,
                    },
                },
            },
        })
    })

    it("should remove a favorite collection", () => {
        const state = NftSlice.reducer(
            initialState,
            toggleFavoriteCollection({
                address: "0x1234567890abcdef1234567890abcdef12345678",
                owner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            }),
        )
        expect(state.favoriteCollections).toMatchObject({
            ["0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"]: {
                [HexUtils.normalize("0xCF130b42Ae33C5531277B4B7c0F1D994B8732957")]: {},
            },
        })
    })

    it("should add collection to black list", () => {
        const state = NftSlice.reducer(
            initialState,
            toggleBlackListCollection({
                network: NETWORK_TYPE.MAIN,
                collection: {
                    address: "0x1234567890abcdef1234567890abcdef12345678",
                    name: "Test Collection",
                    symbol: "TEST",
                    creator: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    fromRegistry: false,
                    description: "Test Description",
                    image: "Test Image",
                    totalSupply: 10000,
                    id: "test-collection",
                    mediaType: NFTMediaType.IMAGE,
                    updated: false,
                },
                accountAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
            }),
        )
        expect(state.blackListedCollections).toMatchObject({
            [NETWORK_TYPE.MAIN]: {
                ["0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"]: {
                    addresses: ["0x1234567890abcdef1234567890abcdef12345678"],
                },
            },
        })
    })

    it("should remove collection from black list", () => {
        const state = NftSlice.reducer(
            initialState,
            toggleBlackListCollection({
                network: NETWORK_TYPE.MAIN,
                collection: {
                    address: "0x1234567890abcdef1234567890abcdef12345678",
                    name: "Test Collection",
                    symbol: "TEST",
                    creator: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    fromRegistry: false,
                    description: "Test Description",
                    image: "Test Image",
                    totalSupply: 10000,
                    id: "test-collection",
                    mediaType: NFTMediaType.IMAGE,
                    updated: false,
                },
                accountAddress: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
            }),
        )
        expect(state.blackListedCollections).toMatchObject({
            [NETWORK_TYPE.MAIN]: {
                ["0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"]: {},
            },
        })
    })
})
