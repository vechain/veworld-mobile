import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
// `~Test` MUST be imported before `~Components/Providers/FeatureFlagsProvider`: loading the mocked
// module first makes the providers inside TestWrapper capture the actual module instead of the mock.
import { setPlatform, TestHelpers, TestWrapper } from "~Test"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { WelcomeScreenV2 } from "./WelcomeScreenV2"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

const { mockedFeatureFlags } = TestHelpers.data

jest.mock("~Components/Providers/FeatureFlagsProvider", () => ({
    ...jest.requireActual("~Components/Providers/FeatureFlagsProvider"),
    useFeatureFlags: jest.fn(),
}))

const mockAppleLoginDisabled = (enabled: boolean) => {
    ;(useFeatureFlags as jest.Mock).mockReturnValue({
        ...mockedFeatureFlags,
        appleMigrationFeature: {
            banner: { enabled: false },
            loginDisabled: { enabled },
        },
    })
}

jest.mock("~Hooks/useSmartWallet", () => ({
    useSmartWallet: jest.fn(() => ({
        login: jest.fn(),
        isAuthenticated: false,
        smartAccountAddress: "",
        linkedAccounts: [],
        userDisplayName: undefined,
    })),
}))

jest.mock("./useHandleWalletCreation", () => ({
    useHandleWalletCreation: jest.fn().mockReturnValue({
        isOpen: false,
        onSuccess: jest.fn(),
        onSmartWalletPinSuccess: jest.fn(),
        onClose: jest.fn(),
        onCreateSmartWallet: jest.fn(),
    }),
}))

jest.mock("expo-haptics", () => {
    return {
        NotificationFeedbackType: {
            Success: 0,
            Warning: 1,
            Error: 2,
        },
        ImpactFeedbackStyle: {
            Light: 0,
            Medium: 1,
            Heavy: 2,
        },
        notificationAsync: jest.fn(),
        impactAsync: jest.fn(),
    }
})

describe("WelcomeScreenV2", () => {
    beforeEach(() => {
        mockAppleLoginDisabled(false)
    })

    it("should render correctly", () => {
        render(<WelcomeScreenV2 />, {
            wrapper: TestWrapper,
        })

        const welcomeScreen = screen.getByTestId("WELCOME_SCREEN_V2")
        expect(welcomeScreen).toBeTruthy()

        const onboardingB3MO = screen.getByTestId("ONBOARDING_B3MO")
        expect(onboardingB3MO).toBeTruthy()

        const onboardingB3MOTitle = screen.getByTestId("ONBOARDING_B3MO_TITLE")
        expect(onboardingB3MOTitle).toBeTruthy()
        expect(onboardingB3MOTitle).toHaveTextContent("Crypto, simplified.")

        const onboardingB3MODescription = screen.getByTestId("ONBOARDING_B3MO_DESCRIPTION")
        expect(onboardingB3MODescription).toBeTruthy()
        expect(onboardingB3MODescription).toHaveTextContent("The easiest way to explore VeChain.")
    })

    it("shouldn't render apple login button on Android", () => {
        setPlatform("android")
        render(<WelcomeScreenV2 />, {
            wrapper: TestWrapper,
        })

        const appleLoginButton = screen.queryByTestId("APPLE_LOGIN_BUTTON")
        expect(appleLoginButton).not.toBeOnTheScreen()
    })

    it("should render apple login button on iOS", () => {
        setPlatform("ios")
        render(<WelcomeScreenV2 />, {
            wrapper: TestWrapper,
        })

        const appleLoginButton = screen.queryByTestId("APPLE_LOGIN_BUTTON")
        expect(appleLoginButton).toBeOnTheScreen()
    })

    describe("Google login flow", () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it("should call login with correct params when not authenticated", async () => {
            const mockLogin = jest.fn()
            ;(useSmartWallet as jest.Mock).mockReturnValue({
                login: mockLogin,
                isAuthenticated: false,
                smartAccountAddress: "",
            })

            render(<WelcomeScreenV2 />, {
                wrapper: TestWrapper,
            })

            const googleButton = screen.getByTestId("GOOGLE_LOGIN_BUTTON")
            fireEvent.press(googleButton)

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    provider: "google",
                    oauthRedirectUri: "/auth/callback",
                })
            })
        })

        it("should call onCreateSmartWallet when already authenticated with address", async () => {
            const mockOnCreateSmartWallet = jest.fn()
            const mockSmartAccountAddress = "0x1234567890abcdef1234567890abcdef12345678"

            ;(useSmartWallet as jest.Mock).mockReturnValue({
                login: jest.fn(),
                isAuthenticated: true,
                smartAccountAddress: mockSmartAccountAddress,
                linkedAccounts: [{ type: "google" }],
                userDisplayName: undefined,
            })
            ;(useHandleWalletCreation as jest.Mock).mockReturnValue({
                isOpen: false,
                onSuccess: jest.fn(),
                onSmartWalletPinSuccess: jest.fn(),
                onClose: jest.fn(),
                onCreateSmartWallet: mockOnCreateSmartWallet,
            })

            render(<WelcomeScreenV2 />, {
                wrapper: TestWrapper,
            })

            const googleButton = screen.getByTestId("GOOGLE_LOGIN_BUTTON")
            fireEvent.press(googleButton)

            await waitFor(() => {
                expect(mockOnCreateSmartWallet).toHaveBeenCalledWith({
                    address: mockSmartAccountAddress,
                    name: undefined,
                    linkedProviders: ["google"],
                })
            })
        })
    })

    describe("Apple migration maintenance", () => {
        const mockLogin = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            setPlatform("ios")
            mockAppleLoginDisabled(true)
            ;(useSmartWallet as jest.Mock).mockReturnValue({
                login: mockLogin,
                isAuthenticated: false,
                smartAccountAddress: "",
                linkedAccounts: [],
                userDisplayName: undefined,
            })
        })

        it("should not start apple login and should show the maintenance message", () => {
            const showSpy = jest.spyOn(Feedback, "show").mockImplementation(() => {})

            render(<WelcomeScreenV2 />, {
                wrapper: TestWrapper,
            })

            fireEvent.press(screen.getByTestId("APPLE_LOGIN_BUTTON"))

            expect(mockLogin).not.toHaveBeenCalled()
            expect(showSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining("Maintenance work in progress"),
                }),
            )

            showSpy.mockRestore()
        })

        it("should still allow google login", async () => {
            render(<WelcomeScreenV2 />, {
                wrapper: TestWrapper,
            })

            fireEvent.press(screen.getByTestId("GOOGLE_LOGIN_BUTTON"))

            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith({
                    provider: "google",
                    oauthRedirectUri: "/auth/callback",
                })
            })
        })
    })
})
