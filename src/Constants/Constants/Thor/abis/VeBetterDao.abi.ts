import { abi } from "thor-devkit"

type Vot3AbiKeys = "convertToB3TR" | "convertToVOT3"
type XAllocationVotingAbiKeys = "currentRoundId" | "getAppsOfRound"
type XAllocationPoolAbiKeys = "getMaxAppAllocation" | "getAppShares"

export const X2EarnDapps: abi.Function.Definition = {
    inputs: [],
    name: "apps",
    outputs: [
        {
            components: [
                {
                    internalType: "bytes32",
                    name: "id",
                    type: "bytes32",
                },
                {
                    internalType: "address",
                    name: "teamWalletAddress",
                    type: "address",
                },
                {
                    internalType: "string",
                    name: "name",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "metadataURI",
                    type: "string",
                },
                {
                    internalType: "uint256",
                    name: "createdAtTimestamp",
                    type: "uint256",
                },
                {
                    internalType: "bool",
                    name: "appAvailableForAllocationVoting",
                    type: "bool",
                },
            ],
            internalType: "struct X2EarnAppsDataTypes.AppWithDetailsReturnType[]",
            name: "",
            type: "tuple[]",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const B3trAbis: Record<"approve", abi.Function.Definition> = {
    approve: {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
}

export const Vot3Abis: Record<Vot3AbiKeys, abi.Function.Definition> = {
    convertToB3TR: {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "convertToB3TR",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    convertToVOT3: {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "convertToVOT3",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
}

export const XAllocationVoting: Record<XAllocationVotingAbiKeys, abi.Function.Definition> = {
    currentRoundId: {
        inputs: [],
        name: "currentRoundId",
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
    getAppsOfRound: {
        inputs: [
            {
                internalType: "uint256",
                name: "roundId",
                type: "uint256",
            },
        ],
        name: "getAppsOfRound",
        outputs: [
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "id",
                        type: "bytes32",
                    },
                    {
                        internalType: "address",
                        name: "teamWalletAddress",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "metadataURI",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "createdAtTimestamp",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "appAvailableForAllocationVoting",
                        type: "bool",
                    },
                ],
                internalType: "struct X2EarnAppsDataTypes.AppWithDetailsReturnType[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
}

export const XAllocationPool: Record<XAllocationPoolAbiKeys, abi.Function.Definition> = {
    getMaxAppAllocation: {
        inputs: [
            {
                internalType: "uint256",
                name: "roundId",
                type: "uint256",
            },
        ],
        name: "getMaxAppAllocation",
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
    getAppShares: {
        inputs: [
            {
                internalType: "uint256",
                name: "roundId",
                type: "uint256",
            },
            {
                internalType: "bytes32",
                name: "appId",
                type: "bytes32",
            },
        ],
        name: "getAppShares",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
}
