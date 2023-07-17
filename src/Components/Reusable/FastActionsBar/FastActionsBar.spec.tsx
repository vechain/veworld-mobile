import React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { FastActionsBar } from "./FastActionsBar"
import { BaseIcon } from "~Components/Base"
import { FastAction } from "~Model"

const getBuyButton = async () =>
    await screen.findByTestId("buyButton", {}, { timeout: 50000 })
const getSendButton = async () =>
    await screen.findByTestId("sendButton", {}, { timeout: 50000 })
const getSwapButton = async () =>
    await screen.findByTestId("swapButton", {}, { timeout: 50000 })
const getHistoryButton = async () =>
    await screen.findByTestId("historyButton", {}, { timeout: 50000 })

const mocked_action_buy = jest.fn()
const mocked_action_send = jest.fn()
const mocked_action_swap = jest.fn()
const mocked_action_history = jest.fn()

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

describe("FastActionsBar component", () => {
    it("renders buttons with correct navigation", async () => {
        const Actions: FastAction[] = [
            {
                name: "Buy",
                action: mocked_action_buy,
                icon: <BaseIcon name="cart-outline" />,
                testID: "buyButton",
            },
            {
                name: "Send",
                action: mocked_action_send,
                icon: <BaseIcon name="send-outline" />,
                testID: "sendButton",
            },
            {
                name: "Swap",
                action: mocked_action_swap,
                icon: <BaseIcon name="swap-horizontal" />,
                testID: "swapButton",
            },
            {
                name: "History",
                action: mocked_action_history,
                icon: <BaseIcon name="history" />,
                testID: "historyButton",
            },
        ]

        render(<FastActionsBar actions={Actions} />, {
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
        expect(mocked_action_buy).toHaveBeenCalled()

        fireEvent.press(sendButton)
        expect(mocked_action_send).toHaveBeenCalled()

        fireEvent.press(swapButton)
        expect(mocked_action_swap).toHaveBeenCalled()

        fireEvent.press(historyButton)
        expect(mocked_action_history).toHaveBeenCalled()
    })
})
