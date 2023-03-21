const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(() => ({ navigate: mockNavigate })),
}))
import React from "react"
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { HomeScreenActions } from "./HomeScreenActions"
import { Routes } from "~Navigation"

const getBuyButton = () => screen.getByTestId("buyButton")
const getSendButton = () => screen.getByTestId("sendButton")
const getSwapButton = () => screen.getByTestId("swapButton")
const getHistoryButton = () => screen.getByTestId("historyButton")

describe("HomeScreenActions component", () => {
    it("renders buttons with correct navigation", async () => {
        render(<HomeScreenActions />, {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            fireEvent.press(getBuyButton())
            expect(mockNavigate).toHaveBeenCalledWith(Routes.BUY)
        })

        fireEvent.press(getSendButton())
        expect(mockNavigate).toHaveBeenCalledWith(Routes.SEND)
        fireEvent.press(getSwapButton())
        expect(mockNavigate).toHaveBeenCalledWith(Routes.SWAP)
        fireEvent.press(getHistoryButton())
        expect(mockNavigate).toHaveBeenCalledWith(Routes.HISTORY)
    })
})
