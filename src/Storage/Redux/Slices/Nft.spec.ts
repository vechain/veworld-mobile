import { GithubCollectionResponse } from "~Networking"
import {
    NftSlice,
    NftSliceState,
    initialStateNft,
    setCollectionRegistryInfo,
} from "./Nft"
import { NETWORK_TYPE } from "~Model"

const collectionRegistryInfo: GithubCollectionResponse = {
    address: "0xb81e9c5f9644dec9e5e3cac86b4461a222072302",
    name: "Vechain Node Token",
    creator: "Vechain",
    description: "X- and Economy Nodes",
    icon: "assets/1faa8ad85803b1721a0d772ddfbbbcf599da226b.webp",
    marketplaces: [
        {
            name: "VeChainStats",
            link: "https://manager.vechainstats.com/vnt-marketplace",
        },
    ],
    chainData: {
        supportsInterface: {
            erc20: false,
            erc165: true,
            erc712: false,
            erc721: false,
            erc721Metadata: true,
            erc721Enumerable: false,
            erc721Receiver: false,
            erc777: false,
            erc1155: false,
            erc1820: false,
            erc2981: false,
            erc5643: false,
        },
        name: "VeChain Node Token",
    },
}

describe("NftSlice", () => {
    let initialState: NftSliceState
    beforeEach(() => {
        initialState = { ...initialStateNft }
    })

    it("should add collection registry info", () => {
        const nextState = NftSlice.reducer(
            initialState,
            setCollectionRegistryInfo({
                registryInfo: [collectionRegistryInfo],
                network: NETWORK_TYPE.MAIN,
            }),
        )
        const registryInfo =
            nextState.collectionRegistryInfo[NETWORK_TYPE.MAIN].registryInfo
        expect(registryInfo.length).toBe(1)
        expect(registryInfo[0].address).toBe(collectionRegistryInfo.address)
        expect(
            nextState.collectionRegistryInfo[NETWORK_TYPE.TEST],
        ).toBeUndefined()
    })
})
