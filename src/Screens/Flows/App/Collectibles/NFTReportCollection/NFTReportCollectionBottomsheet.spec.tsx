import React from "react"
import { render, screen, fireEvent } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { NFTReportCollectionBottomsheet } from "./NFTReportCollectionBottomsheet"
import { useReportNFT } from "~Hooks/useReportNFT"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"

jest.mock("~Hooks/useReportNFT/useReportNFT", () => ({
    useReportNFT: jest.fn(),
}))

jest.mock("~Hooks/useAnalyticTracking/useAnalyticTracking", () => ({
    useAnalyticTracking: jest.fn(),
}))

describe("NFTReportCollectionBottomsheet", () => {
    const mockOnClose = jest.fn()
    const mockReportNFTCollection = jest.fn()
    const mockTrack = jest.fn()
    const nftAddress = "0x1234567890123456789012345678901234567890"

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useReportNFT as jest.Mock).mockReturnValue({
            reportNFTCollection: mockReportNFTCollection,
        })
        ;(useAnalyticTracking as jest.Mock).mockReturnValue(mockTrack)
    })

    it("should render the bottom sheet correctly", () => {
        render(<NFTReportCollectionBottomsheet onClose={mockOnClose} nftAddress={nftAddress} />, {
            wrapper: TestWrapper,
        })

        const bottomSheet = screen.getByTestId("NFT_Report_Collection_Bottomsheet")
        expect(bottomSheet).toBeTruthy()
    })

    it("should display confirm and cancel buttons", () => {
        render(<NFTReportCollectionBottomsheet onClose={mockOnClose} nftAddress={nftAddress} />, {
            wrapper: TestWrapper,
        })

        const confirmButton = screen.getByTestId("NFT_Report_Collection_Confirm_Button")
        const cancelButton = screen.getByTestId("NFT_Report_Collection_Cancel_Button")

        expect(confirmButton).toBeTruthy()
        expect(cancelButton).toBeTruthy()
    })

    it("should call reportNFTCollection and onClose when confirm button is pressed", () => {
        render(<NFTReportCollectionBottomsheet onClose={mockOnClose} nftAddress={nftAddress} />, {
            wrapper: TestWrapper,
        })

        const confirmButton = screen.getByTestId("NFT_Report_Collection_Confirm_Button")
        fireEvent.press(confirmButton)

        expect(mockTrack).toHaveBeenCalled()
        expect(mockReportNFTCollection).toHaveBeenCalledWith(nftAddress)
        expect(mockOnClose).toHaveBeenCalled()
    })

    it("should call onClose when cancel button is pressed", () => {
        render(<NFTReportCollectionBottomsheet onClose={mockOnClose} nftAddress={nftAddress} />, {
            wrapper: TestWrapper,
        })

        const cancelButton = screen.getByTestId("NFT_Report_Collection_Cancel_Button")
        fireEvent.press(cancelButton)

        expect(mockOnClose).toHaveBeenCalled()
    })
})
