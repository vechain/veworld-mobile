import { abi } from "thor-devkit"

type StargateInfoKeys = "getToken"

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
} as const satisfies Record<StargateInfoKeys, abi.Function.Definition>
