import { abi } from "thor-devkit"

/**
 * EVENTS
 */
const ApprovalEvent: abi.Event.Definition = {
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
            name: "approved",
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

const ApprovalForAllEvent: abi.Event.Definition = {
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

const TransferEvent: abi.Event.Definition = {
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

/**
 * FUNCTIONS
 */
const approve: abi.Function.Definition = {
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
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}

const balanceOf: abi.Function.Definition = {
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

const mint: abi.Function.Definition = {
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

const name: abi.Function.Definition = {
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

const ownerOf: abi.Function.Definition = {
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

const supportsInterface: abi.Function.Definition = {
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

const symbol: abi.Function.Definition = {
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

const tokenURI: abi.Function.Definition = {
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

const totalSupply: abi.Function.Definition = {
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

const transferFrom: abi.Function.Definition = {
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
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}

export default {
    ApprovalEvent,
    TransferEvent,
    ApprovalForAllEvent,
    approve,
    balanceOf,
    name,
    supportsInterface,
    symbol,
    totalSupply,
    transferFrom,
    mint,
    tokenURI,
    ownerOf,
}
