import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { Routes } from "~Navigation"
import { TestWrapper } from "~Test"
import { AddTokenBottomSheet } from "./AddTokenBottomSheet"

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
            canGoBack: jest.fn(),
        }),
    }
})

const mockCloseBottomSheet = jest.fn()
jest.mock("~Hooks/useBottomSheet", () => ({
    ...jest.requireActual("~Hooks/useBottomSheet"),
    useBottomSheetModal: jest.fn(),
}))

describe("AddTokenBottomSheet", () => {
    const mockBottomSheetRef = { current: undefined! }
    const onQrCodePress = jest.fn()

    beforeEach(() => {
        mockNavigate.mockClear()
        mockCloseBottomSheet.mockClear()

        const { useBottomSheetModal } = require("~Hooks/useBottomSheet")
        ;(useBottomSheetModal as jest.Mock).mockClear()
        ;(useBottomSheetModal as jest.Mock).mockReturnValueOnce({
            onClose: mockCloseBottomSheet,
        })
    })

    const defaultProps = {
        bottomSheetRef: mockBottomSheetRef,
        onQrCodePress,
    }

    it("renders without crashing", () => {
        expect(() => {
            render(<AddTokenBottomSheet {...defaultProps} />, {
                wrapper: TestWrapper,
            })
        }).not.toThrow()
    })

    it("renders buy token button and handles press", async () => {
        render(<AddTokenBottomSheet {...defaultProps} />, {
            wrapper: TestWrapper,
        })

        const buyButton = await screen.findByText("Buy token")
        expect(buyButton).toBeTruthy()

        fireEvent.press(buyButton)

        expect(mockCloseBottomSheet).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith(Routes.BUY_FLOW)
    })

    it("renders receive token button and handles press", async () => {
        render(<AddTokenBottomSheet {...defaultProps} />, {
            wrapper: TestWrapper,
        })

        const receiveButton = await screen.findByText("Receive token")
        expect(receiveButton).toBeTruthy()

        fireEvent.press(receiveButton)

        expect(mockCloseBottomSheet).toHaveBeenCalled()
        expect(onQrCodePress).toHaveBeenCalled()
    })

    it("renders custom token button and handles press", async () => {
        render(<AddTokenBottomSheet {...defaultProps} />, {
            wrapper: TestWrapper,
        })

        const customButton = await screen.findByText("Custom token")
        expect(customButton).toBeTruthy()

        fireEvent.press(customButton)

        expect(mockCloseBottomSheet).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith(Routes.MANAGE_TOKEN)
    })

    it("renders all button subtitles correctly", async () => {
        render(<AddTokenBottomSheet {...defaultProps} />, {
            wrapper: TestWrapper,
        })

        const buySubtitle = await screen.findByText("Add balance buying with fiat")
        const receiveSubtitle = await screen.findByText("Use your wallet address to receive")
        const customSubtitle = await screen.findByText("Add a custom token to your wallet")

        expect(buySubtitle).toBeTruthy()
        expect(receiveSubtitle).toBeTruthy()
        expect(customSubtitle).toBeTruthy()
    })

    it("renders the main title", async () => {
        render(<AddTokenBottomSheet {...defaultProps} />, {
            wrapper: TestWrapper,
        })

        const title = await screen.findByText("Add tokens")
        expect(title).toBeTruthy()
    })

    it("renders the FlatList", async () => {
        render(<AddTokenBottomSheet {...defaultProps} />, {
            wrapper: TestWrapper,
        })

        const flatList = await screen.findByTestId("add-token-options-list")
        expect(flatList).toBeTruthy()
    })

    it("renders all three interactive buttons", async () => {
        render(<AddTokenBottomSheet {...defaultProps} />, {
            wrapper: TestWrapper,
        })

        const buyButton = await screen.findByText("Buy token")
        const receiveButton = await screen.findByText("Receive token")
        const customButton = await screen.findByText("Custom token")

        expect(buyButton).toBeTruthy()
        expect(receiveButton).toBeTruthy()
        expect(customButton).toBeTruthy()

        expect(() => fireEvent.press(buyButton)).not.toThrow()
        expect(() => fireEvent.press(receiveButton)).not.toThrow()
        expect(() => fireEvent.press(customButton)).not.toThrow()
    })
})
