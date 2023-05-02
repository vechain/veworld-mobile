import { TestHelpers } from "~Test"
import TransfersUtils from "./"
import { VET, VTHO } from "~Common/Constant"

const thor = TestHelpers.thor.mockThorInstance({})

const filterStub = TestHelpers.thor.stubs.filter.filter

describe("TransfersUtils", () => {
    it("VET - should return the correct amount of transfers", async () => {
        const transfers = await TransfersUtils.getTransfers({
            thor,
            token: VET,
            accountAddress: "0x0000000000",
            fromBlock: 0,
            toBlock: 100,
            offset: 0,
            size: 10,
        })

        expect(transfers.length).toEqual(
            (await filterStub("transfer", []).apply(0, 0)).length,
        )
    })

    it("VET - account === item.sender,  should return the correct amount of transfers", async () => {
        const transfers = await TransfersUtils.getTransfers({
            thor,
            token: VET,
            accountAddress: TestHelpers.data.account1D2.address,
            fromBlock: 0,
            toBlock: 100,
            offset: 0,
            size: 10,
        })

        expect(transfers.length).toEqual(
            (await filterStub("transfer", []).apply(0, 0)).length,
        )
    })

    it("Other token - should return the correct amount of transfers", async () => {
        const transfers = await TransfersUtils.getTransfers({
            thor,
            token: VTHO,
            accountAddress: "0x9652aead889e8df7b5717ed984f147c132f85a69",
            fromBlock: 0,
            toBlock: 100,
            offset: 0,
            size: 10,
        })

        expect(transfers.length).toEqual(
            (await filterStub("event", []).apply(0, 0)).length,
        )
    })
})
