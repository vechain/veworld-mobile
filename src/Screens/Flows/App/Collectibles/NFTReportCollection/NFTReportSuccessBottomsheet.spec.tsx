import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { NFTReportSuccessBottomsheet } from "./NFTReportSuccessBottomsheet"

describe("NFTReportSuccessBottomsheet", () => {
    const mockOnClose = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render the bottom sheet correctly", () => {
        render(<NFTReportSuccessBottomsheet onClose={mockOnClose} />, {
            wrapper: TestWrapper,
        })

        const bottomSheet = screen.getByTestId("NFT_Report_Success_Bottomsheet")
        expect(bottomSheet).toBeTruthy()
    })

    it("should display confirm and cancel buttons", () => {
        render(<NFTReportSuccessBottomsheet onClose={mockOnClose} />, {
            wrapper: TestWrapper,
        })

        const confirmButton = screen.getByTestId("NFT_Report_Success_Button")

        expect(confirmButton).toBeTruthy()
    })

    it("should call onClose when confirm button is pressed", () => {
        render(<NFTReportSuccessBottomsheet onClose={mockOnClose} />, {
            wrapper: TestWrapper,
        })

        const confirmButton = screen.getByTestId("NFT_Report_Success_Button")
        fireEvent.press(confirmButton)

        expect(mockOnClose).toHaveBeenCalled()
    })
})
