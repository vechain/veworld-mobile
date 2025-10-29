import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useReportNFT } from "./useReportNFT"
import { AnalyticsEvent } from "~Constants"
import { NFT_BLACKLIST_CONTRACT } from "~Constants/Constants/NFT"
import { Routes } from "~Navigation"

const mockNavigate = jest.fn()
const mockTrack = jest.fn()
const mockBuildReportClause = jest.fn()

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}))

jest.mock("~Hooks/useAnalyticTracking", () => ({
    useAnalyticTracking: () => mockTrack,
}))

jest.mock("~Hooks/useNFTReportTransaction", () => ({
    useNFTReportTransaction: () => ({
        buildReportClause: mockBuildReportClause,
    }),
}))

describe("useReportNFT", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should render correctly", () => {
        const { result } = renderHook(() => useReportNFT(), {
            wrapper: TestWrapper,
        })

        expect(result.current).toEqual({
            reportNFTCollection: expect.any(Function),
        })
    })

    it("should build transaction clause correctly", () => {
        const mockClause = [
            {
                to: NFT_BLACKLIST_CONTRACT,
                value: "0x0",
                data: "0x1234",
            },
        ]
        mockBuildReportClause.mockReturnValue(mockClause)

        const { result } = renderHook(() => useReportNFT(), {
            wrapper: TestWrapper,
        })

        const nftAddress = "0x1234567890123456789012345678901234567890"
        result.current.reportNFTCollection(nftAddress)

        expect(mockBuildReportClause).toHaveBeenCalledWith(nftAddress)

        expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.NFT_COLLECTION_REPORTED, {
            nftAddress,
        })

        expect(mockNavigate).toHaveBeenCalledWith(Routes.REPORT_NFT_TRANSACTION_SCREEN, {
            nftAddress,
            transactionClauses: mockClause,
        })
    })

    it("should throw error if report ABI is not found", () => {
        mockBuildReportClause.mockImplementation(() => {
            throw new Error("Function abi not found for reporting NFT collection")
        })

        const { result } = renderHook(() => useReportNFT(), {
            wrapper: TestWrapper,
        })

        const nftAddress = "0x1234567890123456789012345678901234567890"

        expect(() => result.current.reportNFTCollection(nftAddress)).toThrow(
            "Function abi not found for reporting NFT collection",
        )
    })
})
