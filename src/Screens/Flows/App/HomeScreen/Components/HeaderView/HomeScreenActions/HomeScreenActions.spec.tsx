const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(() => ({ navigate: mockNavigate })),
}))
import React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { HomeScreenActions } from "./HomeScreenActions"
import { Routes } from "~Navigation"

const getBuyButton = async () =>
    await screen.findByTestId("buyButton", { timeout: 5000 })
const getSendButton = async () =>
    await screen.findByTestId("sendButton", { timeout: 5000 })
const getSwapButton = async () =>
    await screen.findByTestId("swapButton", { timeout: 5000 })
const getHistoryButton = async () =>
    await screen.findByTestId("historyButton", { timeout: 5000 })

describe("HomeScreenActions component", () => {
    it("renders buttons with correct navigation", async () => {
        render(<HomeScreenActions />, {
            wrapper: TestWrapper,
        })

        const buyButton = await getBuyButton()
        const sendButton = await getSendButton()
        const swapButton = await getSwapButton()
        const historyButton = await getHistoryButton()

        expect(buyButton).toBeVisible()
        expect(sendButton).toBeVisible()
        expect(swapButton).toBeVisible()
        expect(historyButton).toBeVisible()

        fireEvent.press(buyButton)
        expect(mockNavigate).toHaveBeenCalledWith(Routes.BUY)
        fireEvent.press(sendButton)
        expect(mockNavigate).toHaveBeenCalledWith(Routes.SEND)
        fireEvent.press(swapButton)
        expect(mockNavigate).toHaveBeenCalledWith(Routes.SWAP)
        fireEvent.press(historyButton)
        expect(mockNavigate).toHaveBeenCalledWith(Routes.HISTORY)
    })
})
