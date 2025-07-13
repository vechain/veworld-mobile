import { ExpandedBlockDetail } from "@vechain/sdk-network"
import { BusinessEventAbiManager } from "./BusinessEventAbiManager"
import { GenericAbiManager } from "./GenericAbiManager"
import { NativeAbiManager } from "./NativeAbiManager"
import { ReceiptProcessor } from "./ReceiptProcessor"
import { NETWORK_TYPE } from "~Model"

describe("ReceiptProcessor", () => {
    const genericAbiManager = new GenericAbiManager()
    const nativeAbiManager = new NativeAbiManager()
    const businessEventAbiManager = new BusinessEventAbiManager(NETWORK_TYPE.MAIN, {
        B3TR_CONTRACT: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        VOT3_CONTRACT: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
        B3TR_GOVERNOR_CONTRACT: "0x1c65c25fabe2fc1bcb82f253fa0c916a322f777c",
        GM_NFT_CONTRACT: "0x93b8cd34a7fc4f53271b9011161f7a2b5fea9d1f",
        X_ALLOC_VOTING_CONTRACT: "0x89a00bb0947a30ff95beef77a66aede3842fe5b7",
        X2EARN_REWARDS_POOL_CONTRACT: "0x6bee7ddab6c99d5b2af0554eaea484ce18f52631",
        VOTER_REWARDS_CONTRACT: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
        TREASURY_CONTRACT: "0xd5903bcc66e439c753e525f8af2fec7be2429593",
        STARGATE_DELEGATION_CONTRACT: "0x7240e3bc0d26431512d5b67dbd26d199205bffe8",
        STARGATE_NFT_CONTRACT: "0x1ec1d168574603ec35b9d229843b7c2b44bcb770",
    })

    const commonReceiptProcessor = new ReceiptProcessor([genericAbiManager, nativeAbiManager, businessEventAbiManager])

    beforeAll(async () => {
        await genericAbiManager.loadAbis()
        await nativeAbiManager.loadAbis()
        await businessEventAbiManager.loadAbis()
    })
    describe("analyzeReceipt", () => {
        it("should identify a transfer event of erc 20", async () => {
            const receiptProcessor = new ReceiptProcessor([genericAbiManager])

            const result = receiptProcessor.analyzeReceipt(
                [
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
                ],
                "0x0",
            )

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

        it("Process block - B3TR Action + Transfers", async () => {
            const block = require("./fixtures/block_b3tr_action.json")

            const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
            )

            expect(outputs).toHaveLength(5)
            const names = outputs.map(output => output.name)

            expect(names).toStrictEqual([
                "B3TR_ActionReward(address,address,uint256,bytes32,string)",
                "B3TR_ActionReward(address,address,uint256,bytes32,string)",
                "Transfer(indexed address,indexed address,uint256)",
                "VET_TRANSFER(address,address,uint256)",
                "VET_TRANSFER(address,address,uint256)",
            ])
        })

        it("Process block - DEX Transactions", async () => {
            const block = require("./fixtures/block_dex.json")

            const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
            )

            expect(outputs).toHaveLength(9)
            const names = outputs.map(output => output.name)
            expect(names).toStrictEqual([
                "B3TR_ActionReward(address,address,uint256,bytes32,string)",
                "FT_VET_Swap2(address,address,address,uint256,uint256)",
                "B3TR_ActionReward(address,address,uint256,bytes32,string)",
                "Approval(indexed address,indexed address,uint256)",
                "Token_FTSwap(address,address,address,address,uint256,uint256)",
                "VET_FT_Swap(address,address,address,uint256,uint256)",
                "VET_FT_Swap(address,address,address,uint256,uint256)",
                "Approval(indexed address,indexed address,uint256)",
                "FT_VET_Swap(address,address,address,uint256,uint256)",
            ])
        })

        it("Process block - MaaS sale", async () => {
            const block = require("./fixtures/block_marketplace_sales.json")

            const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
            )

            expect(outputs).toHaveLength(8)
            const names = outputs.map(output => output.name)
            expect(names).toStrictEqual([
                "MAAS_SALE(uint256,address,address,address,uint256)",
                "Approval(indexed address,indexed address,indexed uint256)",
                "WOV_Offer_Accepted_Sale(uint256,address,address,address,uint256)",
                "WOV_Non_Custodial_Sale(uint256,address,address,address,uint256)",
                "WOV_Action_Executed_Sale(uint256,address,address,address,uint256)",
                "Approval(indexed address,indexed address,uint256)",
                "WOV_Custodial_WOV_Sale(uint256,address,address,address,uint256)",
                "WOV_Custodial_VET_Sale(uint256,address,address,address,uint256)",
            ])
        })

        describe("Process block - Stargate", () => {
            it("Stake", async () => {
                const block = require("./fixtures/block_stargate_stake.json")

                const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                    commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
                )

                expect(outputs).toHaveLength(1)
                const names = outputs.map(output => output.name)
                expect(names).toStrictEqual(["STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)"])
            })
            it("Unstake", async () => {
                const block = require("./fixtures/block_stargate_unstake.json")

                const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                    commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
                )

                expect(outputs).toHaveLength(1)
                const names = outputs.map(output => output.name)
                expect(names).toStrictEqual(["STARGATE_UNSTAKE(uint256,uint256,uint8,address)"])
            })
            it("Claim rewards base", async () => {
                const block = require("./fixtures/block_stargate_claim_base_reward.json")

                const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                    commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
                )

                expect(outputs).toHaveLength(4)
                const names = outputs.map(output => output.name)
                expect(names[3]).toBe("STARGATE_CLAIM_REWARDS_BASE(uint256,uint256,address)")
            })
            it("Claim rewards delegation", async () => {
                const block = require("./fixtures/block_stargate_claim_delegate_reward.json")

                const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                    commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
                )

                expect(outputs).toHaveLength(1)
                const names = outputs.map(output => output.name)
                expect(names[0]).toBe("STARGATE_CLAIM_REWARDS_DELEGATE(uint256,uint256,address)")
            })
            it("Stake delegate", async () => {
                const block = require("./fixtures/block_stargate_stake_delegate.json")

                const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                    commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
                )

                expect(outputs).toHaveLength(1)
                const names = outputs.map(output => output.name)
                expect(names[0]).toBe("STARGATE_STAKE_DELEGATE(uint256,uint256,uint8,address,bool,bool)")
            })
            it("Undelegate", async () => {
                const block = require("./fixtures/block_stargate_undelegate.json")

                const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                    commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
                )

                expect(outputs).toHaveLength(1)
                const names = outputs.map(output => output.name)
                expect(names[0]).toBe("STARGATE_UNDELEGATE(uint256)")
            })
            it("Delegate", async () => {
                const block = require("./fixtures/block_stargate_delegation.json")

                const outputs = (block.transactions as ExpandedBlockDetail["transactions"]).flatMap(tx =>
                    commonReceiptProcessor.analyzeReceipt(tx.outputs, tx.origin),
                )

                expect(outputs).toHaveLength(2)
                const names = outputs.map(output => output.name)
                expect(names[1]).toBe("STARGATE_DELEGATE(uint256,address,bool)")
            })
        })
    })
})
