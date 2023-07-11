import axios from "axios"
import { getNftsForContract } from "./getNftsForContract"
import { NFTS_OWNED_PER_CONTRACT } from "~Constants"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NETWORK_TYPE } from "~Model"

jest.mock("axios")

describe("getNftsForContract", () => {
    it("should return the NFTs owned by the contract address", async () => {
        const contractAddress = "0xContractAddress"
        const ownerAddress = "0xOwnerAddress"
        const resultsPerPage = 99999999
        const page = 0

        const responseData = [
            {
                tokenId: 1,
                contractAddress: "0xContractAddress",
                owner: "0xOwnerAddress",
            },
            {
                tokenId: 2,
                contractAddress: "0xContractAddress",
                owner: "0xOwnerAddress",
            },
        ]
        ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData })

        const nfts = await getNftsForContract(
            NETWORK_TYPE.MAIN,
            contractAddress,
            ownerAddress,
            resultsPerPage,
            page,
        )

        expect(nfts).toEqual(responseData)

        expect(axios.get).toHaveBeenCalledWith(
            NFTS_OWNED_PER_CONTRACT(
                NETWORK_TYPE.MAIN,
                ownerAddress,
                contractAddress,
                resultsPerPage,
                page,
            ),
            { timeout: NFT_AXIOS_TIMEOUT },
        )
    })
})
