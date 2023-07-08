import axios from "axios"
import { getContractAddresses } from "./getContractAddresses"
import { NFT_CONTRACTS_FOR_ADDRESS } from "~Constants"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"
import { NETWORK_TYPE } from "~Model"

jest.mock("axios")

describe("getContractAddresses", () => {
    it("should return the contract addresses for the owner address", async () => {
        const ownerAddress = "0x123456789"

        const responseData = ["0xContract1", "0xContract2"]
        ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData })

        const contractAddresses = await getContractAddresses(
            NETWORK_TYPE.MAIN,
            ownerAddress,
            10,
            0,
        )

        expect(contractAddresses).toEqual(responseData)
        expect(axios.get).toHaveBeenCalledWith(
            NFT_CONTRACTS_FOR_ADDRESS(NETWORK_TYPE.MAIN, ownerAddress, 10, 0),
            { timeout: NFT_AXIOS_TIMEOUT },
        )
    })
})
