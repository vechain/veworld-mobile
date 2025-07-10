import { abi } from "thor-devkit"

type StargateDelegationFunctionKeys =
    | "delegate"
    | "getDelegationDetails"
    | "getDelegationEndBlock"
    | "getDelegationPeriod"
    | "isDelegationActive"
    | "requestDelegationExit"
    | "currentDelegationPeriodEndBlock"

type StargateDelegationRewardsKeys =
    | "accumulatedRewards"
    | "claimRewards"
    | "claimableRewards"
    | "getRewardsAccumulationEndBlock"
    | "getRewardsAccumulationStartBlock"
    | "setRewardsAccumulationEndBlock"
    | "getVthoRewardPerBlock"
    | "getVthoRewardsPerBlock"
    | "setVthoRewardPerBlockForAllLevels"
    | "setVthoRewardPerBlockForLevel"

type StargateDelegationContractKeys = "getStargateNFTContract" | "getVthoToken"

type StargateDelegationLifecycleKeys = "initialize" | "upgradeToAndCall" | "proxiableUUID" | "UPGRADE_INTERFACE_VERSION"

type StargateDelegationUtilityKeys = "version" | "supportsInterface" | "clock" | "CLOCK_MODE"

export const StargateDelegationFunctions = {
    delegate: {
        name: "delegate",
        type: "function",
        inputs: [
            { name: "_tokenId", type: "uint256", internalType: "uint256" },
            { name: "_delegateForever", type: "bool", internalType: "bool" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    getDelegationDetails: {
        name: "getDelegationDetails",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [
            { name: "", type: "bool", internalType: "bool" },
            { name: "", type: "uint256", internalType: "uint256" },
            { name: "", type: "uint256", internalType: "uint256" },
            { name: "", type: "uint256", internalType: "uint256" },
        ],
        stateMutability: "view",
    },
    getDelegationEndBlock: {
        name: "getDelegationEndBlock",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    getDelegationPeriod: {
        name: "getDelegationPeriod",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    isDelegationActive: {
        name: "isDelegationActive",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    requestDelegationExit: {
        name: "requestDelegationExit",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    currentDelegationPeriodEndBlock: {
        name: "currentDelegationPeriodEndBlock",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
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
    claimRewards: {
        name: "claimRewards",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    claimableRewards: {
        name: "claimableRewards",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    getRewardsAccumulationEndBlock: {
        name: "getRewardsAccumulationEndBlock",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    getRewardsAccumulationStartBlock: {
        name: "getRewardsAccumulationStartBlock",
        type: "function",
        inputs: [{ name: "_tokenId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    setRewardsAccumulationEndBlock: {
        name: "setRewardsAccumulationEndBlock",
        type: "function",
        inputs: [{ name: "_rewardsAccumulationEndBlock", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    getVthoRewardPerBlock: {
        name: "getVthoRewardPerBlock",
        type: "function",
        inputs: [{ name: "_level", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    getVthoRewardsPerBlock: {
        name: "getVthoRewardsPerBlock",
        type: "function",
        inputs: [],
        outputs: [
            {
                name: "vthoRewardPerBlock",
                type: "tuple[]",
                components: [
                    { name: "levelId", type: "uint256", internalType: "uint256" },
                    { name: "rewardPerBlock", type: "uint256", internalType: "uint256" },
                ],
                internalType: "struct StargateDelegation.VthoRewardPerBlock[]",
            },
        ],
        stateMutability: "view",
    },
    setVthoRewardPerBlockForAllLevels: {
        name: "setVthoRewardPerBlockForAllLevels",
        type: "function",
        inputs: [
            {
                name: "_vthoRewardPerBlock",
                type: "tuple[]",
                components: [
                    { name: "levelId", type: "uint256", internalType: "uint256" },
                    { name: "rewardPerBlock", type: "uint256", internalType: "uint256" },
                ],
                internalType: "struct StargateDelegation.VthoRewardPerBlock[]",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    setVthoRewardPerBlockForLevel: {
        name: "setVthoRewardPerBlockForLevel",
        type: "function",
        inputs: [
            { name: "_level", type: "uint256", internalType: "uint256" },
            { name: "_vthoRewardPerBlock", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
} as const satisfies Record<StargateDelegationRewardsKeys, abi.Function.Definition>

export const StargateDelegationContract = {
    getStargateNFTContract: {
        name: "getStargateNFTContract",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract IStargateNFT" }],
        stateMutability: "view",
    },
    getVthoToken: {
        name: "getVthoToken",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateDelegationContractKeys, abi.Function.Definition>

export const StargateDelegationLifecycle = {
    initialize: {
        name: "initialize",
        type: "function",
        inputs: [
            {
                name: "_initParams",
                type: "tuple",
                components: [
                    { name: "upgrader", type: "address", internalType: "address" },
                    { name: "admin", type: "address", internalType: "address" },
                    { name: "operator", type: "address", internalType: "address" },
                    { name: "stargateNFT", type: "address", internalType: "address" },
                    { name: "vthoToken", type: "address", internalType: "address" },
                    {
                        name: "vthoRewardPerBlock",
                        type: "tuple[]",
                        components: [
                            { name: "levelId", type: "uint256", internalType: "uint256" },
                            { name: "rewardPerBlock", type: "uint256", internalType: "uint256" },
                        ],
                        internalType: "struct StargateDelegation.VthoRewardPerBlock[]",
                    },
                    { name: "delegationPeriod", type: "uint256", internalType: "uint256" },
                ],
                internalType: "struct StargateDelegation.StargateDelegationInitParams",
            },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    upgradeToAndCall: {
        name: "upgradeToAndCall",
        type: "function",
        inputs: [
            { name: "newImplementation", type: "address", internalType: "address" },
            { name: "data", type: "bytes", internalType: "bytes" },
        ],
        outputs: [],
        stateMutability: "payable",
    },
    proxiableUUID: {
        name: "proxiableUUID",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
    },
    UPGRADE_INTERFACE_VERSION: {
        name: "UPGRADE_INTERFACE_VERSION",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateDelegationLifecycleKeys, abi.Function.Definition>

export const StargateDelegationUtility = {
    version: {
        name: "version",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "pure",
    },
    supportsInterface: {
        name: "supportsInterface",
        type: "function",
        inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    clock: {
        name: "clock",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "uint48", internalType: "uint48" }],
        stateMutability: "view",
    },
    CLOCK_MODE: {
        name: "CLOCK_MODE",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
} as const satisfies Record<StargateDelegationUtilityKeys, abi.Function.Definition>

export const StargateDelegation = [
    ...Object.values(StargateDelegationFunctions),
    ...Object.values(StargateDelegationRewards),
    ...Object.values(StargateDelegationContract),
    ...Object.values(StargateDelegationLifecycle),
    ...Object.values(StargateDelegationUtility),
]
