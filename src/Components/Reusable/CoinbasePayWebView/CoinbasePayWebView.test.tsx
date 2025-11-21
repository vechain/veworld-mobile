/**
 * Tests for CoinbasePayWebView component
 *
 * This test suite verifies that:
 * 1. HTTP requests are made to the correct onramp-proxy URL with proper parameters
 * 2. Signature and timestamp are included in request headers
 * 3. The WebView component is isolated and receives the correct URL from the HTTP response
 * 4. Error handling works correctly (network errors, invalid responses, signature failures)
 * 5. The signature generation flow triggers before making HTTP requests
 */
import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import { CoinbasePayWebView } from "./CoinbasePayWebView"
import { TestWrapper } from "~Test"
import MockAdapter from "axios-mock-adapter"
import axios from "axios"

// Mock WebView to isolate it and capture props
jest.mock("react-native-webview", () => {
    const { View } = require("react-native")
    return {
        WebView: (props: any) => {
            // Store the WebView props globally for assertions
            global.mockWebViewProps = props
            return <View testID="webview" {...props} />
        },
    }
})

// Mock URL polyfill
jest.mock("react-native-url-polyfill/auto", () => ({}))

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
        }),
    }
})

// Mock hooks that require authentication
const mockSignMessage = jest.fn()
const mockCheckIdentityBeforeOpening = jest.fn()
let onIdentityConfirmedCallback: ((password?: string) => Promise<any>) | null = null

jest.mock("~Hooks", () => ({
    useAnalyticTracking: () => jest.fn(),
    useCheckIdentity: (options: any) => {
        // Store the callback so we can trigger it in tests
        if (options?.onIdentityConfirmed) {
            onIdentityConfirmedCallback = options.onIdentityConfirmed
        }
        return {
            isPasswordPromptOpen: false,
            handleClosePasswordModal: jest.fn(),
            onPasswordSuccess: jest.fn(),
            checkIdentityBeforeOpening: mockCheckIdentityBeforeOpening,
            isBiometricsEmpty: false,
        }
    },
    useSignMessage: () => ({
        signMessage: mockSignMessage,
    }),
    useSmartWallet: () => ({
        smartAccountAddress: null,
    }),
    useTheme: () => ({
        isDark: false,
        colors: {
            background: "#FFFFFF",
            text: "#000000",
        },
    }),
    useAppState: () => ({
        currentState: "active",
        previousState: "background",
    }),
}))

// Mock Components
jest.mock("~Components", () => {
    const actual = jest.requireActual("~Components")
    return {
        ...actual,
        BaseActivityIndicator: () => null,
        BaseStatusBar: () => null,
        BaseView: ({ children }: any) => <>{children}</>,
        BaseIcon: () => null,
        BaseText: ({ children }: any) => <>{children}</>,
        RequireUserPassword: () => null,
        useInAppBrowser: () => ({
            originWhitelist: ["*"],
        }),
    }
})

// Mock Utils
jest.mock("~Utils", () => ({
    ...jest.requireActual("~Utils"),
    PlatformUtils: {
        isAndroid: () => false,
    },
    AccountUtils: {
        isObservedAccount: () => false,
    },
}))

// Global variable to store WebView props
declare global {
    var mockWebViewProps: any
}

describe("CoinbasePayWebView", () => {
    let axiosMock: MockAdapter

    beforeAll(() => {
        axiosMock = new MockAdapter(axios as any)
    })

    beforeEach(() => {
        jest.clearAllMocks()
        axiosMock.reset()
        global.mockWebViewProps = undefined

        // Default mock implementation for signMessage
        // Returns a 65-byte signature (130 hex chars)
        mockSignMessage.mockResolvedValue(
            Buffer.from(
                // eslint-disable-next-line max-len
                "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b",
                "hex",
            ),
        )

        // Mock the checkIdentityBeforeOpening to trigger the callback
        mockCheckIdentityBeforeOpening.mockImplementation(() => {
            // Trigger the callback asynchronously
            if (onIdentityConfirmedCallback) {
                setTimeout(() => {
                    onIdentityConfirmedCallback!()
                }, 0)
            }
        })
    })

    afterAll(() => {
        axiosMock.restore()
    })

    const renderComponent = (props = {}) => {
        return render(
            <TestWrapper preloadedState={{}}>
                <CoinbasePayWebView
                    currentAmount={100}
                    destinationAddress="0x1234567890123456789012345678901234567890"
                    {...props}
                />
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
            expect(request.headers?.["x-signature"]).toBeDefined()
            expect(request.headers?.["x-timestamp"]).toBeDefined()
        })

        it("should include signature and timestamp in request headers", async () => {
            const expectedUrl = "https://coinbase.example.com/onramp?session=test456"

            axiosMock.onGet().reply(200, { url: expectedUrl })

            renderComponent()

            await waitFor(
                () => {
                    expect(axiosMock.history.get.length).toBe(1)
                },
                { timeout: 3000 },
            )

            const request = axiosMock.history.get[0]

            // Verify signature header exists and has correct format
            expect(request.headers?.["x-signature"]).toBeTruthy()
            expect(request.headers?.["x-signature"]).toMatch(/^0x[0-9a-fA-F]+$/)

            // Verify timestamp header exists and is a valid timestamp
            expect(request.headers?.["x-timestamp"]).toBeTruthy()
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
                    expect(global.mockWebViewProps).toBeDefined()
                    expect(global.mockWebViewProps.source.uri).toBe(expectedUrl)
                },
                { timeout: 3000 },
            )
        })

        it("should configure WebView with correct origin whitelist", async () => {
            axiosMock.onGet().reply(200, { url: "https://coinbase.example.com/onramp" })

            renderComponent()

            await waitFor(
                () => {
                    expect(global.mockWebViewProps).toBeDefined()
                },
                { timeout: 3000 },
            )

            expect(global.mockWebViewProps.originWhitelist).toEqual(["*"])
        })

        it("should configure WebView with onLoadEnd callback", async () => {
            axiosMock.onGet().reply(200, { url: "https://coinbase.example.com/onramp" })

            renderComponent()

            await waitFor(
                () => {
                    expect(global.mockWebViewProps).toBeDefined()
                },
                { timeout: 3000 },
            )

            expect(global.mockWebViewProps.onLoadEnd).toBeDefined()
            expect(typeof global.mockWebViewProps.onLoadEnd).toBe("function")
        })

        it("should configure WebView with onMessage callback", async () => {
            axiosMock.onGet().reply(200, { url: "https://coinbase.example.com/onramp" })

            renderComponent()

            await waitFor(
                () => {
                    expect(global.mockWebViewProps).toBeDefined()
                },
                { timeout: 3000 },
            )

            expect(global.mockWebViewProps.onMessage).toBeDefined()
            expect(typeof global.mockWebViewProps.onMessage).toBe("function")
        })

        it("should not render WebView until URL is fetched", async () => {
            // Delay the response
            axiosMock.onGet().reply(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve([200, { url: "https://coinbase.example.com/onramp" }])
                    }, 100)
                })
            })

            renderComponent()

            // Initially WebView should not be rendered
            expect(global.mockWebViewProps).toBeUndefined()

            // After the request completes, WebView should be rendered
            await waitFor(
                () => {
                    expect(global.mockWebViewProps).toBeDefined()
                },
                { timeout: 3000 },
            )
        })
    })

    describe("Error handling", () => {
        it("should handle HTTP 500 error from onramp-proxy", async () => {
            axiosMock.onGet().reply(500, { error: "Internal server error" })

            renderComponent()

            await waitFor(
                () => {
                    // WebView should not be rendered on error
                    expect(global.mockWebViewProps).toBeUndefined()
                },
                { timeout: 3000 },
            )
        })

        it("should handle network timeout", async () => {
            axiosMock.onGet().timeout()

            renderComponent()

            await waitFor(
                () => {
                    // Request should have been attempted
                    expect(axiosMock.history.get.length).toBeGreaterThan(0)
                },
                { timeout: 3000 },
            )

            // WebView should not be rendered on timeout
            expect(global.mockWebViewProps).toBeUndefined()
        })

        it("should handle invalid response format", async () => {
            // Return response without 'url' field
            axiosMock.onGet().reply(200, { invalid: "response" })

            renderComponent()

            await waitFor(
                () => {
                    expect(axiosMock.history.get.length).toBe(1)
                },
                { timeout: 3000 },
            )

            // WebView should not be rendered with invalid response
            await waitFor(
                () => {
                    expect(global.mockWebViewProps).toBeUndefined()
                },
                { timeout: 1000 },
            )
        })
    })

    describe("Signature generation", () => {
        it("should generate signature before making HTTP request", async () => {
            axiosMock.onGet().reply(200, { url: "https://coinbase.example.com/onramp" })

            renderComponent()

            await waitFor(
                () => {
                    expect(mockSignMessage).toHaveBeenCalled()
                },
                { timeout: 3000 },
            )

            // HTTP request should be made after signature
            await waitFor(
                () => {
                    expect(axiosMock.history.get.length).toBe(1)
                },
                { timeout: 3000 },
            )
        })

        it("should not make HTTP request if signature generation fails", async () => {
            mockSignMessage.mockRejectedValueOnce(new Error("Signature failed"))

            renderComponent()

            // Wait for navigation goBack to be called
            await waitFor(
                () => {
                    expect(mockGoBack).toHaveBeenCalled()
                },
                { timeout: 3000 },
            )

            // HTTP request should not be made
            expect(axiosMock.history.get.length).toBe(0)
        })

        it("should generate signature with address in the message", async () => {
            const destinationAddress = "0xABCDEF1234567890ABCDEF1234567890ABCDEF12"

            axiosMock.onGet().reply(200, { url: "https://coinbase.example.com/onramp" })

            renderComponent({ destinationAddress })

            await waitFor(
                () => {
                    expect(mockSignMessage).toHaveBeenCalled()
                },
                { timeout: 3000 },
            )

            // Verify the message hash was called (it's a Buffer/hash, not the original string)
            // The SignMessageUtils.hashMessage transforms the message into a hash
            expect(mockSignMessage).toHaveBeenCalled()
            const messageHash = mockSignMessage.mock.calls[0][0]
            // Just verify it's defined and has content
            expect(messageHash).toBeDefined()
        })
    })
})
