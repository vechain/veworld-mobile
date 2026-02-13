import React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import * as Clipboard from "expo-clipboard"
import { ImportLocalWallet } from "./ImportLocalWallet"

const defaultMnemonic = "denial kitchen pet squirrel other broom bar gas better priority spoil cross"

jest.mock("expo-clipboard", () => ({
    hasStringAsync: jest.fn(),
    getStringAsync: jest.fn(),
}))

describe("ImportLocalWallet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", () => {
        render(<ImportLocalWallet />, {
            wrapper: TestWrapper,
        })

        const importLocalWallet = screen.getByText("Import with keys")
        expect(importLocalWallet).toBeOnTheScreen()

        expect(screen.queryByTestId("IMPORT_LOCAL_WALLET_ERROR")).not.toBeOnTheScreen()
        expect(screen.getByTestId("import-input")).toBeOnTheScreen()
        expect(screen.getByTestId("IMPORT_LOCAL_WALLET_PASTE_BUTTON")).toBeOnTheScreen()
    })

    it("should show error when input is invalid", () => {
        render(<ImportLocalWallet />, {
            wrapper: TestWrapper,
        })

        const importLocalWallet = screen.getByText("Import with keys")
        expect(importLocalWallet).toBeOnTheScreen()

        act(() => {
            fireEvent.changeText(screen.getByTestId("import-input"), "invalid")
            fireEvent.press(screen.getByTestId("IMPORT_LOCAL_WALLET_IMPORT_BUTTON"))
        })

        expect(screen.getByTestId("IMPORT_LOCAL_WALLET_ERROR")).toBeOnTheScreen()
    })

    it("should paste from clipboard when paste button is pressed", async () => {
        ;(Clipboard.hasStringAsync as jest.Mock).mockResolvedValue(true)
        ;(Clipboard.getStringAsync as jest.Mock).mockResolvedValue(defaultMnemonic)

        render(<ImportLocalWallet />, {
            wrapper: TestWrapper,
        })

        const importLocalWallet = screen.getByText("Import with keys")
        expect(importLocalWallet).toBeOnTheScreen()

        act(() => {
            fireEvent.press(screen.getByTestId("IMPORT_LOCAL_WALLET_PASTE_BUTTON"))
        })

        await waitFor(() => {
            expect(screen.getByTestId("import-input")).toHaveProp("value", defaultMnemonic)
        })
    })

    it("should clear input when clear button is pressed", () => {
        render(<ImportLocalWallet />, {
            wrapper: TestWrapper,
        })

        act(() => {
            fireEvent.changeText(screen.getByTestId("import-input"), "some value of text")
        })

        expect(screen.getByTestId("import-input")).toHaveProp("value", "some value of text")

        act(() => {
            fireEvent.press(screen.getByTestId("IMPORT_LOCAL_WALLET_CLEAR_BUTTON"))
        })

        expect(screen.getByTestId("import-input")).toHaveProp("value", "")
        expect(screen.queryByTestId("IMPORT_LOCAL_WALLET_ERROR")).not.toBeOnTheScreen()
        expect(screen.getByTestId("IMPORT_LOCAL_WALLET_PASTE_BUTTON")).toBeOnTheScreen()
    })
})
