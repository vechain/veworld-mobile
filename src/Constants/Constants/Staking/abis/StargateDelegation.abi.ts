import { abi } from "thor-devkit"

type StargateDelegationFunctionKeys = "isDelegationActive"

type StargateDelegationRewardsKeys = "accumulatedRewards" | "claimableRewards"

export const StargateDelegationFunctions = {
    isDelegationActive: {
        name: "isDelegationActive",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateDelegationFunctionKeys, abi.Function.Definition>

export const StargateDelegationRewards = {
    accumulatedRewards: {
        name: "accumulatedRewards",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    claimableRewards: {
        name: "claimableRewards",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateDelegationRewardsKeys, abi.Function.Definition>

export const StargateDelegation = [
    ...Object.values(StargateDelegationFunctions),
    ...Object.values(StargateDelegationRewards),
]
