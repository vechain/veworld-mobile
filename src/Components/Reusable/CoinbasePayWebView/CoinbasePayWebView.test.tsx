import React from "react"
import { View } from "react-native"
import { render, waitFor } from "@testing-library/react-native"
import { CoinbasePayWebView } from "./CoinbasePayWebView"
import { TestWrapper } from "~Test"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"
import { DEVICE_TYPE } from "~Model"

var mockWebViewProps: any
var MockWebView: jest.Mock

// Mock WebView while preserving other exports
jest.mock("react-native-webview", () => {
    const actual = jest.requireActual("react-native-webview")
    MockWebView = jest.fn((props: any) => {
        mockWebViewProps = props
        return <View testID="webview" {...props} />
    })
    return {
        ...actual,
        WebView: MockWebView,
        default: MockWebView,
    }
})

// Mock react-navigation
const mockGoBack = jest.fn()
const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => {
    const actual = jest.requireActual("@react-navigation/native")
    return {
        ...actual,
        useNavigation: () => ({
            goBack: mockGoBack,
            navigate: mockNavigate,
            getState: () => ({ routes: [], index: 0 }),
            getParent: () => null,
        }),
    }
})

// Mock only the specific hooks needed for this component
const mockSignMessage = jest.fn()
const mockCheckIdentityBeforeOpening = jest.fn()
let onIdentityConfirmedCallback: ((password?: string) => Promise<any>) | null = null
let mockIsPasswordPromptOpen = false
let mockIsBiometricsEmpty = false

jest.mock("~Hooks/useCheckIdentity", () => ({
    useCheckIdentity: (options: any) => {
        // Store the callback so we can trigger it in tests
        if (options?.onIdentityConfirmed) {
            onIdentityConfirmedCallback = options.onIdentityConfirmed
        }
        return {
            isPasswordPromptOpen: mockIsPasswordPromptOpen,
            handleClosePasswordModal: jest.fn(),
            onPasswordSuccess: jest.fn(),
            checkIdentityBeforeOpening: mockCheckIdentityBeforeOpening,
            isBiometricsEmpty: mockIsBiometricsEmpty,
        }
    },
}))

jest.mock("~Hooks/useSignMessage", () => ({
    useSignMessage: () => ({
        signMessage: mockSignMessage,
    }),
}))

// Mock useInAppBrowser hook
jest.mock("~Components/Providers/InAppBrowserProvider/InAppBrowserProvider", () => ({
    useInAppBrowser: () => ({
        originWhitelist: ["*"],
    }),
}))

const VALID_SIGNATURE =
    // eslint-disable-next-line max-len
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b"

describe("CoinbasePayWebView", () => {
    let axiosMock: MockAdapter

    beforeAll(() => {
        axiosMock = new MockAdapter(axios as any)
    })

    beforeEach(() => {
        jest.clearAllMocks()
        axiosMock.reset()
        mockWebViewProps = undefined
        mockIsPasswordPromptOpen = false
        mockIsBiometricsEmpty = false
        onIdentityConfirmedCallback = null

        // Default mock implementation for signMessage
        // Returns a 65-byte signature (130 hex chars)
        mockSignMessage.mockResolvedValue(
            Buffer.from(
                VALID_SIGNATURE.slice(2), // Remove 0x prefix for Buffer.from
                "hex",
            ),
        )

        // Mock the checkIdentityBeforeOpening to trigger the callback
        mockCheckIdentityBeforeOpening.mockImplementation(() => {
            // Trigger the callback immediately to avoid unwrapped act warnings
            return onIdentityConfirmedCallback?.()
        })
    })

    afterAll(() => {
        axiosMock.restore()
    })

    const renderComponent = (props = {}) => {
        // Provide properly formatted preloaded state with valid hex addresses
        const testAddress = "0x1234567890123456789012345678901234567890"
        return render(
            <TestWrapper
                preloadedState={{
                    accounts: {
                        accounts: [
                            {
                                address: testAddress,
                                alias: "Test Account",
                                index: 0,
                                rootAddress: testAddress,
                                visible: true,
                            },
                        ],
                        selectedAccount: testAddress,
                    },
                    devices: [
                        {
                            alias: "Test Wallet",
                            index: 0,
                            rootAddress: testAddress,
                            type: DEVICE_TYPE.LOCAL_MNEMONIC,
                            position: 0,
                            wallet: JSON.stringify({
                                rootAddress: testAddress,
                            }),
                        },
                    ],
                }}>
                <CoinbasePayWebView destinationAddress={testAddress} {...props} />
            </TestWrapper>,
        )
    }

    describe("URL generation and HTTP request verification", () => {
        it("should make HTTP request to onramp-proxy with correct parameters", async () => {
            const destinationAddress = "0x1234567890123456789012345678901234567890"
            const expectedUrl = "https://coinbase.example.com/onramp?session=test123"

            // Mock any GET request to the onramp-proxy
            axiosMock.onGet().reply(200, { url: expectedUrl })

            renderComponent({ destinationAddress })

            await waitFor(
                () => {
                    // Verify axios made the request
                    expect(axiosMock.history.get.length).toBe(1)
                },
                { timeout: 3000 },
            )

            // Verify request parameters
            const request = axiosMock.history.get[0]
            expect(request.baseURL).toBe("https://onramp-proxy.vechain.org")
            expect(request.params.address).toBe(destinationAddress.toLowerCase())
            expect(request.params.provider).toBe("coinbase")

            // Verify signature and timestamp headers are present
            expect(request.headers?.["x-signature"]).toBe(VALID_SIGNATURE)

            // Verify timestamp header exists and is a valid timestamp
            expect(request.headers?.["x-timestamp"]).toMatch(/^\d+$/)
            const timestamp = parseInt(request.headers?.["x-timestamp"] as string, 10)
            expect(timestamp).toBeGreaterThan(Date.now() - 10000) // Within last 10 seconds
            expect(timestamp).toBeLessThanOrEqual(Date.now())
        })

        it("should pass address to the HTTP request", async () => {
            const destinationAddress = "0xABCDEF1234567890ABCDEF1234567890ABCDEF12"
            const expectedUrl = "https://coinbase.example.com/onramp?session=test789"

            axiosMock.onGet().reply(200, { url: expectedUrl })

            renderComponent({ destinationAddress })

            await waitFor(
                () => {
                    expect(axiosMock.history.get.length).toBe(1)
                },
                { timeout: 3000 },
            )

            const request = axiosMock.history.get[0]
            // The address is passed as-is to the API (lowercasing happens in signature generation)
            expect(request.params.address).toBe(destinationAddress)
            expect(request.params.provider).toBe("coinbase")
        })
    })

    describe("WebView isolation and integration", () => {
        it("should pass the URL from HTTP response to WebView", async () => {
            const expectedUrl = "https://coinbase.example.com/onramp?session=abc123&address=0xtest"

            axiosMock.onGet().reply(200, { url: expectedUrl })

            renderComponent()

            await waitFor(
                () => {
                    expect(mockWebViewProps).toBeDefined()
                    expect(mockWebViewProps.source.uri).toBe(expectedUrl)
                },
                { timeout: 3000 },
            )
        })
    })

    describe("Password prompt flow", () => {
        it("shows RequireUserPassword when biometrics are not used", async () => {
            const expectedUrl = "https://coinbase.example.com/onramp?session=needs-password"
            axiosMock.onGet().reply(200, { url: expectedUrl })

            mockIsBiometricsEmpty = false
            mockIsPasswordPromptOpen = true
            mockCheckIdentityBeforeOpening.mockImplementation(() => {})

            const { getByTestId } = renderComponent()
            await waitFor(() => {
                expect(getByTestId("require-user-password").props.visible).toBe(true)
            })
        })

        it("does not show RequireUserPassword when biometrics are used", async () => {
            const expectedUrl = "https://coinbase.example.com/onramp?session=with-biometrics"
            axiosMock.onGet().reply(200, { url: expectedUrl })

            mockIsBiometricsEmpty = false
            mockIsPasswordPromptOpen = false

            const { queryByTestId } = renderComponent()

            // Wait for the WebView to load, confirming the component has finished rendering
            await waitFor(() => {
                expect(mockWebViewProps).toBeDefined()
                expect(mockWebViewProps.source.uri).toBe(expectedUrl)
            })

            // Now assert that the password prompt is not present
            expect(queryByTestId("require-user-password")).toBeNull()
        })
    })
})
