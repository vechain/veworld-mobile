import { renderHook } from "@testing-library/react-hooks"
import { useBalanceActivities } from "./useBalanceActivities"
import { TestWrapper } from "~Test"
import { fetchIndexedHistoryEvent } from "~Networking"
import { ActivityEvent } from "~Model"
import { defaultMainNetwork } from "~Constants"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchIndexedHistoryEvent: jest.fn(),
}))

const TEST_DATA = [
    {
        id: "350fa4b956af1fec6d83a0766606e940cd443321",
        blockId: "0x015b8a83e168b4116d3b498029fd2a6cd07e827916b6d2cade87f11df4f0dbda",
        blockNumber: 22776451,
        blockTimestamp: 1758294900,
        txId: "0x09413798712cba97418f00ba0ff594c7829d86d308702cba3deaa48826b4a3f0",
        origin: "0x3f90bf8b314c42005103b3c94505634fa680dcee",
        gasPayer: "0xe292d1f996aba6311d627cfc20cabfde0aab7c78",
        eventName: "TRANSFER_VET",
        to: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        from: "0x3f90bf8b314c42005103b3c94505634fa680dcee",
        value: "1000000000000000000",
    },
    {
        id: "c1e4b56d24ed3d79276261b85a0706df4f4d0a4d",
        blockId: "0x015b482d54f6be0954c0f4e9db49d875322385ef4558d88b136042fd1b77a093",
        blockNumber: 22759469,
        blockTimestamp: 1758125070,
        txId: "0xff2b9afe364ef1eaf5cb7683bbe797e8ba79676eb9580f06c6fb6e08c9bcec9e",
        origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        gasPayer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        reverted: true,
        eventName: "UNKNOWN_TX",
    },
    {
        id: "b10ff9555c1b6deb97ad7add3bb0faa106218996",
        blockId: "0x01598f73bf4e5599b0e9534205fc8169ffd13864fb88539535d090c1cfdec0ac",
        blockNumber: 22646643,
        blockTimestamp: 1756996650,
        txId: "0x6826c8832f49dfef2df672e60bdc8dd3db417318432e30acf653c2b6ffec80e7",
        origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        gasPayer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        reverted: true,
        eventName: "UNKNOWN_TX",
    },
    {
        id: "bb630aa5dfc3fb0b7f87cee897efba293efc03cc",
        blockId: "0x01598735db8f2fe12a29ca7bdea1deab8ad2cc6a110a59b273cd8bea5fbddc03",
        blockNumber: 22644533,
        blockTimestamp: 1756975550,
        txId: "0x7509ebfcfef150d13f85eb0066be8bb32518cf0e5f81efcc58f89d06360d266c",
        origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        gasPayer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        reverted: true,
        eventName: "UNKNOWN_TX",
    },
    {
        id: "bd89406f41549c3db1822e3ede75fd37842ad788",
        blockId: "0x0159873365f176b68fa7862c0919db7b5985aacd5dbc38cad01fc9311ce9d04a",
        blockNumber: 22644531,
        blockTimestamp: 1756975530,
        txId: "0x844fefe83ebe80227f76e8566839c355038638ba1ed6afabdd652074394fa15f",
        origin: "0x6f63df9d516b2d164da6d2494e00a62982c17b69",
        gasPayer: "0x6f63df9d516b2d164da6d2494e00a62982c17b69",
        contractAddress: "0x0000000000000000000000000000456e65726779",
        eventName: "TRANSFER_FT",
        to: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        from: "0x6f63df9d516b2d164da6d2494e00a62982c17b69",
        value: "1000000000000000000",
    },
    {
        id: "da1ea1d27620d8f8d9be1909dd49e6d5c8b65faf",
        blockId: "0x0159871e53f90dd39c85d220117f86625a580b00cf139e01cf87f86456dcdf86",
        blockNumber: 22644510,
        blockTimestamp: 1756975320,
        txId: "0x85550e9839e8ba106362b014067317277707faf817148b837d30dec6f6d7a34d",
        origin: "0x6f63df9d516b2d164da6d2494e00a62982c17b69",
        gasPayer: "0x6f63df9d516b2d164da6d2494e00a62982c17b69",
        contractAddress: "0x0000000000000000000000000000456e65726779",
        eventName: "TRANSFER_FT",
        to: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        from: "0x6f63df9d516b2d164da6d2494e00a62982c17b69",
        value: "240000000000000000",
    },
    {
        id: "2b4bf701318981da75414ef23a0fce57d8225996",
        blockId: "0x0158a57e26d959ffedf2429756f7e4f2a884d4b3a7cae544109758a0871a02b1",
        blockNumber: 22586750,
        blockTimestamp: 1756397440,
        txId: "0xea484f8daca07828d1fe9a8b507c17604aab6cc64b527f4ae2ea51244d1ab2df",
        origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        gasPayer: "0x2bee508f93db71d912422650edb41b0d9d1f754b",
        eventName: "UNKNOWN_TX",
    },
    {
        id: "dab32fd35d23ea7dca8e55995fd46671a8ef1013",
        blockId: "0x0157fa006bfadda739f814729955ddebe1d723334a45985a6497db14566a0dda",
        blockNumber: 22542848,
        blockTimestamp: 1755958270,
        txId: "0x45660676c721e91dd1cb6d4d0cca6dab446463db8d80b566282b819305c58e3b",
        origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        contractAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        eventName: "TRANSFER_FT",
        to: "0x9830c04bfacac52a9833df8b2a37c37e62a7ba39",
        from: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        value: "2708208011102343500",
    },
    {
        id: "3501b49c180ea7716805e6f8cfcb301a66f7944f",
        blockId: "0x0157fa006bfadda739f814729955ddebe1d723334a45985a6497db14566a0dda",
        blockNumber: 22542848,
        blockTimestamp: 1755958270,
        txId: "0x45660676c721e91dd1cb6d4d0cca6dab446463db8d80b566282b819305c58e3b",
        origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        eventName: "B3TR_SWAP_B3TR_TO_VOT3",
        to: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
        from: "0x9830c04bfacac52a9833df8b2a37c37e62a7ba39",
        inputToken: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        outputToken: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
        inputValue: "2708208011102343500",
        outputValue: "2708208011102343500",
    },
    {
        id: "029c50baf6dc365ff50b0f99056d629f3c21e355",
        blockId: "0x0157f9fc7fd10968c081e521d667a622cd2d222285888affa10ec1e5838f3b39",
        blockNumber: 22542844,
        blockTimestamp: 1755958230,
        txId: "0xc5544ff95f4d129512b462357c6746a4bb6996eb9a2a6b1827189572266850fa",
        origin: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
        contractAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        eventName: "TRANSFER_FT",
        to: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        from: "0x9830c04bfacac52a9833df8b2a37c37e62a7ba39",
        value: "2150000000000000000",
    },
]

describe("useBalanceActivities", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return the proper data", async () => {
        ;(fetchIndexedHistoryEvent as jest.Mock).mockResolvedValue({
            data: TEST_DATA,
        })
        const { result, waitFor } = renderHook(() => useBalanceActivities({ tab: "TOKENS" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(4)
            expect(fetchIndexedHistoryEvent).toHaveBeenCalledWith(
                "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                0,
                defaultMainNetwork,
                [
                    ActivityEvent.SWAP_FT_TO_FT,
                    ActivityEvent.SWAP_FT_TO_VET,
                    ActivityEvent.SWAP_VET_TO_FT,
                    ActivityEvent.TRANSFER_FT,
                    ActivityEvent.TRANSFER_SF,
                    ActivityEvent.TRANSFER_VET,
                    ActivityEvent.B3TR_ACTION,
                    ActivityEvent.B3TR_CLAIM_REWARD,
                    ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
                    ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
                    ActivityEvent.B3TR_UPGRADE_GM,
                ],
            )
        })
    })
    it("should return the data based on the correct tab (STAKING)", async () => {
        ;(fetchIndexedHistoryEvent as jest.Mock).mockResolvedValue({
            data: TEST_DATA,
        })
        const { result, waitFor } = renderHook(() => useBalanceActivities({ tab: "STAKING" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(4)
            expect(fetchIndexedHistoryEvent).toHaveBeenCalledWith(
                "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                0,
                defaultMainNetwork,
                [
                    ActivityEvent.STARGATE_CLAIM_REWARDS_BASE,
                    ActivityEvent.STARGATE_CLAIM_REWARDS_DELEGATE,
                    ActivityEvent.STARGATE_DELEGATE,
                    ActivityEvent.STARGATE_DELEGATE_ONLY,
                    ActivityEvent.STARGATE_STAKE,
                    ActivityEvent.STARGATE_UNDELEGATE,
                    ActivityEvent.STARGATE_UNSTAKE,
                ],
            )
        })
    })
    it("should return the data based on the correct tab (COLLECTIBLES)", async () => {
        ;(fetchIndexedHistoryEvent as jest.Mock).mockResolvedValue({
            data: TEST_DATA,
        })
        const { result, waitFor } = renderHook(() => useBalanceActivities({ tab: "COLLECTIBLES" }), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.data).toHaveLength(4)
            expect(fetchIndexedHistoryEvent).toHaveBeenCalledWith(
                "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                0,
                defaultMainNetwork,
                [ActivityEvent.NFT_SALE, ActivityEvent.TRANSFER_NFT],
            )
        })
    })
})
