import { TestHelpers } from "~Test"
import TransfersUtils from "./"
import { VET } from "~Common/Constant"

const thor = TestHelpers.thor.mockThorInstance({})

describe("TransfersUtils", () => {
    it("should return the correct amount of transfers", async () => {
        const transfers = await TransfersUtils.getTransfers({
            thor,
            token: VET,
            accountAddress: "0x0000000000",
            fromBlock: 0,
            toBlock: 100,
            offset: 0,
            size: 10,
        })

        expect(transfers.length).toEqual(10)
    })
})
