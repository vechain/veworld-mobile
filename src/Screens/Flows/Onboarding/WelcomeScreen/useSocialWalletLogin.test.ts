import { renderHook, act, waitFor } from "@testing-library/react-native"
import { useSocialWalletLogin } from "./useSocialWalletLogin"

// Mock state for useSmartWallet
let mockSmartWalletState: {
    login: jest.Mock
    isAuthenticated: boolean
    smartAccountAddress: string
    userDisplayName?: string | null
} = {
    login: jest.fn(),
    isAuthenticated: false,
    smartAccountAddress: "",
    userDisplayName: null,
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
        userDisplayName: null,
    }
}

const setAuthenticatedWithAddress = (address: string, userDisplayName?: string | null) => {
    mockSmartWalletState = {
        login: jest.fn(),
        isAuthenticated: true,
        smartAccountAddress: address,
        userDisplayName: userDisplayName ?? null,
    }
}

const setAuthenticatedWithoutAddress = () => {
    mockSmartWalletState = {
        login: jest.fn(),
        isAuthenticated: true,
        smartAccountAddress: "",
        userDisplayName: null,
    }
}

describe("useSocialWalletLogin", () => {
    const mockOnCreateSmartWallet = jest.fn()
    const mockOnSmartWalletPinSuccess = jest.fn()

    const defaultParams = {
        onCreateSmartWallet: mockOnCreateSmartWallet,
        onSmartWalletPinSuccess: mockOnSmartWalletPinSuccess,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        setUnauthenticated()
    })

    describe("initial state", () => {
        it("should return initial state with no pending operations", () => {
            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            expect(result.current.isLoginPending).toBe(false)
            expect(result.current.pendingProvider).toBeNull()
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

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            await act(async () => {
                await result.current.handleLogin(provider)
            })

            expect(mockSmartWalletState.login).toHaveBeenCalledWith({
                provider,
                oauthRedirectUri: "/auth/callback",
            })
            expect(result.current.isLoginPending).toBe(true)
            expect(result.current.pendingProvider).toBe(provider)
        })

        it("should call login and then onCreateSmartWallet when already authenticated with address", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress)
            mockSmartWalletState.login.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            await act(async () => {
                await result.current.handleLogin(provider)
            })

            expect(mockSmartWalletState.login).toHaveBeenCalledWith({
                provider,
                oauthRedirectUri: "/auth/callback",
            })
            expect(mockOnCreateSmartWallet).toHaveBeenCalledWith({ address: testAddress })
            expect(result.current.pendingAddress).toBe(testAddress)
            expect(result.current.pendingProvider).toBe(provider)
        })

        it("should call login and set pending state when authenticated but address not yet available", async () => {
            setAuthenticatedWithoutAddress()
            mockSmartWalletState.login.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            await act(async () => {
                await result.current.handleLogin(provider)
            })

            expect(mockSmartWalletState.login).toHaveBeenCalledWith({
                provider,
                oauthRedirectUri: "/auth/callback",
            })
            expect(mockOnCreateSmartWallet).not.toHaveBeenCalled()
            expect(result.current.isLoginPending).toBe(true)
            expect(result.current.pendingProvider).toBe(provider)
        })

        it("should show error feedback when login fails", async () => {
            setUnauthenticated()
            mockSmartWalletState.login.mockRejectedValue(new Error("Login failed"))

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            await act(async () => {
                await result.current.handleLogin(provider)
            })

            expect(mockFeedbackShow).toHaveBeenCalledWith({
                severity: "error",
                type: "alert",
                message: "Try again",
                icon: "icon-alert-circle",
            })
            expect(result.current.isLoginPending).toBe(false)
            expect(result.current.pendingProvider).toBeNull()
        })

        it("should guard against duplicate login triggers", async () => {
            setUnauthenticated()
            // Make login hang indefinitely
            mockSmartWalletState.login.mockImplementation(() => new Promise(() => {}))

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            // First call
            act(() => {
                result.current.handleLogin(provider)
            })

            // Second call while first is pending
            await act(async () => {
                await result.current.handleLogin(provider)
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

            const { result, rerender } = renderHook(() => useSocialWalletLogin(defaultParams))

            // Trigger login
            await act(async () => {
                await result.current.handleLogin("google")
            })

            expect(result.current.isLoginPending).toBe(true)
            expect(mockOnCreateSmartWallet).not.toHaveBeenCalled()

            // Simulate address becoming available
            setAuthenticatedWithAddress(testAddress)
            rerender({})

            await waitFor(() => {
                expect(mockOnCreateSmartWallet).toHaveBeenCalledWith({ address: testAddress })
            })

            expect(result.current.pendingAddress).toBe(testAddress)
        })
    })

    describe("userDisplayName passthrough", () => {
        it("should pass userDisplayName as name to onCreateSmartWallet", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress, "John Doe")
            mockSmartWalletState.login.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            await act(async () => {
                await result.current.handleLogin("google")
            })

            expect(mockOnCreateSmartWallet).toHaveBeenCalledWith({
                address: testAddress,
                name: "John Doe",
            })
        })

        it("should pass userDisplayName as name to onSmartWalletPinSuccess", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress, "Jane Doe")
            mockSmartWalletState.login.mockResolvedValue(undefined)
            mockOnSmartWalletPinSuccess.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            await act(async () => {
                await result.current.handleLogin("google")
            })

            await act(async () => {
                await result.current.handlePinSuccess("123456")
            })

            expect(mockOnSmartWalletPinSuccess).toHaveBeenCalledWith({
                pin: "123456",
                address: testAddress,
                name: "Jane Doe",
            })
        })
    })

    describe("handlePinSuccess", () => {
        it("should call onSmartWalletPinSuccess when pendingAddress exists", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress)
            mockOnSmartWalletPinSuccess.mockResolvedValue(undefined)

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            // Trigger login to set pending address
            await act(async () => {
                await result.current.handleLogin("google")
            })

            // Verify pending address is set before calling handlePinSuccess
            expect(result.current.pendingAddress).toBe(testAddress)

            await act(async () => {
                await result.current.handlePinSuccess("123456")
            })

            expect(mockOnSmartWalletPinSuccess).toHaveBeenCalledWith({
                pin: "123456",
                address: testAddress,
            })
        })

        it("should do nothing when no pendingAddress exists", async () => {
            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            await act(async () => {
                await result.current.handlePinSuccess("123456")
            })

            expect(mockOnSmartWalletPinSuccess).not.toHaveBeenCalled()
        })

        it("should prevent duplicate calls when invoked multiple times rapidly", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress)
            // Make the callback hang to simulate a long async operation
            mockOnSmartWalletPinSuccess.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            // Trigger login to set pending address
            await act(async () => {
                await result.current.handleLogin("google")
            })

            // Call handlePinSuccess twice in quick succession
            await act(async () => {
                const promise1 = result.current.handlePinSuccess("123456")
                const promise2 = result.current.handlePinSuccess("123456")
                await Promise.all([promise1, promise2])
            })

            // Should only be called once despite two calls
            expect(mockOnSmartWalletPinSuccess).toHaveBeenCalledTimes(1)
        })
    })

    describe("clearPendingState", () => {
        it("should clear all pending state", async () => {
            const testAddress = "0x1234567890123456789012345678901234567890"
            setAuthenticatedWithAddress(testAddress)

            const { result } = renderHook(() => useSocialWalletLogin(defaultParams))

            // Set up pending state
            await act(async () => {
                await result.current.handleLogin("apple")
            })

            expect(result.current.pendingAddress).toBe(testAddress)
            expect(result.current.pendingProvider).toBe("apple")

            // Clear state
            act(() => {
                result.current.clearPendingState()
            })

            expect(result.current.pendingAddress).toBeNull()
            expect(result.current.pendingProvider).toBeNull()
            expect(result.current.isLoginPending).toBe(false)
        })
    })
})
