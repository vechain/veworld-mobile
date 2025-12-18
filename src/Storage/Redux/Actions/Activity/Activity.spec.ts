import { ReceiptProcessor } from "~Services/AbiService/ReceiptProcessor"
import { validateAndUpsertActivity } from "./Activity"
import { GenericAbiManager } from "~Services/AbiService/GenericAbiManager"
import { NativeAbiManager } from "~Services/AbiService/NativeAbiManager"
import { getStore } from "~Test"
import { ActivityStatus, ActivityType, FungibleTokenActivity } from "~Model"
import { AnalyticsEvent, B3TR, DIRECTIONS } from "~Constants"
import { Transfer } from "@vechain/sdk-network"

const trackEvent = jest.fn()

jest.mock("~Utils/AnalyticsUtils", () => ({
    trackEvent: jest.fn().mockImplementation((...args) => trackEvent(...args)),
}))

describe("Activity - Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    describe("validateAndUpsertActivity", () => {
        const blockTimestamp = Math.floor(Date.now() / 1000)

        const activity = {
            from: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            to: ["0x0e73ea971849e16ca9098a7a987130e1a53eeab1"],
            id: "74288e9519f1e81a5decf266c2f226a0e9436b47",
            txId: "0xea3122a317bb0c4349462558cbb2dcc038978075672749484f047f4b396763fc",
            blockNumber: 21791678,
            genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
            isTransaction: true,
            type: ActivityType.TRANSFER_FT,
            timestamp: blockTimestamp * 1000,
            gasPayer: "0x0e73ea971849e16ca9098a7a987130e1a53eeab1",
            delegated: false,
            status: ActivityStatus.PENDING,
            amount: "15000000000000000000",
            tokenAddress: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
            direction: DIRECTIONS.UP,
            subject: AnalyticsEvent.TOKEN,
            context: AnalyticsEvent.SEND,
            signature: AnalyticsEvent.LOCAL,
            medium: AnalyticsEvent.SEND,
        } as FungibleTokenActivity

        const managers = [new GenericAbiManager(), new NativeAbiManager()]
        managers.forEach(man => man.loadAbis())
        const processor = new ReceiptProcessor(managers)

        it.each([
            {
                outputs: [
                    [
                        {
                            events: [
                                {
                                    address: "0x0000000000000000000000000000456e65726779",
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x00000000000000000000000014b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                                {
                                    address: "0x0000000000000000000000000000456e65726779",
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x00000000000000000000000015b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                            ],
                            transfers: [],
                        },
                    ],
                ],
                result: {
                    VTHO_SENT: 4999.63418,
                    VTHO_SENT_COUNT: 1,
                },
                label: "VTHO_SENT",
                origin: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
            },
            {
                outputs: [
                    [
                        {
                            events: [
                                {
                                    address: "0x0000000000000000000000000000456e65726779",
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                        "0x00000000000000000000000014b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                                {
                                    address: "0x0000000000000000000000000000456e65726779",
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                        "0x00000000000000000000000015b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                            ],
                            transfers: [],
                        },
                    ],
                ],
                result: {
                    VTHO_RECEIVED: 4999.63418,
                    VTHO_RECEIVED_COUNT: 1,
                },
                label: "VTHO_RECEIVED",
                origin: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
            },
            {
                outputs: [
                    [
                        {
                            events: [
                                {
                                    address: B3TR.address,
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                        "0x00000000000000000000000014b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                                {
                                    address: B3TR.address,
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                        "0x00000000000000000000000015b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                            ],
                            transfers: [],
                        },
                    ],
                ],
                result: {
                    B3TR_RECEIVED: 4999.63418,
                    B3TR_RECEIVED_COUNT: 1,
                },
                label: "B3TR_RECEIVED",
                origin: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
            },
            {
                outputs: [
                    [
                        {
                            events: [
                                {
                                    address: B3TR.address,
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x00000000000000000000000014b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                                {
                                    address: B3TR.address,
                                    topics: [
                                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                                        "0x000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d",
                                        "0x00000000000000000000000015b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    ],
                                    data: "0x00000000000000000000000000000000000000000000010f07dcbd8349644000",
                                },
                            ],
                            transfers: [],
                        },
                    ],
                ],
                result: {
                    B3TR_SENT: 4999.63418,
                    B3TR_SENT_COUNT: 1,
                },
                label: "B3TR_SENT",
                origin: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
            },
            {
                outputs: [
                    [
                        {
                            events: [],
                            transfers: [
                                {
                                    sender: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    recipient: "0x809e880c96a911965d8e3e00e207a97071678f7d",
                                    amount: "4999634180000000000000",
                                },
                                {
                                    sender: "0x15b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    recipient: "0x809e880c96a911965d8e3e00e207a97071678f7d",
                                    amount: "4999634180000000000000",
                                },
                            ] as Transfer[],
                        },
                    ],
                ],
                result: {
                    VET_SENT: 4999.63418,
                    VET_SENT_COUNT: 1,
                },
                label: "VET_SENT",
                origin: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
            },
            {
                outputs: [
                    [
                        {
                            events: [],
                            transfers: [
                                {
                                    recipient: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    sender: "0x809e880c96a911965d8e3e00e207a97071678f7d",
                                    amount: "4999634180000000000000",
                                },
                                {
                                    recipient: "0x15b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
                                    sender: "0x809e880c96a911965d8e3e00e207a97071678f7d",
                                    amount: "4999634180000000000000",
                                },
                            ] as Transfer[],
                        },
                    ],
                ],
                result: {
                    VET_RECEIVED: 4999.63418,
                    VET_RECEIVED_COUNT: 1,
                },
                label: "VET_RECEIVED",
                origin: "0x14b3fe72a8c99a118bb8e288c51c9bd5eeac1f24",
            },
        ])("should dispatch the track event correctly ($label)", async ({ origin, result, outputs }) => {
            const dispatch = jest.fn()

            const thor = {
                transactions: {
                    getTransactionReceipt: jest.fn().mockResolvedValue({
                        meta: {
                            blockNumber: 1,
                            blockTimestamp,
                            txOrigin: origin,
                        },
                        reverted: false,
                        outputs,
                    }),
                },
            } as any

            await validateAndUpsertActivity({
                activity,
                processor,
                thor,
            })(dispatch, getStore({}).getState, { s: "", n: 1 })

            expect(dispatch).toHaveBeenCalledTimes(4)
            // This is a builtin dispatch from @reduxjs/toolkit
            expect(dispatch).toHaveBeenNthCalledWith(1, {
                meta: { arg: { activity, processor, thor }, requestId: expect.any(String), requestStatus: "pending" },
                payload: undefined,
                type: "activity/upsertTransactionDetails/pending",
            })
            //This is track event
            expect(dispatch).toHaveBeenNthCalledWith(2, undefined)
            expect(dispatch).toHaveBeenNthCalledWith(3, {
                payload: {
                    ...activity,
                    status: "SUCCESS",
                    timestamp: blockTimestamp * 1000,
                    blockNumber: 1,
                },
                type: "activities/addActivity",
            })
            expect(trackEvent).toHaveBeenCalledWith(AnalyticsEvent.WALLET_OPERATION, expect.objectContaining(result))
        })
        it("should not track the event if the activity is still pending", async () => {
            const dispatch = jest.fn()

            const thor = {
                transactions: {
                    getTransactionReceipt: jest.fn().mockResolvedValue(null),
                },
            } as any

            await validateAndUpsertActivity({
                activity,
                processor,
                thor,
            })(dispatch, getStore({}).getState, { s: "", n: 1 })

            expect(dispatch).toHaveBeenCalledTimes(3)
            // This is a builtin dispatch from @reduxjs/toolkit
            expect(dispatch).toHaveBeenNthCalledWith(1, {
                meta: { arg: { activity, processor, thor }, requestId: expect.any(String), requestStatus: "pending" },
                payload: undefined,
                type: "activity/upsertTransactionDetails/pending",
            })
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                payload: {
                    ...activity,
                    blockNumber: 0,
                    status: "PENDING",
                },
                type: "activities/addActivity",
            })
            expect(trackEvent).not.toHaveBeenCalled()
        })
    })
})
