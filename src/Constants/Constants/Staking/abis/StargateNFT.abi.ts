import { abi } from "thor-devkit"

type StargateInfoKeys = "getToken" | "claimableVetGeneratedVtho"

export const StargateInfo = {
    getToken: {
        name: "getToken",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "tokenId", type: "uint256", internalType: "uint256" },
                    { name: "levelId", type: "uint8", internalType: "uint8" },
                    { name: "mintedAtBlock", type: "uint64", internalType: "uint64" },
                    { name: "vetAmountStaked", type: "uint256", internalType: "uint256" },
                    { name: "lastVthoClaimTimestamp", type: "uint48", internalType: "uint48" },
                ],
                internalType: "struct DataTypes.Token",
            },
        ],
        stateMutability: "view",
    },
    claimableVetGeneratedVtho: {
        inputs: [
            {
                internalType: "uint256",
                name: "_tokenId",
                type: "uint256",
            },
        ],
        name: "claimableVetGeneratedVtho",
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
} as const satisfies Record<StargateInfoKeys, abi.Function.Definition>

export const StargateNftEvents = {
    BaseVTHORewardsClaimed: {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "tokenId",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "BaseVTHORewardsClaimed",
        type: "event",
    },
} as const satisfies Record<string, abi.Event.Definition>
