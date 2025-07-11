/* eslint-disable max-len */
import { Transaction } from "@vechain/sdk-core"
import { GenericAbiManager } from "./GenericAbiManager"
import { ReceiptProcessor } from "./ReceiptProcessor"
import { ethers } from "ethers"

const genericAbiManager = new GenericAbiManager()
genericAbiManager.loadAbis()
describe("ReceiptProcessor", () => {
    describe("analyzeReceipt", () => {
        it("should identify a transfer event of erc 20", async () => {
            const receiptProcessor = new ReceiptProcessor([genericAbiManager])
            const tx = Transaction.of({
                chainTag: 74,
                blockRef: "0x015257fc94742295",
                expiration: 720,
                clauses: [
                    {
                        to: "0x0000000000000000000000000000456e65726779",
                        value: "0x0",
                        data: "0xa9059cbb000000000000000000000000809e880c96a911965d8e3e00e207a97071678f7d00000000000000000000000000000000000000000000010f07dcbd8349644000",
                    },
                ],
                gasPriceCoef: 0,
                gas: 60000,
                nonce: "0x197fb35ce89",
                dependsOn: null,
            })

            const result = receiptProcessor.analyzeReceipt(tx, [
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
                        value: ethers.BigNumber.from("0x10f07dcbd8349644000"),
                    },
                },
            ])
        })
    })
})
