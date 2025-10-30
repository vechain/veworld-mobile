import { abi } from "thor-devkit"

export const getAddresses: abi.Function.Definition = {
    inputs: [
        {
            internalType: "string[]",
            name: "names",
            type: "string[]",
        },
    ],
    name: "getAddresses",
    outputs: [
        {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const getNames: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address[]",
            name: "addresses",
            type: "address[]",
        },
    ],
    name: "getNames",
    outputs: [
        {
            internalType: "string[]",
            name: "names",
            type: "string[]",
        },
    ],
    stateMutability: "view",
    type: "function",
}

/**
 * Function definition clause for claiming a subdomain from .vetDomains
 */
export const claim: abi.Function.Definition = {
    inputs: [
        {
            internalType: "string",
            name: "name",
            type: "string",
        },
        {
            internalType: "contract PublicResolver",
            name: "resolver",
            type: "address",
        },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}

/**
 * Function definition clause for set the reverse registrar of subdomain
 */
export const setName: abi.Function.Definition = {
    inputs: [{ internalType: "string", name: "name", type: "string" }],
    name: "setName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
}

/**
 * Function definition to get a text record from the Vet Domains Public Resolver
 */
export const text = {
    inputs: [
        {
            internalType: "bytes32",
            name: "node",
            type: "bytes32",
        },
        {
            internalType: "string",
            name: "key",
            type: "string",
        },
    ],
    name: "text",
    outputs: [
        {
            internalType: "string",
            name: "",
            type: "string",
        },
    ],
    stateMutability: "view",
    type: "function",
} as const

/**
 * Function definition to get the resolver address from the Vet Domains Registry
 */
export const resolver = {
    inputs: [
        {
            internalType: "bytes32",
            name: "node",
            type: "bytes32",
        },
    ],
    name: "resolver",
    outputs: [
        {
            internalType: "address",
            name: "",
            type: "address",
        },
    ],
    stateMutability: "view",
    type: "function",
} as const
