import axios from "axios"
import { getNftsForContract } from "./getNftsForContract"
import { NFTS_OWNED_PER_CONTRACT } from "./VechainIndexer"

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
            contractAddress,
            ownerAddress,
            resultsPerPage,
            page,
        )

        expect(nfts).toEqual(responseData)

        expect(axios.get).toHaveBeenCalledWith(
            NFTS_OWNED_PER_CONTRACT(
                ownerAddress,
                contractAddress,
                resultsPerPage,
                page,
            ),
        )
    })
})
