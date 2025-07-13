import { GenericAbiManager } from "./GenericAbiManager"
import { ReceiptProcessor } from "./ReceiptProcessor"

describe("ReceiptProcessor", () => {
    const genericAbiManager = new GenericAbiManager()

    beforeAll(async () => {
        await genericAbiManager.loadAbis()
    })
    describe("analyzeReceipt", () => {
        it("should identify a transfer event of erc 20", async () => {
            const receiptProcessor = new ReceiptProcessor([genericAbiManager])

            const result = receiptProcessor.analyzeReceipt([
                {
                    contractAddress: null,
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
                    ],
                    transfers: [],
                },
            ])

            expect(result).toStrictEqual([
                {
                    clauseIndex: 0,
                    name: "Transfer(indexed address,indexed address,uint256)",
                    params: {
                        from: "0x14B3Fe72a8c99a118bb8E288c51c9bd5eeac1F24",
                        to: "0x809e880c96a911965D8E3e00E207A97071678f7D",
                        value: "4999634180000000000000",
                    },
                },
            ])
        })
    })
})
