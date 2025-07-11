import { abi } from "thor-devkit"

type NodeManagementNodeKeys = "isLegacyNode"
type NodeManagementUserKeys = "getUserNodes"

export const NodeManagement = {
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
} as const satisfies Record<NodeManagementUserKeys, abi.Function.Definition>
