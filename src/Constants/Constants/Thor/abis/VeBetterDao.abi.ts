import { abi } from "thor-devkit"

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

export const B3trAbis: abi.Function.Definition[] = [
    {
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
]

export const Vot3Abis: abi.Function.Definition[] = [
    {
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
    {
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
]
