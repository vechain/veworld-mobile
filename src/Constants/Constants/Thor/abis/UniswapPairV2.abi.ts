import { abi } from "thor-devkit"

/* EVENTS */
export const SwapEvent: abi.Event.Definition = {
    anonymous: false,
    inputs: [
        {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount0In",
            type: "uint256",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount1In",
            type: "uint256",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount0Out",
            type: "uint256",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount1Out",
            type: "uint256",
        },
        {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
        },
    ],
    name: "Swap",
    type: "event",
}

export const MintEvent: abi.Event.Definition = {
    anonymous: false,
    inputs: [
        {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount0",
            type: "uint256",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount1",
            type: "uint256",
        },
    ],
    name: "Mint",
    type: "event",
}

export const BurnEvent: abi.Event.Definition = {
    anonymous: false,
    inputs: [
        {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount0",
            type: "uint256",
        },
        {
            indexed: false,
            internalType: "uint256",
            name: "amount1",
            type: "uint256",
        },
        {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
        },
    ],
    name: "Burn",
    type: "event",
}

export const SyncEvent: abi.Event.Definition = {
    anonymous: false,
    inputs: [
        {
            indexed: false,
            internalType: "uint112",
            name: "reserve0",
            type: "uint112",
        },
        {
            indexed: false,
            internalType: "uint112",
            name: "reserve1",
            type: "uint112",
        },
    ],
    name: "Sync",
    type: "event",
}
