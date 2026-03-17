import { NETWORK_TYPE } from "~Model/Network/enums"

export type DexConfig = {
    id: string
    name: string
    routerAddress: string
    factoryAddress?: string
    wvetAddress: string
    /** true: uses swapExactVETForTokens, false: uses swapExactETHForTokens */
    usesVETMethods: boolean
}

export type SwapConfig = {
    dexes: DexConfig[]
    feeCollectorAddress: string
    /** 75 = 0.75% */
    feeBasisPoints: number
    /** 50 = 0.5% */
    defaultSlippageBasisPoints: number
}

export const SWAP_CONFIG: Partial<Record<NETWORK_TYPE, SwapConfig>> = {
    [NETWORK_TYPE.MAIN]: {
        dexes: [
            {
                id: "betterswap",
                name: "BetterSwap",
                routerAddress: "0xf21dd7108d93af56fab07423efb90f4a3604da89",
                wvetAddress: "0x45429a2255e7248e57fce99e7239aed3f84b7a53",
                usesVETMethods: false,
            },
            {
                id: "vetrade",
                name: "VeTrade",
                routerAddress: "0xE5fA980a6EfE5B79C2150a529da06AeF455963b6",
                wvetAddress: "0xD8CCDD85abDbF68DFEc95f06c973e87B1b5A9997",
                usesVETMethods: false,
            },
        ],
        feeCollectorAddress: "0xe705e3f310ab09fb9eb40b43cb1368289ef1f829",
        feeBasisPoints: 75,
        defaultSlippageBasisPoints: 50,
    },
    [NETWORK_TYPE.TEST]: {
        dexes: [],
        feeCollectorAddress: "0xe705e3f310ab09fb9eb40b43cb1368289ef1f829",
        feeBasisPoints: 75,
        defaultSlippageBasisPoints: 50,
    },
}

export const VET_PSEUDO_ADDRESS = "0x0"

export const SWAP_DEADLINE_SECONDS = 1200
