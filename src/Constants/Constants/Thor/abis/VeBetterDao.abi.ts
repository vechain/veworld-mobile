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
