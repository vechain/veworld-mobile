import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import { setPlatform, TestWrapper } from "~Test"
import { WelcomeScreenV2 } from "./WelcomeScreenV2"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { useHandleWalletCreation } from "./useHandleWalletCreation"

jest.mock("~Hooks/useSmartWallet", () => ({
    useSmartWallet: jest.fn(() => ({
        login: jest.fn(),
        isAuthenticated: false,
        smartAccountAddress: "",
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
                })
            })
        })
    })
})
