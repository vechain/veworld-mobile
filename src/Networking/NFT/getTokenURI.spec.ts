import { ThorClient } from "@vechain/sdk-network"
import { getCachedTokenURI, getTokenURI } from "./getTokenURI"

describe("getTokenURI", () => {
    it("should return the token URI", async () => {
        const tokenURI = await getTokenURI(
            "8",
            "0x38a59fa7fd7039884465a0ff285b8c4b6fe394ca",
            ThorClient.at("https://testnet.vechain.org"),
        )
        expect(tokenURI).toBe("ipfs://bafybeiddvilqgyvhwhiiqrx36vfcnsfdkk4vjhrsjxkoc3oin3xrwfphfq/metadata/1.json")
    })
})

describe("getCachedTokenURI", () => {
    it("should return the token URI", async () => {
        const tokenURI = await getCachedTokenURI(
            "8",
            "0x38a59fa7fd7039884465a0ff285b8c4b6fe394ca",
            "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            ThorClient.at("https://testnet.vechain.org"),
        )
        expect(tokenURI).toBe("ipfs://bafybeiddvilqgyvhwhiiqrx36vfcnsfdkk4vjhrsjxkoc3oin3xrwfphfq/metadata/1.json")
    })
})
