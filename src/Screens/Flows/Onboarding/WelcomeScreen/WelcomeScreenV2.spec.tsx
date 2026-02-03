import React from "react"
import { render, screen } from "@testing-library/react-native"
import { setPlatform, TestWrapper } from "~Test"
import { WelcomeScreenV2 } from "./WelcomeScreenV2"

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
})
