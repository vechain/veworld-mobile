import { abi } from "thor-devkit"

type NodeManagementNodeKeys =
    | "delegateNode"
    | "removeNodeDelegation"
    | "getNodeIds"
    | "getNodeLevel"
    | "getNodeManager"
    | "getNodeOwner"
    | "isNodeDelegated"
    | "isNodeHolder"
    | "isNodeManager"
    | "isDirectNodeOwner"
    | "isLegacyNode"
type NodeManagementUserKeys =
    | "getUserNodes"
    | "getUserStargateNFTsInfo"
    | "getUsersNodeLevels"
    | "getDirectNodeOwnership"
    | "getDirectNodesOwnership"
    | "getNodesDelegatedTo"
    | "isNodeDelegator"
type NodeManagementContractKeys =
    | "getStargateNft"
    | "setStargateNft"
    | "getVechainNodesContract"
    | "setVechainNodesContract"

export const NodeManagement = {
    delegateNode: {
        name: "delegateNode",
        type: "function",
        inputs: [
            { name: "delegatee", type: "address", internalType: "address" },
            { name: "nodeId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    removeNodeDelegation: {
        name: "removeNodeDelegation",
        type: "function",
        inputs: [{ name: "nodeId", type: "uint256", internalType: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    getNodeIds: {
        name: "getNodeIds",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
        stateMutability: "view",
    },
    getNodeLevel: {
        name: "getNodeLevel",
        type: "function",
        inputs: [{ name: "nodeId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "levelId", type: "uint8", internalType: "uint8" }],
        stateMutability: "view",
    },
    getNodeManager: {
        name: "getNodeManager",
        type: "function",
        inputs: [{ name: "nodeId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "nodeManager", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    getNodeOwner: {
        name: "getNodeOwner",
        type: "function",
        inputs: [{ name: "nodeId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "nodeOwner", type: "address", internalType: "address" }],
        stateMutability: "view",
    },
    isNodeDelegated: {
        name: "isNodeDelegated",
        type: "function",
        inputs: [{ name: "nodeId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    isNodeHolder: {
        name: "isNodeHolder",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    isNodeManager: {
        name: "isNodeManager",
        type: "function",
        inputs: [
            { name: "user", type: "address", internalType: "address" },
            { name: "nodeId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    isDirectNodeOwner: {
        name: "isDirectNodeOwner",
        type: "function",
        inputs: [
            { name: "user", type: "address", internalType: "address" },
            { name: "nodeId", type: "uint256", internalType: "uint256" },
        ],
        outputs: [{ name: "isOwner", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    isLegacyNode: {
        name: "isLegacyNode",
        type: "function",
        inputs: [{ name: "nodeId", type: "uint256", internalType: "uint256" }],
        outputs: [{ name: "isLegacy", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
} as const satisfies Record<NodeManagementNodeKeys, abi.Function.Definition>

export const UserNodesInfo = {
    getUserNodes: {
        name: "getUserNodes",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [
            {
                name: "",
                type: "tuple[]",
                components: [
                    { name: "nodeId", type: "uint256", internalType: "uint256" },
                    { name: "nodeLevel", type: "uint8", internalType: "uint8" },
                    { name: "xNodeOwner", type: "address", internalType: "address" },
                    { name: "isXNodeHolder", type: "bool", internalType: "bool" },
                    { name: "isXNodeDelegated", type: "bool", internalType: "bool" },
                    { name: "isXNodeDelegator", type: "bool", internalType: "bool" },
                    { name: "isXNodeDelegatee", type: "bool", internalType: "bool" },
                    { name: "delegatee", type: "address", internalType: "address" },
                ],
                internalType: "struct NodeManagementV3.NodeInfo[]",
            },
        ],
        stateMutability: "view",
    },
    getUserStargateNFTsInfo: {
        name: "getUserStargateNFTsInfo",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [
            {
                name: "tokens",
                type: "tuple[]",
                components: [
                    { name: "tokenId", type: "uint256", internalType: "uint256" },
                    { name: "levelId", type: "uint8", internalType: "uint8" },
                    { name: "mintedAtBlock", type: "uint64", internalType: "uint64" },
                    { name: "vetAmountStaked", type: "uint256", internalType: "uint256" },
                    { name: "lastVthoClaimTimestamp", type: "uint48", internalType: "uint48" },
                ],
                internalType: "struct DataTypes.Token[]",
            },
        ],
        stateMutability: "view",
    },
    getUsersNodeLevels: {
        name: "getUsersNodeLevels",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint8[]", internalType: "uint8[]" }],
        stateMutability: "view",
    },
    getDirectNodeOwnership: {
        name: "getDirectNodeOwnership",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
    },
    getDirectNodesOwnership: {
        name: "getDirectNodesOwnership",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
        stateMutability: "view",
    },
    getNodesDelegatedTo: {
        name: "getNodesDelegatedTo",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
        stateMutability: "view",
    },
    isNodeDelegator: {
        name: "isNodeDelegator",
        type: "function",
        inputs: [{ name: "user", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
} as const satisfies Record<NodeManagementUserKeys, abi.Function.Definition>

export const ContractManagement = {
    getStargateNft: {
        name: "getStargateNft",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract IStargateNFT" }],
        stateMutability: "view",
    },
    setStargateNft: {
        name: "setStargateNft",
        type: "function",
        inputs: [{ name: "stargateNft", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    getVechainNodesContract: {
        name: "getVechainNodesContract",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "address", internalType: "contract ITokenAuction" }],
        stateMutability: "view",
    },
    setVechainNodesContract: {
        name: "setVechainNodesContract",
        type: "function",
        inputs: [{ name: "vechainNodesContract", type: "address", internalType: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
} as const satisfies Record<NodeManagementContractKeys, abi.Function.Definition>

export const NodeUtility = {
    exists: {
        name: "exists",
        type: "function",
        inputs: [{ name: "nodeId", type: "uint256", internalType: "uint256" }],
        outputs: [
            { name: "", type: "bool", internalType: "bool" },
            { name: "", type: "uint8", internalType: "enum VechainNodesDataTypes.NodeSource" },
        ],
        stateMutability: "view",
    },
    version: {
        name: "version",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "pure",
    },
    supportsInterface: {
        name: "supportsInterface",
        type: "function",
        inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
        stateMutability: "view",
    },
    UPGRADE_INTERFACE_VERSION: {
        name: "UPGRADE_INTERFACE_VERSION",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "string", internalType: "string" }],
        stateMutability: "view",
    },
    proxiableUUID: {
        name: "proxiableUUID",
        type: "function",
        inputs: [],
        outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
        stateMutability: "view",
    },
} as const satisfies Record<string, abi.Function.Definition>

export const NodeLifecycle = {
    initialize: {
        name: "initialize",
        type: "function",
        inputs: [
            { name: "_vechainNodesContract", type: "address", internalType: "address" },
            { name: "_admin", type: "address", internalType: "address" },
            { name: "_upgrader", type: "address", internalType: "address" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    initializeV2: {
        name: "initializeV2",
        type: "function",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    initializeV3: {
        name: "initializeV3",
        type: "function",
        inputs: [{ name: "_stargateNft", type: "address", internalType: "address" }],
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
} as const satisfies Record<string, abi.Function.Definition>
