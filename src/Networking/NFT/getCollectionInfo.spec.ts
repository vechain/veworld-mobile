import axios from "axios"
import { getCollectionInfo } from "./getCollectionInfo"
import { NETWORK_TYPE } from "~Model"
import { GH_NFT_REGISTRY } from "~Constants"
import { NFT_AXIOS_TIMEOUT } from "~Constants/Constants/NFT"

jest.mock("axios")

describe("getCollectionInfo", () => {
    it("should return the collection info for the main network", async () => {
        const net = NETWORK_TYPE.MAIN

        const responseData = [
            { name: "Collection 1" },
            { name: "Collection 2" },
        ]

        ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData })

        const collectionInfo = await getCollectionInfo(net)

        expect(collectionInfo).toEqual(responseData)
        expect(axios.get).toHaveBeenCalledWith(GH_NFT_REGISTRY(net), {
            timeout: NFT_AXIOS_TIMEOUT,
        })
    })

    it("should return the collection info for the test network", async () => {
        const net = NETWORK_TYPE.TEST

        const responseData = [
            { name: "Test Collection 1" },
            { name: "Test Collection 2" },
        ]

        ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData })

        const collectionInfo = await getCollectionInfo(net)

        expect(collectionInfo).toEqual(responseData)
        expect(axios.get).toHaveBeenCalledWith(GH_NFT_REGISTRY(net), {
            timeout: NFT_AXIOS_TIMEOUT,
        })
    })

    it("should return the collection info for the default network", async () => {
        const net = "unknown_network"

        const responseData = [
            { name: "Default Collection 1" },
            { name: "Default Collection 2" },
        ]

        ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: responseData })

        const collectionInfo = await getCollectionInfo(net as NETWORK_TYPE)

        expect(collectionInfo).toEqual(responseData)
        expect(axios.get).toHaveBeenCalledWith(
            GH_NFT_REGISTRY(net as NETWORK_TYPE),
            { timeout: NFT_AXIOS_TIMEOUT },
        )
    })
})
