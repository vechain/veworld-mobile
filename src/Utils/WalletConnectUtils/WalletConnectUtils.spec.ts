import {
    PendingRequestTypes,
    SessionTypes,
    SignClientTypes,
} from "@walletconnect/types"
import {
    formatJsonRpcError,
    getNetworkType,
    getPairAttributes,
    getRequestEventAttributes,
    getSessionRequestAttributes,
    getTopicFromPairUri,
    isValidURI,
} from "./WalletConnectUtils"
import { NETWORK_TYPE } from "~Model"

describe("getPairAttributes", () => {
    it("should return the pair attributes correctly", () => {
        const proposal = {
            id: 1686759172436187,
            params: {
                expiry: 1686759476,
                id: 1686759172436187,
                optionalNamespaces: {},
                pairingTopic:
                    "39b9a1788bc80abe3d4bd4c94bfbff873b8d4029dda0de4a65c7ca7dc018e074",
                proposer: {
                    metadata: {
                        name: "Test Name",
                        url: "https://example.com",
                        icons: ["https://example.com/icon.png"],
                        description: "Test Description",
                    },
                    publicKey:
                        "f2529989de7d1980d35d65a149fe0373716eff186ea6cb57fe363e82a4e3f119",
                },
                relays: [
                    {
                        protocol: "wc",
                    },
                ],
                requiredNamespaces: {
                    vechain: {
                        methods: ["method1", "method2"],
                        events: ["event1", "event2"],
                        chains: ["chain1", "chain2"],
                    },
                },
            },
            verifyContext: {
                verified: {
                    origin: "https://vechain-demo-dapp.netlify.app",
                    validation: "INVALID",
                    verifyUrl: "",
                },
            },
        }

        const attributes = getPairAttributes(
            proposal as SignClientTypes.EventArguments["session_proposal"],
        )

        expect(attributes).toEqual({
            name: "Test Name",
            url: "https://example.com",
            methods: ["method1", "method2"],
            events: ["event1", "event2"],
            chains: ["chain1", "chain2"],
            icon: "https://example.com/icon.png",
            description: "Test Description",
        })
    })
})

describe("getSessionRequestAttributes", () => {
    it("should return the session request attributes", () => {
        const sessionRequest = {
            peer: {
                metadata: {
                    name: "VeWorld Mobile Wallet",
                    icons: ["https://avatars.githubusercontent.com/u/37784886"],
                    url: "https://walletconnect.com/",
                },
            },
        }

        const expectedAttributes = {
            name: "VeWorld Mobile Wallet",
            icon: "https://avatars.githubusercontent.com/u/37784886",
            url: "https://walletconnect.com/",
        }

        const attributes = getSessionRequestAttributes(
            sessionRequest as SessionTypes.Struct,
        )

        expect(attributes).toEqual(expectedAttributes)
    })
})

describe("getRequestEventAttributes", () => {
    it("should return the request event attributes correctly", () => {
        const requestEvent = {
            params: {
                chainId: "vechain",
                request: {
                    method: "methodName",
                    params: ["param1", "param2"],
                },
            },
            topic: "eventTopic",
        }

        const attributes = getRequestEventAttributes(
            requestEvent as PendingRequestTypes.Struct,
        )

        expect(attributes).toEqual({
            chainId: "VECHAIN",
            method: "methodName",
            params: "param1",
            topic: "eventTopic",
        })
    })
})

describe("isValidURI", () => {
    it("should return true for a valid URI", () => {
        const validURI = "wc:topic@2?symKey=key&relay-protocol=protocol"

        const result = isValidURI(validURI)

        expect(result).toBe(true)
    })

    it("should return false for an empty URI", () => {
        const emptyURI = ""

        const result = isValidURI(emptyURI)

        expect(result).toBe(false)
    })

    it("should return false for an invalid URI format", () => {
        const invalidURI = "invalidFormat"

        const result = isValidURI(invalidURI)

        expect(result).toBe(false)
    })

    it("should return false for a URI with incorrect version", () => {
        const incorrectVersionURI =
            "wc:topic@1?symKey=key&relay-protocol=protocol"

        const result = isValidURI(incorrectVersionURI)

        expect(result).toBe(false)
    })

    it("should return false for a URI missing required parameters", () => {
        const missingParametersURI = "wc:topic@2?symKey=key"

        const result = isValidURI(missingParametersURI)

        expect(result).toBe(false)
    })
})

describe("formatJsonRpcError", () => {
    it("should format the JSON-RPC error correctly", () => {
        const id = 123
        const error = {
            code: 1234,
            message: "Error message",
        }

        const result = formatJsonRpcError(id, error)

        expect(result).toEqual({
            id: 123,
            jsonrpc: "2.0",
            error: {
                code: 1234,
                message: "Error message",
            },
        })
    })
})

describe("getNetworkType", () => {
    it("should return defaultMainNetwork for a main network chainId", () => {
        // Define the input
        const chainId = "vechain:main"

        // Call the function
        const result = getNetworkType(chainId)

        // Assertion
        expect(result.type).toEqual(NETWORK_TYPE.MAIN)
    })

    it("should return defaultMainNetwork for a mainnet network chainId", () => {
        // Define the input
        const chainId = "vechain:mainnet"

        // Call the function
        const result = getNetworkType(chainId)

        // Assertion
        expect(result.type).toEqual(NETWORK_TYPE.MAIN)
    })

    it("should return defaultTestNetwork for a test network chainId", () => {
        // Define the input
        const chainId = "example:test"

        // Call the function
        const result = getNetworkType(chainId)

        // Assertion
        expect(result.type).toEqual(NETWORK_TYPE.TEST)
    })

    it("should return defaultMainNetwork for an unknown network chainId", () => {
        // Define the input
        const chainId = "example:unknown"

        // Call the function
        const result = getNetworkType(chainId)

        // Assertion
        expect(result.type).toEqual(NETWORK_TYPE.MAIN)
    })
})

describe("getTopicFromPairUri", () => {
    it("should return the topic from the pair uri", () => {
        const uri =
            "wc:f806fb3ec5966416231fa4843266c62c325dbc91ed43738c85aff5614001f12d@2?relay-protocol=irn&symKey=a595115e95bb91be8c4659c7cc97379aa519be872dacbd66c9075cb70367342f"

        const topic = getTopicFromPairUri(uri)

        expect(topic).toEqual(
            "f806fb3ec5966416231fa4843266c62c325dbc91ed43738c85aff5614001f12d",
        )
    })

    it("should throw an error if the uri is invalid", () => {
        const uri = "invalidUri"

        expect(() => getTopicFromPairUri(uri)).toThrowError()
    })
})
