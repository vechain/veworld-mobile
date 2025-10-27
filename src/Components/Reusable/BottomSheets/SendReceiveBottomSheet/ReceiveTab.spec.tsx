import { act, fireEvent, screen } from "@testing-library/react-native"
import React from "react"
import { useCopyClipboard } from "~Hooks/useCopyClipboard"
import { useVns } from "~Hooks/useVns"
import { TestHelpers, TestWrapper } from "~Test"

import { ReceiveTab } from "./ReceiveTab"

const share = jest.fn()

jest.mock("~Hooks/useVns", () => ({ useVns: jest.fn() }))
jest.mock("~Hooks/useCopyClipboard", () => ({ useCopyClipboard: jest.fn() }))
jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
    Share: { share: (...args: any[]) => share(...args) },
}))

describe("ReceiveTab", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })
    afterEach(() => {
        jest.useRealTimers()
    })
    it("should render the account correctly", () => {
        ;(useVns as jest.Mock).mockReturnValue({
            name: "",
        })
        ;(useCopyClipboard as jest.Mock).mockReturnValue({ onCopyToClipboard: jest.fn() })

        const { rerender } = TestHelpers.render.renderComponentWithProps(<ReceiveTab />, { wrapper: TestWrapper })

        expect(screen.getByTestId("RECEIVE_TAB_ACCOUNT_ALIAS")).toHaveTextContent("Account 1")
        expect(screen.getByTestId("RECEIVE_TAB_ACCOUNT_ADDRESS")).toHaveTextContent("0xCF1…957")
        ;(useVns as jest.Mock).mockReturnValue({
            name: "test.vet",
        })
        rerender(<ReceiveTab />)
        expect(screen.getByTestId("RECEIVE_TAB_ACCOUNT_ALIAS")).toHaveTextContent("test.vet")
        expect(screen.getByTestId("RECEIVE_TAB_ACCOUNT_ADDRESS")).toHaveTextContent("0xCF1…957")
    })
    it("should have actions working", async () => {
        const onCopyToClipboard = jest.fn()
        ;(useVns as jest.Mock).mockReturnValue({
            name: "",
        })
        ;(useCopyClipboard as jest.Mock).mockReturnValue({ onCopyToClipboard })

        TestHelpers.render.renderComponentWithProps(<ReceiveTab />, { wrapper: TestWrapper })

        await act(() => {
            fireEvent.press(screen.getByTestId("RECEIVE_TAB_COPY"))
            jest.advanceTimersByTime(4000)
        })

        expect(onCopyToClipboard).toHaveBeenCalledWith("0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", "", {
            showNotification: false,
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("RECEIVE_TAB_SHARE"))
        })

        expect(share).toHaveBeenCalledWith({
            message: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        })
    })
})
