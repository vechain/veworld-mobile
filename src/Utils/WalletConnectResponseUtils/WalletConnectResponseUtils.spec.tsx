import { SignClientTypes } from "@walletconnect/types"
import {
    signMessageRequestSuccessResponse,
    sponsorSignRequestFailedResponse,
    transactionRequestFailedResponse,
    transactionRequestSuccessResponse,
    userRejectedMethodsResponse,
} from "./WalletConnectResponseUtils"
import { showErrorToast, showSuccessToast } from "~Components"
import { Certificate } from "thor-devkit"

// Mock the dependencies
jest.mock("~Components/Base/BaseToast/BaseToast", () => ({
    ...jest.requireActual("~Components/Base/BaseToast/BaseToast"),
    showSuccessToast: jest.fn(),
    showErrorToast: jest.fn(),
    showWarningToast: jest.fn(),
}))

describe("transactionRequestSuccessResponse", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should respond to the session request and show success toast", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest.fn().mockResolvedValue(undefined),
        }
        const LL = {
            NOTIFICATION_wallet_connect_transaction_broadcasted: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
            params: {
                chainId: "vechain",
                request: {
                    method: "methodName",
                    params: ["param1", "param2"],
                },
            },
        }
        const transactionId = 456
        const signer = "example-signer"

        // Call the function
        await transactionRequestSuccessResponse(
            { request, web3Wallet, LL } as {
                request: SignClientTypes.EventArguments["session_request"]
                web3Wallet: any
                LL: any
            },
            transactionId,
            signer,
        )

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalledWith({
            topic: "example-topic",
            response: {
                id: 123,
                jsonrpc: "2.0",
                result: {
                    txid: 456,
                    signer: "example-signer",
                },
            },
        })
        expect(
            LL.NOTIFICATION_wallet_connect_transaction_broadcasted,
        ).toHaveBeenCalled()
        expect(showSuccessToast).toHaveBeenCalled()
        expect(showErrorToast).not.toHaveBeenCalled()
    })

    it("should show error toast when responding to the session request throws an error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest.fn().mockRejectedValue(() => {
                throw new Error("No matching key")
            }),
        }
        const LL = {
            NOTIFICATION_wallet_connect_transaction_broadcasted_with_communication_error:
                jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }
        const transactionId = 456
        const signer = "example-signer"

        // Call the function
        await transactionRequestSuccessResponse(
            { request, web3Wallet, LL } as {
                request: SignClientTypes.EventArguments["session_request"]
                web3Wallet: any
                LL: any
            },
            transactionId,
            signer,
        )

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalledWith({
            topic: "example-topic",
            response: {
                id: 123,
                jsonrpc: "2.0",
                result: {
                    txid: 456,
                    signer: "example-signer",
                },
            },
        })
        expect(
            LL.NOTIFICATION_wallet_connect_transaction_broadcasted_with_communication_error,
        ).toHaveBeenCalled()
        expect(showSuccessToast).not.toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalled()
    })
})

describe("signMessageRequestSuccessResponse", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should respond to the session request with success", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest.fn().mockResolvedValue(undefined),
        }
        const LL = {
            NOTIFICATION_wallet_connect_sign_success: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }
        const signature = Buffer.from("example-signature", "utf-8")
        const cert = {
            timestamp: 12313123123,
            domain: "example-domain",
            signer: "example-signer",
            purpose: "example-purpose",
            payload: {
                type: "example-type",
                content: "example-content",
            },
        }

        // Call the function
        await signMessageRequestSuccessResponse(
            { request, web3Wallet, LL } as {
                request: SignClientTypes.EventArguments["session_request"]
                web3Wallet: any
                LL: any
            },
            signature,
            cert as Certificate,
        )

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalledWith({
            topic: "example-topic",
            response: {
                id: 123,
                jsonrpc: "2.0",
                result: {
                    annex: {
                        timestamp: 12313123123,
                        domain: "example-domain",
                        signer: "example-signer",
                    },
                    signature: "0x6578616d706c652d7369676e6174757265", // HexUtils.addPrefix(signature.toString("hex"))
                },
            },
        })
        expect(LL.NOTIFICATION_wallet_connect_sign_success).toHaveBeenCalled()
        expect(showSuccessToast).toHaveBeenCalled()
        expect(showErrorToast).not.toHaveBeenCalled()
    })

    it("should show error toast when responding to the session request throws an error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest
                .fn()
                .mockRejectedValue(new Error("Network error")),
        }
        const LL = {
            NOTIFICATION_wallet_connect_matching_error: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }
        const signature = Buffer.from("example-signature", "utf-8")
        const cert = {
            timestamp: 12313123123,
            domain: "example-domain",
            signer: "example-signer",
            purpose: "example-purpose",
            payload: {
                type: "example-type",
                content: "example-content",
            },
        }

        // Call the function
        await signMessageRequestSuccessResponse(
            { request, web3Wallet, LL } as {
                request: SignClientTypes.EventArguments["session_request"]
                web3Wallet: any
                LL: any
            },
            signature,
            cert,
        )

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalledWith({
            topic: "example-topic",
            response: {
                id: 123,
                jsonrpc: "2.0",
                result: {
                    annex: {
                        timestamp: 12313123123,
                        domain: "example-domain",
                        signer: "example-signer",
                    },
                    signature: "0x6578616d706c652d7369676e6174757265", // HexUtils.addPrefix(signature.toString("hex"))
                },
            },
        })
        expect(LL.NOTIFICATION_wallet_connect_matching_error).toHaveBeenCalled()
        expect(showSuccessToast).not.toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalled()
    })
})

describe("transactionRequestFailedResponse", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should respond to the session request with a failed transaction error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest.fn().mockResolvedValue(undefined),
        }
        const LL = {
            NOTIFICATION_wallet_connect_error_on_transaction: jest.fn(),
            NOTIFICATION_wallet_connect_matching_error: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }

        // Call the function
        await transactionRequestFailedResponse({ request, web3Wallet, LL } as {
            request: SignClientTypes.EventArguments["session_request"]
            web3Wallet: any
            LL: any
        })

        // Assertions
        expect(
            LL.NOTIFICATION_wallet_connect_error_on_transaction,
        ).toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalledWith(
            LL.NOTIFICATION_wallet_connect_error_on_transaction(),
        )
        expect(
            LL.NOTIFICATION_wallet_connect_matching_error,
        ).not.toHaveBeenCalled()
    })

    it("should show error toast when responding to the session request throws an error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest
                .fn()
                .mockRejectedValue(new Error("Network error")),
        }
        const LL = {
            NOTIFICATION_wallet_connect_error_on_transaction: jest.fn(),
            NOTIFICATION_wallet_connect_matching_error: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }

        // Call the function
        await transactionRequestFailedResponse({ request, web3Wallet, LL } as {
            request: SignClientTypes.EventArguments["session_request"]
            web3Wallet: any
            LL: any
        })

        // Assertions
        expect(
            LL.NOTIFICATION_wallet_connect_error_on_transaction,
        ).toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalledWith(
            LL.NOTIFICATION_wallet_connect_error_on_transaction(),
        )
        expect(LL.NOTIFICATION_wallet_connect_matching_error).toHaveBeenCalled()
    })
})

describe("sponsorSignRequestFailedResponse", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should respond to the session request with a failed sponsor sign error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest.fn().mockResolvedValue(undefined),
        }
        const LL = {
            NOTIFICATION_wallet_connect_error_delegating_transaction: jest.fn(),
            NOTIFICATION_wallet_connect_matching_error: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }

        // Call the function
        await sponsorSignRequestFailedResponse({ request, web3Wallet, LL } as {
            request: SignClientTypes.EventArguments["session_request"]
            web3Wallet: any
            LL: any
        })

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalledWith({
            topic: "example-topic",
            response: {
                id: 123,
                jsonrpc: "2.0",
                error: LL.NOTIFICATION_wallet_connect_error_delegating_transaction(),
            },
        })
        expect(
            LL.NOTIFICATION_wallet_connect_error_delegating_transaction,
        ).toHaveBeenCalled()
        expect(showErrorToast).not.toHaveBeenCalled()
        expect(
            LL.NOTIFICATION_wallet_connect_matching_error,
        ).not.toHaveBeenCalled()
    })

    it("should show error toast when responding to the session request throws an error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest
                .fn()
                .mockRejectedValue(new Error("Network error")),
        }
        const LL = {
            NOTIFICATION_wallet_connect_error_delegating_transaction: jest.fn(),
            NOTIFICATION_wallet_connect_matching_error: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }

        // Call the function
        await sponsorSignRequestFailedResponse({ request, web3Wallet, LL } as {
            request: SignClientTypes.EventArguments["session_request"]
            web3Wallet: any
            LL: any
        })

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalledWith({
            topic: "example-topic",
            response: {
                id: 123,
                jsonrpc: "2.0",
                error: LL.NOTIFICATION_wallet_connect_error_delegating_transaction(),
            },
        })
        expect(
            LL.NOTIFICATION_wallet_connect_error_delegating_transaction,
        ).toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalledWith(
            LL.NOTIFICATION_wallet_connect_matching_error(),
        )
    })
})

describe("userRejectedMethodsResponse", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should respond to the session request with a user rejected methods error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest.fn().mockResolvedValue(undefined),
        }
        const LL = {
            NOTIFICATION_wallet_connect_matching_error: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }

        // Call the function
        await userRejectedMethodsResponse({ request, web3Wallet, LL } as {
            request: SignClientTypes.EventArguments["session_request"]
            web3Wallet: any
            LL: any
        })

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalled()
        expect(
            LL.NOTIFICATION_wallet_connect_matching_error,
        ).not.toHaveBeenCalled()
        expect(showErrorToast).not.toHaveBeenCalled()
    })

    it("should show error toast when responding to the session request throws an error", async () => {
        // Mock the dependencies
        const web3Wallet = {
            respondSessionRequest: jest
                .fn()
                .mockRejectedValue(new Error("Network error")),
        }
        const LL = {
            NOTIFICATION_wallet_connect_matching_error: jest.fn(),
        }
        const request = {
            topic: "example-topic",
            id: 123,
        }

        // Call the function
        await userRejectedMethodsResponse({ request, web3Wallet, LL } as {
            request: SignClientTypes.EventArguments["session_request"]
            web3Wallet: any
            LL: any
        })

        // Assertions
        expect(web3Wallet.respondSessionRequest).toHaveBeenCalled()
        expect(LL.NOTIFICATION_wallet_connect_matching_error).toHaveBeenCalled()
        expect(showErrorToast).toHaveBeenCalled()
    })
})
