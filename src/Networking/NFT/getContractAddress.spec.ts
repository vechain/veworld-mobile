import axios from "axios"
import { getContractAddresses } from "./getContractAddresses"
import { NFT_CONTRACTS_FOR_ADDRESS } from "~Common"

jest.mock("axios")

describe("getContractAddresses", () => {
    it("should return the contract addresses for the owner address", async () => {
        const ownerAddress = "0x123456789"

        const responseData = ["0xContract1", "0xContract2"]
        ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData })

        const contractAddresses = await getContractAddresses(ownerAddress)

        expect(contractAddresses).toEqual(responseData)
        expect(axios.get).toHaveBeenCalledWith(
            NFT_CONTRACTS_FOR_ADDRESS(ownerAddress),
        )
    })
})
