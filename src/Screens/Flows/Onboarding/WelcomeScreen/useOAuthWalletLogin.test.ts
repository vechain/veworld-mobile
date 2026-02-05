import { renderHook, act, waitFor } from "@testing-library/react-native"
import { useSocialWalletLogin } from "./useOAuthWalletLogin"

// Mock state for useSmartWallet
let mockSmartWalletState = {
    login: jest.fn(),
    isAuthenticated: false,
    smartAccountAddress: "",
}

jest.mock("~Hooks/useSmartWallet", () => ({
    useSmartWallet: jest.fn(() => mockSmartWalletState),
}))

// Mock Feedback
const mockFeedbackShow = jest.fn()
jest.mock("~Components/Providers/FeedbackProvider/Events", () => ({
    Feedback: {
        show: (params: unknown) => mockFeedbackShow(params),
    },
}))

jest.mock("~Components/Providers/FeedbackProvider/Model", () => ({
    FeedbackSeverity: { ERROR: "error" },
    FeedbackType: { ALERT: "alert" },
}))

// Mock i18n
jest.mock("~i18n", () => ({
    useI18nContext: () => ({
        LL: {
            COMMON_BTN_TRY_AGAIN: () => "Try again",
        },
    }),
}))

// Helper functions to set mock states
const setUnauthenticated = () => {
    mockSmartWalletState = {
        login: jest.fn(),
        isAuthenticated: false,
        smartAccountAddress: "",
    }
}

const setAuthenticatedWithAddress = (address: string) => {
    mockSmartWalletState = {
        login: jest.fn(),
        isAuthenticated: true,
        smartAccountAddress: address,
    }
}

const setAuthenticatedWithoutAddress = () => {
    mockSmartWalletState = {
        login: jest.fn(),
        isAuthenticated: true,
        smartAccountAddress: "",
    }
}

describe("useOAuthWalletLogin", () => {
    const mockOnCreateSmartWallet = jest.fn()
    const mockOnSmartWalletPinSuccess = jest.fn()

    const createDefaultParams = (provider: "google" | "apple" | "twitter" = "google") => ({
        provider,
        onCreateSmartWallet: mockOnCreateSmartWallet,
        onSmartWalletPinSuccess: mockOnSmartWalletPinSuccess,
    })

    beforeEach(() => {
        jest.clearAllMocks()
        setUnauthenticated()
    })

    describe("initial state", () => {
        it("should return initial state with no pending operations", () => {
            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams()))

            expect(result.current.isLoginPending).toBe(false)
            expect(result.current.pendingAddress).toBeNull()
            expect(typeof result.current.handleLogin).toBe("function")
            expect(typeof result.current.handlePinSuccess).toBe("function")
            expect(typeof result.current.clearPendingState).toBe("function")
        })
    })

    describe.each(["google", "apple"] as const)("handleLogin with %s provider", provider => {
        it("should trigger OAuth login when user is not authenticated", async () => {
            setUnauthenticated()
            mockSmartWalletState.login.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams(provider)))

            await act(async () => {
                await result.current.handleLogin()
            })

            expect(mockSmartWalletState.login).toHaveBeenCalledWith({
                provider,
                oauthRedirectUri: "/auth/callback",
            })
            expect(result.current.isLoginPending).toBe(true)
        })

        it("should call onCreateSmartWallet directly when already authenticated with address", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress)

            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams(provider)))

            await act(async () => {
                await result.current.handleLogin()
            })

            expect(mockSmartWalletState.login).not.toHaveBeenCalled()
            expect(mockOnCreateSmartWallet).toHaveBeenCalledWith({ address: testAddress })
            expect(result.current.pendingAddress).toBe(testAddress)
        })

        it("should set pending state when authenticated but address not yet available", async () => {
            setAuthenticatedWithoutAddress()

            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams(provider)))

            await act(async () => {
                await result.current.handleLogin()
            })

            expect(mockSmartWalletState.login).not.toHaveBeenCalled()
            expect(mockOnCreateSmartWallet).not.toHaveBeenCalled()
            expect(result.current.isLoginPending).toBe(true)
        })

        it("should show error feedback when login fails", async () => {
            setUnauthenticated()
            mockSmartWalletState.login.mockRejectedValue(new Error("Login failed"))

            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams(provider)))

            await act(async () => {
                await result.current.handleLogin()
            })

            expect(mockFeedbackShow).toHaveBeenCalledWith({
                severity: "error",
                type: "alert",
                message: "Try again",
                icon: "icon-alert-circle",
            })
            expect(result.current.isLoginPending).toBe(false)
        })

        it("should guard against duplicate login triggers", async () => {
            setUnauthenticated()
            // Make login hang indefinitely
            mockSmartWalletState.login.mockImplementation(() => new Promise(() => {}))

            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams(provider)))

            // First call
            act(() => {
                result.current.handleLogin()
            })

            // Second call while first is pending
            await act(async () => {
                await result.current.handleLogin()
            })

            // Login should only be called once
            expect(mockSmartWalletState.login).toHaveBeenCalledTimes(1)
        })
    })

    describe("useEffect - waiting for smartAccountAddress", () => {
        it("should call onCreateSmartWallet when address becomes available after login", async () => {
            const testAddress = "0xabcdef1234567890abcdef1234567890abcdef12"
            setUnauthenticated()
            mockSmartWalletState.login.mockResolvedValue(undefined)

            const { result, rerender } = renderHook(() => useSocialWalletLogin(createDefaultParams()))

            // Trigger login
            await act(async () => {
                await result.current.handleLogin()
            })

            expect(result.current.isLoginPending).toBe(true)
            expect(mockOnCreateSmartWallet).not.toHaveBeenCalled()

            // Simulate address becoming available
            setAuthenticatedWithAddress(testAddress)
            rerender({})

            await waitFor(() => {
                expect(mockOnCreateSmartWallet).toHaveBeenCalledWith({ address: testAddress })
            })

            expect(result.current.isLoginPending).toBe(false)
            expect(result.current.pendingAddress).toBe(testAddress)
        })
    })

    describe("handlePinSuccess", () => {
        it("should call onSmartWalletPinSuccess and return true when pendingAddress exists", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress)

            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams()))

            // Trigger login to set pending address
            await act(async () => {
                await result.current.handleLogin()
            })

            let returnValue: boolean = false
            act(() => {
                returnValue = result.current.handlePinSuccess("123456")
            })

            expect(returnValue).toBe(true)
            expect(mockOnSmartWalletPinSuccess).toHaveBeenCalledWith({
                pin: "123456",
                address: testAddress,
            })
            expect(result.current.pendingAddress).toBeNull()
        })

        it("should return false when no pendingAddress exists", () => {
            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams()))

            let returnValue: boolean = true
            act(() => {
                returnValue = result.current.handlePinSuccess("123456")
            })

            expect(returnValue).toBe(false)
            expect(mockOnSmartWalletPinSuccess).not.toHaveBeenCalled()
        })
    })

    describe("clearPendingState", () => {
        it("should clear all pending state", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress)

            const { result } = renderHook(() => useSocialWalletLogin(createDefaultParams()))

            // Set up pending state
            await act(async () => {
                await result.current.handleLogin()
            })

            expect(result.current.pendingAddress).toBe(testAddress)

            // Clear state
            act(() => {
                result.current.clearPendingState()
            })

            expect(result.current.pendingAddress).toBeNull()
            expect(result.current.isLoginPending).toBe(false)
        })
    })
})
