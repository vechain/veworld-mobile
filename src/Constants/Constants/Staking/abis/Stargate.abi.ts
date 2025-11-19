export const Stargate = {
    claimableRewards: {
        inputs: [
            {
                internalType: "uint256",
                name: "_tokenId",
                type: "uint256",
            },
        ],
        name: "claimableRewards",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
} as const

export const StargateEvents = {
    DelegationRewardsClaimed: {
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
    },
} as const
