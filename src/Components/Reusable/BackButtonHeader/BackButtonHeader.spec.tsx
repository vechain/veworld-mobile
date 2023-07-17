const goBackMock = jest.fn()
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(() => ({ goBack: goBackMock })),
}))
import React from "react"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { BackButtonHeader } from "./BackButtonHeader"

const backButtonTestId = "backButtontestId"
const findBackButton = async () =>
    await screen.findByTestId(backButtonTestId, {}, { timeout: 5000 })

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

describe("BackButtonHeader", () => {
    it("should render correctly and go back", async () => {
        render(<BackButtonHeader iconTestID={backButtonTestId} />, {
            wrapper: TestWrapper,
        })

        const backButton = await findBackButton()
        expect(backButton).toBeVisible()
        act(() => fireEvent(backButton, "action"))
        expect(goBackMock).toHaveBeenCalled()
    })
})
