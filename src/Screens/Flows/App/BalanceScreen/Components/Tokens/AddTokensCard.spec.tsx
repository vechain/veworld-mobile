import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { AddTokensCard } from "./AddTokensCard"

const mockOnOpen = jest.fn()
const mockOnClose = jest.fn()
const mockBottomSheetRef = { current: null }

jest.mock("~Hooks/useBottomSheet", () => ({
    ...jest.requireActual("~Hooks/useBottomSheet"),
    useBottomSheetModal: jest.fn(),
}))

jest.mock("~Hooks/useHasAnyVeBetterActions", () => ({
    useHasAnyVeBetterActions: jest.fn(),
}))

jest.mock("~Hooks/useSortedTokensByFiatValue", () => ({
    useSortedTokensByFiatValue: jest.fn(),
}))

describe("AddTokensCard", () => {
    beforeEach(() => {
        jest.clearAllMocks()

        const { useBottomSheetModal } = require("~Hooks/useBottomSheet")
        ;(useBottomSheetModal as jest.Mock).mockReturnValue({
            ref: mockBottomSheetRef,
            onOpen: mockOnOpen,
            onClose: mockOnClose,
        })
    })

    it("renders the card when user is new with no tokens", async () => {
        const { useHasAnyVeBetterActions } = require("~Hooks/useHasAnyVeBetterActions")
        const { useSortedTokensByFiatValue } = require("~Hooks/useSortedTokensByFiatValue")

        ;(useHasAnyVeBetterActions as jest.Mock).mockReturnValue({
            data: false,
        })
        ;(useSortedTokensByFiatValue as jest.Mock).mockReturnValue({
            tokens: [], // No tokens with balance
        })

        render(<AddTokensCard />, {
            wrapper: TestWrapper,
        })

        const noTokensMessage = await screen.findByText("You don't have any tokens yet")
        expect(noTokensMessage).toBeTruthy()

        const addTokensButton = await screen.findByTestId("add-tokens-button")
        expect(addTokensButton).toBeTruthy()
    })

    it("does not render when user has VeBetter actions", () => {
        const { useHasAnyVeBetterActions } = require("~Hooks/useHasAnyVeBetterActions")
        const { useSortedTokensByFiatValue } = require("~Hooks/useSortedTokensByFiatValue")

        ;(useHasAnyVeBetterActions as jest.Mock).mockReturnValue({
            data: true,
        })
        ;(useSortedTokensByFiatValue as jest.Mock).mockReturnValue({
            tokens: [],
        })

        render(<AddTokensCard />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByText("You don't have any tokens yet")).toBeNull()
        expect(screen.queryByTestId("add-tokens-button")).toBeNull()
    })

    it("does not render when user has tokens with balance", () => {
        const { useHasAnyVeBetterActions } = require("~Hooks/useHasAnyVeBetterActions")
        const { useSortedTokensByFiatValue } = require("~Hooks/useSortedTokensByFiatValue")

        ;(useHasAnyVeBetterActions as jest.Mock).mockReturnValue({
            data: false,
        })
        ;(useSortedTokensByFiatValue as jest.Mock).mockReturnValue({
            tokens: [
                {
                    balance: {
                        balance: "1000000000000000000",
                    },
                },
            ],
        })

        render(<AddTokensCard />, {
            wrapper: TestWrapper,
        })

        expect(screen.queryByText("You don't have any tokens yet")).toBeNull()
        expect(screen.queryByTestId("add-tokens-button")).toBeNull()
    })

    it("opens bottom sheet when add tokens button is pressed", async () => {
        const { useHasAnyVeBetterActions } = require("~Hooks/useHasAnyVeBetterActions")
        const { useSortedTokensByFiatValue } = require("~Hooks/useSortedTokensByFiatValue")

        ;(useHasAnyVeBetterActions as jest.Mock).mockReturnValue({
            data: false,
        })
        ;(useSortedTokensByFiatValue as jest.Mock).mockReturnValue({
            tokens: [],
        })

        render(<AddTokensCard />, {
            wrapper: TestWrapper,
        })

        const addTokensButton = await screen.findByTestId("add-tokens-button")
        fireEvent.press(addTokensButton)

        expect(mockOnOpen).toHaveBeenCalledTimes(1)
    })

    it("handles tokens with zero balance correctly", () => {
        const { useHasAnyVeBetterActions } = require("~Hooks/useHasAnyVeBetterActions")
        const { useSortedTokensByFiatValue } = require("~Hooks/useSortedTokensByFiatValue")

        ;(useHasAnyVeBetterActions as jest.Mock).mockReturnValue({
            data: false,
        })
        ;(useSortedTokensByFiatValue as jest.Mock).mockReturnValue({
            tokens: [
                {
                    balance: {
                        balance: "0",
                    },
                },
                {
                    balance: {
                        balance: "0",
                    },
                },
            ],
        })

        render(<AddTokensCard />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByText("You don't have any tokens yet")).toBeTruthy()
        expect(screen.getByTestId("add-tokens-button")).toBeTruthy()
    })
})
