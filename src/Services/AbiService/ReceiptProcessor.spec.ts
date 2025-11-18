import { ExpandedBlockDetail } from "@vechain/sdk-network"
import { BusinessEventAbiManager } from "./BusinessEventAbiManager"
import { GenericAbiManager } from "./GenericAbiManager"
import { NativeAbiManager } from "./NativeAbiManager"
import { ReceiptProcessor } from "./ReceiptProcessor"
import { NETWORK_TYPE } from "~Model"

const getBlockFixture = (name: string): ExpandedBlockDetail => {
    return require(`~fixtures/business-event-blocks/block_${name}.json`)
}

describe("ReceiptProcessor", () => {
    const genericAbiManager = new GenericAbiManager()
    const nativeAbiManager = new NativeAbiManager()
    const businessEventAbiManager = new BusinessEventAbiManager(NETWORK_TYPE.MAIN, {
        B3TR_CONTRACT: "0x5ef79995fe8a89e0812330e4378eb2660cede699",
        VOT3_CONTRACT: "0x76ca782b59c74d088c7d2cce2f211bc00836c602",
        EMISSIONS: "0x148d21032f4a7b4aef236e2e9c0c5bf62d10f8eb",
        B3TR_GOVERNOR_CONTRACT: "0x1c65c25fabe2fc1bcb82f253fa0c916a322f777c",
        B3TR_DBA_POOL_CONTRACT: "0x98c1d097c39969bb5de754266f60d22bd105b368",
        GM_NFT_CONTRACT: "0x93b8cd34a7fc4f53271b9011161f7a2b5fea9d1f",
        X_ALLOC_VOTING_CONTRACT: "0x89a00bb0947a30ff95beef77a66aede3842fe5b7",
        X_ALLOC_POOL_CONTRACT: "0x4191776F05f4bE4848d3f4d587345078B439C7d3",
        X2EARN_REWARDS_POOL_CONTRACT: "0x6bee7ddab6c99d5b2af0554eaea484ce18f52631",
        VOTER_REWARDS_CONTRACT: "0x838a33af756a6366f93e201423e1425f67ec0fa7",
        TREASURY_CONTRACT: "0xd5903bcc66e439c753e525f8af2fec7be2429593",
        STARGATE_DELEGATION_CONTRACT: "0x32cb945dc25f4fc4214df63e3825045d6088b096",
        STARGATE_NFT_CONTRACT: "0x887d9102f0003f1724d8fd5d4fe95a11572fcd77",
        VEVOTE_CONTRACT: "0x1c65c25fabe2fc1bcb82f253fa0c916a322f777c",
        STARGATE_CONTRACT: "0x35ce14062457ef7817e10bbc3815317f5a07d695",
        RELAYER_REWARDS_POOL_CONTRACT: "0x34b56f892c9e977b9ba2e43ba64c27d368ab3c86",
    })

    const commonReceiptProcessor = new ReceiptProcessor([genericAbiManager, nativeAbiManager, businessEventAbiManager])

    beforeAll(() => {
        genericAbiManager.loadAbis()
        nativeAbiManager.loadAbis()
        businessEventAbiManager.loadAbis()
    })
    describe("analyzeReceipt", () => {
        it("should identify a transfer event of erc 20", async () => {
            const receiptProcessor = new ReceiptProcessor([genericAbiManager])

            const result = receiptProcessor.analyzeReceipt(
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
                        value: 4999634180000000000000n,
                    },
                    address: "0x0000000000000000000000000000456e65726779",
                },
            ])
        })

        it("Process block - B3TR Action + Transfers", async () => {
            const block = require("~fixtures/business-event-blocks/block_b3tr_action.json")

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
            const block = require("~fixtures/business-event-blocks/block_dex.json")

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
            const block = require("~fixtures/business-event-blocks/block_marketplace_sales.json")

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
            const BLOCK_STARGATE_STAKE = getBlockFixture("stargate_stake")
            const BLOCK_STARGATE_UNSTAKE = getBlockFixture("stargate_unstake")
            const BLOCK_STARGATE_BASE_REWARD = getBlockFixture("stargate_claim_base_reward")
            const BLOCK_STARGATE_DELEGATE_REWARD = getBlockFixture("stargate_claim_delegate_reward")
            const BLOCK_STARGATE_STAKE_DELEGATE = getBlockFixture("stargate_stake_delegate")
            const BLOCK_STARGATE_UNDELEGATE = getBlockFixture("stargate_undelegate")
            const BLOCK_STARGATE_DELEGATION = getBlockFixture("stargate_delegation")
            const BLOCK_STARGATE_STAKER_DELEGATION = getBlockFixture("stargate_staker_delegation")
            const BLOCK_STARGATE_DELEGATION_EXIT_REQUEST = getBlockFixture("stargate_exit_delegation_request")
            const BLOCK_STARGATE_CLAIM_REWARDS = getBlockFixture("stargate_claim_rewards")
            const BLOCK_STARGATE_MANAGER_ADDED = getBlockFixture("stargate_manager_added")
            const BLOCK_STARGATE_MANAGER_REMOVED = getBlockFixture("stargate_manager_removed")

            it("Hayabusa", async () => {
                const outputs = [
                    BLOCK_STARGATE_STAKER_DELEGATION,
                    BLOCK_STARGATE_CLAIM_REWARDS,
                    BLOCK_STARGATE_MANAGER_ADDED,
                    BLOCK_STARGATE_MANAGER_REMOVED,
                    BLOCK_STARGATE_DELEGATION_EXIT_REQUEST,
                ]
                    .flatMap(u => u.transactions)
                    .flatMap(tx =>
                        commonReceiptProcessor
                            .analyzeReceipt(tx.outputs, tx.origin)
                            .map(output => ({ ...output, txId: tx.id })),
                    )

                //This is a different number from the indexer
                //But we have Approvals + we store the claim rewards separately as a proper event
                expect(outputs).toHaveLength(13)
                const names = outputs.map(output => output.name)
                expect(names).toStrictEqual([
                    // Block #1
                    "Approval(indexed address,indexed address,uint256)",
                    "STARGATE_DELEGATE_REQUEST(uint256,address,uint256,address,uint256,uint256,uint8)",
                    "STARGATE_STAKE(uint256,uint256,uint8,address,bool)",
                    "STARGATE_BOOST(uint256,uint256,address,uint256)",
                    // Block #2
                    "Transfer(indexed address,indexed address,uint256)",
                    "DelegationRewardsClaimed(indexed address,indexed uint256,indexed uint256,uint256,uint32,uint32)",
                    "Transfer(indexed address,indexed address,uint256)",
                    "DelegationRewardsClaimed(indexed address,indexed uint256,indexed uint256,uint256,uint32,uint32)",
                    "Transfer(indexed address,indexed address,uint256)",
                    "DelegationRewardsClaimed(indexed address,indexed uint256,indexed uint256,uint256,uint32,uint32)",
                    // Block #3
                    "STARGATE_MANAGER_ADDED(uint256,address,address)",
                    // Block #4
                    "STARGATE_MANAGER_REMOVED(uint256,address,address)",
                    // Block #5
                    "DelegationSignaledExit(indexed uint256)",
                ])
            })

            it("Legacy", () => {
                const outputs = [
                    BLOCK_STARGATE_STAKE,
                    BLOCK_STARGATE_UNSTAKE,
                    BLOCK_STARGATE_BASE_REWARD,
                    BLOCK_STARGATE_DELEGATE_REWARD,
                    BLOCK_STARGATE_STAKE_DELEGATE,
                    BLOCK_STARGATE_UNDELEGATE,
                    BLOCK_STARGATE_DELEGATION,
                ]
                    .flatMap(u => u.transactions)
                    .flatMap(tx =>
                        commonReceiptProcessor
                            .analyzeReceipt(tx.outputs, tx.origin)
                            .map(output => ({ ...output, txId: tx.id })),
                    )

                expect(outputs).toHaveLength(13)
                const names = outputs.map(output => output.name)
                expect(names).toStrictEqual([
                    "STARGATE_DELEGATE_LEGACY(uint256,address,bool)",
                    "STARGATE_STAKE(uint256,uint256,uint8,address,bool)",
                    "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)",
                    "STARGATE_UNSTAKE(uint256,uint256,uint8,address)",
                    "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)",
                    "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)",
                    "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)",
                    "STARGATE_CLAIM_REWARDS_BASE_LEGACY(uint256,uint256,address)",
                    "STARGATE_CLAIM_REWARDS_DELEGATE_LEGACY(uint256,uint256,address)",
                    "STARGATE_DELEGATE_LEGACY(uint256,address,bool)",
                    "STARGATE_STAKE(uint256,uint256,uint8,address,bool)",
                    "STARGATE_UNDELEGATE_LEGACY(uint256)",
                    "Transfer(indexed address,indexed address,uint256)",
                ])
            })
        })
    })
})
