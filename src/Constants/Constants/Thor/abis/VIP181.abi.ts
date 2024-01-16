import { abi } from "thor-devkit"

/* EVENTS */
export const ApprovalEvent: abi.Event.Definition = {
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
            internalType: "address",
            name: "spender",
            type: "address",
        },
        {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
        },
    ],
    name: "Approval",
    type: "event",
}

export const TransferEvent: abi.Event.Definition = {
    anonymous: false,
    inputs: [
        {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
        },
        {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
        },
    ],
    name: "Transfer",
    type: "event",
}

export const ApprovalForAllEvent: abi.Event.Definition = {
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
            internalType: "address",
            name: "operator",
            type: "address",
        },
        {
            indexed: false,
            internalType: "bool",
            name: "approved",
            type: "bool",
        },
    ],
    name: "ApprovalForAll",
    type: "event",
}

/* GETTER FUNCTIONS (contract calls) */
export const name: abi.Function.Definition = {
    inputs: [],
    name: "name",
    outputs: [
        {
            internalType: "string",
            name: "",
            type: "string",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const symbol: abi.Function.Definition = {
    inputs: [],
    name: "symbol",
    outputs: [
        {
            internalType: "string",
            name: "",
            type: "string",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const totalSupply: abi.Function.Definition = {
    inputs: [],
    name: "totalSupply",
    outputs: [
        {
            internalType: "uint256",
            name: "",
            type: "uint256",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const balanceOf: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "owner",
            type: "address",
        },
    ],
    name: "balanceOf",
    outputs: [
        {
            internalType: "uint256",
            name: "",
            type: "uint256",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const ownerOf: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
        },
    ],
    name: "ownerOf",
    outputs: [
        {
            internalType: "address",
            name: "",
            type: "address",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const getApproved: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
        },
    ],
    name: "getApproved",
    outputs: [
        {
            internalType: "address",
            name: "",
            type: "address",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const isApprovedForAll: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "owner",
            type: "address",
        },
        {
            internalType: "address",
            name: "operator",
            type: "address",
        },
    ],
    name: "isApprovedForAll",
    outputs: [
        {
            internalType: "bool",
            name: "",
            type: "bool",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const supportsInterface: abi.Function.Definition = {
    inputs: [
        {
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4",
        },
    ],
    name: "supportsInterface",
    outputs: [
        {
            internalType: "bool",
            name: "",
            type: "bool",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const tokenURI: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
        },
    ],
    name: "tokenURI",
    outputs: [
        {
            internalType: "string",
            name: "",
            type: "string",
        },
    ],
    stateMutability: "view",
    type: "function",
}

/* STATE CHANING FUNCTIONS (transactions) */
export const transferFrom: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "from",
            type: "address",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
        },
    ],
    name: "transferFrom",
    outputs: [
        {
            internalType: "bool",
            name: "",
            type: "bool",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const approve: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "tokenId",
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
}

export const setApprovalForAll: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "operator",
            type: "address",
        },
        {
            internalType: "bool",
            name: "approved",
            type: "bool",
        },
    ],
    name: "setApprovalForAll",
    outputs: [
        {
            internalType: "bool",
            name: "",
            type: "bool",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const mint: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}
