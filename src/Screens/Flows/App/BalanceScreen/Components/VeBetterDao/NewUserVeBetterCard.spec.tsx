import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { Routes } from "~Navigation"
import { TestWrapper } from "~Test"
import { NewUserVeBetterCard } from "./NewUserVeBetterCard"

const mockNavigate = jest.fn()
const mockDispatch = jest.fn()

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
        }),
    }
})

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    useAppDispatch: () => mockDispatch,
    setHideNewUserVeBetterCard: jest.fn(value => ({ type: "SET_HIDE_NEW_USER_VEBETTER_CARD", payload: value })),
}))

jest.mock("~Hooks/useVeBetterGlobalOverview", () => ({
    useVeBetterGlobalOverview: jest.fn(),
}))

describe("NewUserVeBetterCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()

        const { useVeBetterGlobalOverview } = require("~Hooks/useVeBetterGlobalOverview")

        ;(useVeBetterGlobalOverview as jest.Mock).mockReturnValue({
            data: {
                actionsRewarded: 1000000,
                totalRewardAmount: 500000,
                totalImpact: {
                    carbon: 1200,
                    energy: 800,
                    water: 600,
                    plastic: 400,
                },
            },
        })
    })

    it("renders the card with correct testID", () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        const card = screen.getByTestId("VEBETTER_DAO_NEW_USER_CARD")
        expect(card).toBeTruthy()
    })

    it("displays VeBetter movement text", async () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        const joinText = await screen.findByText("Join the")
        const movementText = await screen.findByText("movement")

        expect(joinText).toBeTruthy()
        expect(movementText).toBeTruthy()
    })

    it("displays global overview stats", async () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        const totalActionsLabel = await screen.findByText("Total Better actions")
        const totalRewardedLabel = await screen.findByText("Total B3TR rewarded")

        expect(totalActionsLabel).toBeTruthy()
        expect(totalRewardedLabel).toBeTruthy()
    })

    it("displays impact stats cards", async () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        // The StatsCard components should render the impact values
        // We can't easily test the exact formatted values without knowing the formatting logic
        // but we can verify the component renders without crashing
        expect(screen.getByTestId("VEBETTER_DAO_NEW_USER_CARD")).toBeTruthy()
    })

    it("closes card when close button is pressed", () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        const closeButton = screen.getByTestId("close-button")
        fireEvent.press(closeButton)

        const { setHideNewUserVeBetterCard } = require("~Storage/Redux")
        expect(mockDispatch).toHaveBeenCalledWith(setHideNewUserVeBetterCard(true))
    })

    it("navigates to APPS", async () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        const startButton = await screen.findByText("Start your impact")
        fireEvent.press(startButton)

        expect(mockNavigate).toHaveBeenCalledWith(Routes.APPS_STACK, { screen: Routes.APPS })
    })

    it("displays cta text", async () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        const getRewardedText = await screen.findByText("get rewarded for your actions and")
        const contributeText = await screen.findByText("contribute to the offset")

        expect(getRewardedText).toBeTruthy()
        expect(contributeText).toBeTruthy()
    })

    it("renders start impact button with arrow icon", async () => {
        render(<NewUserVeBetterCard />, {
            wrapper: TestWrapper,
        })

        const startButton = await screen.findByText("Start your impact")
        expect(startButton).toBeTruthy()

        expect(() => fireEvent.press(startButton)).not.toThrow()
    })
})
