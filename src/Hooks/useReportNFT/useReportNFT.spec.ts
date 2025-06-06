import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useReportNFT } from "./useReportNFT"
import { AnalyticsEvent } from "~Constants"
import { NFT_BLACKLIST_CONTRACT } from "~Constants/Constants/NFT"
import { Routes } from "~Navigation"

const mockNavigate = jest.fn()
const mockReplace = jest.fn()
const mockTrack = jest.fn()

jest.mock("./useReportNFT", () => {
    const originalModule = jest.requireActual("./useReportNFT")

    return {
        ...originalModule,
        useReportNFT: () => {
            const actual = originalModule.useReportNFT()

            return {
                reportNFTCollection: jest.fn(nftAddress => {
                    return actual.reportNFTCollection(nftAddress)
                }),
            }
        },
    }
})

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
        navigate: mockNavigate,
        replace: mockReplace,
    }),
}))

jest.mock("~Hooks/useAnalyticTracking", () => ({
    useAnalyticTracking: () => mockTrack,
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
        const { result } = renderHook(() => useReportNFT(), {
            wrapper: TestWrapper,
        })

        const nftAddress = "0x1234567890123456789012345678901234567890"
        result.current.reportNFTCollection(nftAddress)

        expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.NFT_COLLECTION_REPORTED, {
            nftAddress,
        })

        expect(mockReplace).toHaveBeenCalledWith(Routes.REPORT_NFT_TRANSACTION_SCREEN, {
            nftAddress,
            transactionClauses: expect.arrayContaining([
                expect.objectContaining({
                    to: NFT_BLACKLIST_CONTRACT,
                    value: "0x0",
                    data: expect.any(String),
                }),
            ]),
        })
    })

    it("should throw error if report ABI is not found", () => {
        const { result } = renderHook(
            () => {
                const hook = useReportNFT()
                hook.reportNFTCollection = jest.fn().mockImplementation(() => {
                    throw new Error("Function abi not found for reporting NFT collection")
                })
                return hook
            },
            {
                wrapper: TestWrapper,
            },
        )

        const nftAddress = "0x1234567890123456789012345678901234567890"

        expect(() => result.current.reportNFTCollection(nftAddress)).toThrow(
            "Function abi not found for reporting NFT collection",
        )
    })
})
