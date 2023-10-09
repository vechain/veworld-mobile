import { PendingRequestTypes } from "@walletconnect/types"
import { getTopicFromPairUri, isValidURI } from "./WalletConnectUtils"
import { NavigationState } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { IWeb3Wallet } from "@walletconnect/web3wallet"

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

const mockPendingRequest = (params: unknown): PendingRequestTypes.Struct => {
    return {
        topic: "topic",
        id: 1,
        params: {
            request: {
                method: "method",
                params,
            },
            chainId: "vechain",
        },
        verifyContext: {
            verified: {
                origin: "https://vechain-demo-dapp.netlify.app",
                validation: "INVALID",
                verifyUrl: "",
            },
        },
    }
}

describe("getSignCertOptions", () => {
    it("should return the sign cert options", () => {
        const providedOptions: Connex.Driver.CertOptions = {
            signer: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        }

        const requestEvent = mockPendingRequest([{ options: providedOptions }])

        const extractedOptions = getSignCertOptions(requestEvent)

        expect(extractedOptions).toEqual(providedOptions)
    })

    it("should return empty object if options are not provided", () => {
        const requestEvent: PendingRequestTypes.Struct = {
            topic: "topic",
            id: 1,
            params: {
                request: {
                    method: "method",
                    params: [{}],
                },
                chainId: "vechain",
            },
            verifyContext: {
                verified: {
                    origin: "https://vechain-demo-dapp.netlify.app",
                    validation: "INVALID",
                    verifyUrl: "",
                },
            },
        }

        const extractedOptions = getSignCertOptions(requestEvent)

        expect(extractedOptions).toEqual({})
    })

    it("empty object if params are empty", () => {
        const requestEvent = mockPendingRequest([])

        const extractedOptions = getSignCertOptions(requestEvent)

        expect(extractedOptions).toEqual({})
    })
})

describe("shouldAutoNavigate", () => {
    it("should return true for a valid WalletConnect route", () => {
        const mockState = (routeName: Routes) => {
            const navState: NavigationState<ReactNavigation.RootParamList> = {
                key: "key",
                index: 0,
                routeNames: [],
                routes: [
                    {
                        key: "key",
                        // @ts-ignore
                        name: routeName,
                    },
                ],
                type: "type",
                stale: false,
            }

            return navState
        }

        expect(shouldAutoNavigate(mockState(Routes.CONNECT_APP_SCREEN))).toBe(
            false,
        )

        expect(
            shouldAutoNavigate(
                mockState(Routes.CONNECTED_APP_SEND_TRANSACTION_SCREEN),
            ),
        ).toBe(false)

        expect(
            shouldAutoNavigate(
                mockState(Routes.CONNECTED_APP_SIGN_CERTIFICATE_SCREEN),
            ),
        ).toBe(false)

        expect(shouldAutoNavigate(mockState(Routes.BUY))).toBe(true)
        expect(shouldAutoNavigate(mockState(Routes.APP_SECURITY))).toBe(true)
    })

    it("should return false for undefined ", () => {
        // @ts-ignore
        expect(shouldAutoNavigate(undefined)).toBe(false)
    })
})

describe("getSignCertMessage", () => {
    it("should return the sign cert message", () => {
        const message: Connex.Vendor.CertMessage = {
            purpose: "identification",
            payload: {
                type: "text",
                content: "message",
            },
        }

        const requestEvent = mockPendingRequest([{ message }])

        expect(getSignCertMessage(requestEvent)).toEqual(message)
    })

    it("should return undefined without message", () => {
        const requestEvent = mockPendingRequest([{}])

        expect(getSignCertMessage(requestEvent)).toEqual(undefined)
    })

    it("should return undefined without payload", () => {
        const message = {
            purpose: "identification",
        }

        const requestEvent = mockPendingRequest([{ message }])

        expect(getSignCertMessage(requestEvent)).toEqual(undefined)
    })

    it("should return undefined without type", () => {
        const message = {
            purpose: "identification",
            payload: {
                content: "message",
            },
        }

        const requestEvent = mockPendingRequest([{ message }])

        expect(getSignCertMessage(requestEvent)).toEqual(undefined)
    })

    it("should return undefined without purpose", () => {
        const message = {
            payload: {
                type: "text",
                content: "message",
            },
        }

        const requestEvent = mockPendingRequest([{ message }])

        expect(getSignCertMessage(requestEvent)).toEqual(undefined)
    })
})

describe("getSendTxMessage", () => {
    it("empty data and empty value should return undefined", () => {
        const message: Connex.Vendor.TxMessage = [
            {
                to: null,
                data: "0x",
                value: "0x",
            },
        ]

        const requestEvent = mockPendingRequest([{ message }])

        expect(getSendTxMessage(requestEvent)).toEqual(undefined)
    })

    it("valid data should return cleansed message", () => {
        const message: Connex.Vendor.TxMessage = [
            {
                to: null,
                data: "0x12341234",
                value: "",
            },
        ]

        const requestEvent = mockPendingRequest([{ message }])

        expect(getSendTxMessage(requestEvent)).toEqual([
            {
                to: null,
                data: "0x12341234",
                value: "0x0",
            },
        ])
    })

    it("empty array should return undefined", () => {
        const message: Connex.Vendor.TxMessage = []

        const requestEvent = mockPendingRequest([{ message }])

        expect(getSendTxMessage(requestEvent)).toEqual(undefined)
    })

    it("no message should return undefined", () => {
        const requestEvent = mockPendingRequest([{}])

        expect(getSendTxMessage(requestEvent)).toEqual(undefined)
    })
})

describe("getSendTxOptions", () => {
    it("should return the original tx options", () => {
        const options: Connex.Driver.TxOptions = {
            signer: "0x1234",
        }

        const requestEvent = mockPendingRequest([{ options }])

        expect(getSendTxOptions(requestEvent)).toEqual(options)
    })

    it("no options should return empty object", () => {
        const requestEvent = mockPendingRequest([{}])

        expect(getSendTxOptions(requestEvent)).toEqual({})
    })

    it("empty array should return empty object", () => {
        const requestEvent = mockPendingRequest([])

        expect(getSendTxOptions(requestEvent)).toEqual({})
    })
})

describe("getNameAndUrl", () => {
    it("should return no name or url", () => {
        expect(getNameAndUrl(undefined, undefined)).toEqual({})
    })

    it("should return name and url", () => {
        const requestEvent = {
            params: {
                chainId: "vechain",
                request: {
                    method: "methodName",
                    params: ["param1", "param2"],
                },
            },
            topic: "eventTopic",
        } as PendingRequestTypes.Struct

        const web3Wallet = {
            getActiveSessions: () => {
                return {
                    [requestEvent.topic]: {
                        peer: {
                            metadata: {
                                name: "VeWorld Mobile Wallet",
                                icons: [
                                    "https://avatars.githubusercontent.com/u/37784886",
                                ],
                                url: "https://walletconnect.com/",
                            },
                        },
                    },
                }
            },
        } as IWeb3Wallet

        expect(getNameAndUrl(web3Wallet, requestEvent)).toEqual({
            name: "VeWorld Mobile Wallet",
            url: "https://walletconnect.com/",
            description: undefined,
            icon: "https://avatars.githubusercontent.com/u/37784886",
        })
    })
})
