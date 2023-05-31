import axios from "axios"
import { GH_NFT_REGISTRY } from "~Common/Constant/NftRegistry"
import { NETWORK_TYPE } from "~Model"

export type GithubCollectionResponse = {
    address: string
    name: string
    creator: string
    description: string
    icon: string
    marketplaces: [
        {
            name: string
            link: string
        },
    ]
    chainData: {
        supportsInterface: {
            erc20: boolean
            erc165: boolean
            erc712: boolean
            erc721: boolean
            erc721Metadata: boolean
            erc721Enumerable: boolean
            erc721Receiver: boolean
            erc777: boolean
            erc1155: boolean
            erc1820: boolean
            erc2981: boolean
            erc5643: boolean
        }
        name: string
    }
}

export const getCollectionInfo = async (
    net: NETWORK_TYPE,
): Promise<GithubCollectionResponse[]> => {
    switch (net) {
        case NETWORK_TYPE.MAIN:
            const resMain = await axios.get<GithubCollectionResponse[]>(
                GH_NFT_REGISTRY(net),
            )
            return resMain.data
        case NETWORK_TYPE.TEST:
            const resTest = await axios.get<GithubCollectionResponse[]>(
                GH_NFT_REGISTRY(net),
            )
            return resTest.data
        default:
            const resDefault = await axios.get<GithubCollectionResponse[]>(
                GH_NFT_REGISTRY(net),
            )
            return resDefault.data
    }
}
