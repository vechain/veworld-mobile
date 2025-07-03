import { abi } from "thor-devkit"

type NFTBlacklistAbiKeys = "report" | "isBlacklisted" | "getSignalCount"

export const NFTBlacklistAbis: Record<NFTBlacklistAbiKeys, abi.Function.Definition> = {
    report: {
        inputs: [
            {
                internalType: "address",
                name: "nft",
                type: "address",
            },
        ],
        name: "report",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    isBlacklisted: {
        inputs: [
            {
                internalType: "address",
                name: "nft",
                type: "address",
            },
        ],
        name: "isBlacklisted",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    getSignalCount: {
        inputs: [
            {
                internalType: "address",
                name: "nft",
                type: "address",
            },
        ],
        name: "getSignalCount",
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

export const NFTBlacklistEvents = {
    NFTReported: {
        anonymous: false,
        inputs: [
            {
                internalType: "address",
                name: "nft",
                type: "address",
                indexed: true,
            },
            {
                internalType: "uint256",
                name: "signalCount",
                type: "uint256",
                indexed: false,
            },
            {
                internalType: "address",
                name: "reporter",
                type: "address",
                indexed: false,
            },
        ],
        name: "NFTReported",
        type: "event",
    },
} as const
