import { getFilterCriteriaOfEvent, getFilterCriteriaOfRawEvent } from "./ThorEventUtils"
import { ABIContract } from "@vechain/sdk-core"

const COMMON_ABI = {
    anonymous: false,
    inputs: [
        {
            indexed: true,
            internalType: "address",
            name: "receiver",
            type: "address",
        },
        {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
        },
        {
            indexed: true,
            internalType: "uint256",
            name: "delegationId",
            type: "uint256",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
        },
        {
            indexed: false,
            internalType: "uint32",
            name: "firstClaimedPeriod",
            type: "uint32",
        },
        {
            indexed: false,
            internalType: "uint32",
            name: "lastClaimedPeriod",
            type: "uint32",
        },
    ],
    name: "DelegationRewardsClaimed",
    type: "event",
} as const

describe("ThorEventUtils", () => {
    describe("getFilterCriteriaOfEvent", () => {
        it("should encode topics correctly", () => {
            const wallet = "0x10314336b1128271cf2aefe9d77863dd109885aa"
            const { criteria } = getFilterCriteriaOfEvent("0x0", [COMMON_ABI], "DelegationRewardsClaimed", {
                receiver: wallet,
                delegationId: BigInt(1),
                tokenId: BigInt(2),
            })
            expect(criteria).toStrictEqual({
                address: "0x0",
                topic0: "0xf4cde2b5a31835b3dac5ba586238b7160063a46803ccbf2322db0933efe694ed",
                topic1: "0x00000000000000000000000010314336b1128271cf2aefe9d77863dd109885aa",
                topic2: "0x0000000000000000000000000000000000000000000000000000000000000002",
                topic3: "0x0000000000000000000000000000000000000000000000000000000000000001",
                topic4: undefined,
            })
        })
        it("should encode all 4 topics correctly", () => {
            const wallet = "0xc6baf37db80873bd78aa7a71f055b8f0eed8561a"
            const { criteria } = getFilterCriteriaOfEvent(
                "0x0",
                [
                    {
                        ...COMMON_ABI,
                        inputs: [
                            ...COMMON_ABI.inputs,
                            {
                                indexed: true,
                                internalType: "uint256",
                                name: "delegationId2",
                                type: "uint256",
                            },
                        ],
                    } as const,
                ],
                "DelegationRewardsClaimed",
                {
                    receiver: wallet,
                    delegationId: BigInt(1),
                    tokenId: BigInt(2),
                    delegationId2: BigInt(3),
                },
            )
            expect(criteria).toStrictEqual({
                address: "0x0",
                topic0: "0x392e7894ef497b06f1af6ded81b83edad5c258fbe03a5b06f65a1b2cb6cfc13e",
                topic1: "0x000000000000000000000000c6baf37db80873bd78aa7a71f055b8f0eed8561a",
                topic2: "0x0000000000000000000000000000000000000000000000000000000000000002",
                topic3: "0x0000000000000000000000000000000000000000000000000000000000000001",
                topic4: "0x0000000000000000000000000000000000000000000000000000000000000003",
            })
        })
    })

    describe("getFilterCriteriaOfRawEvent", () => {
        it("should encode topics correctly", () => {
            const wallet = "0x10314336b1128271cf2aefe9d77863dd109885aa"
            const evt = ABIContract.ofAbi([COMMON_ABI]).getEvent("DelegationRewardsClaimed")
            const { criteria } = getFilterCriteriaOfRawEvent("0x0", evt, {
                receiver: wallet,
                delegationId: BigInt(1),
                tokenId: BigInt(2),
            })
            expect(criteria).toStrictEqual({
                address: "0x0",
                topic0: "0xf4cde2b5a31835b3dac5ba586238b7160063a46803ccbf2322db0933efe694ed",
                topic1: "0x00000000000000000000000010314336b1128271cf2aefe9d77863dd109885aa",
                topic2: "0x0000000000000000000000000000000000000000000000000000000000000002",
                topic3: "0x0000000000000000000000000000000000000000000000000000000000000001",
                topic4: undefined,
            })
        })
        it("should encode all 4 topics correctly", () => {
            const wallet = "0xc6baf37db80873bd78aa7a71f055b8f0eed8561a"
            const evt = ABIContract.ofAbi([
                {
                    ...COMMON_ABI,
                    inputs: [
                        ...COMMON_ABI.inputs,
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "delegationId2",
                            type: "uint256",
                        },
                    ],
                } as const,
            ]).getEvent("DelegationRewardsClaimed")
            const { criteria } = getFilterCriteriaOfRawEvent("0x0", evt, {
                receiver: wallet,
                delegationId: BigInt(1),
                tokenId: BigInt(2),
                delegationId2: BigInt(3),
            })
            expect(criteria).toStrictEqual({
                address: "0x0",
                topic0: "0x392e7894ef497b06f1af6ded81b83edad5c258fbe03a5b06f65a1b2cb6cfc13e",
                topic1: "0x000000000000000000000000c6baf37db80873bd78aa7a71f055b8f0eed8561a",
                topic2: "0x0000000000000000000000000000000000000000000000000000000000000002",
                topic3: "0x0000000000000000000000000000000000000000000000000000000000000001",
                topic4: "0x0000000000000000000000000000000000000000000000000000000000000003",
            })
        })
    })
})
