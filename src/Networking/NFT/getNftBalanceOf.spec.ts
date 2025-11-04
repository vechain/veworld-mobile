import { ThorClient } from "@vechain/sdk-network"
import { getCachedNftBalanceOf } from "./getNftBalanceOf"

describe("getNftBalanceOf", () => {
    it("should return the balance of the NFT", async () => {
        const balance = await getCachedNftBalanceOf(
            "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
            "0x38a59fa7fd7039884465a0ff285b8c4b6fe394ca",
            "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            ThorClient.at("https://testnet.vechain.org"),
        )

        expect(balance).toBe(2)
    })
})
