import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { fetchVeBetterUserGeneralOverview, fetchVeBetterUserOverview } from "~Networking"
import { useUserVeBetterStats } from "./useUserVeBetterStats"
import moment from "moment"

jest.mock("~Networking", () => ({
    ...jest.requireActual("~Networking"),
    fetchVeBetterUserGeneralOverview: jest.fn(),
    fetchVeBetterUserOverview: jest.fn(),
}))

describe("useUserVeBetterStats", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return the correct data", async () => {
        ;(fetchVeBetterUserGeneralOverview as jest.Mock).mockResolvedValue({
            totalImpact: {
                carbon: 1000,
            },
        })
        ;(fetchVeBetterUserOverview as jest.Mock).mockImplementation((_address, startDate) => {
            //It is a monthly overview request
            if (moment(startDate).isBefore(moment().utc().startOf("week")))
                return {
                    data: [
                        {
                            totalRewardAmount: 100,
                        },
                        {
                            totalRewardAmount: 300,
                        },
                    ],
                }
            return {
                data: [
                    {
                        totalRewardAmount: 100,
                    },
                    {
                        totalRewardAmount: 200,
                    },
                ],
            }
        })
        const { result, waitFor } = renderHook(() => useUserVeBetterStats(), { wrapper: TestWrapper })

        await waitFor(() => {
            expect(result.current.data?.week).toBe("300")
            expect(result.current.data?.month).toBe("400")
            expect(result.current.data?.totalImpact.carbon).toBe(1000)
        })
    })

    it("should return totalImpact if not returned by the first call", async () => {
        ;(fetchVeBetterUserGeneralOverview as jest.Mock).mockResolvedValue({})
        ;(fetchVeBetterUserOverview as jest.Mock).mockImplementation((_address, startDate) => {
            //It is a monthly overview request
            if (moment(startDate).isBefore(moment().utc().startOf("week")))
                return {
                    data: [
                        {
                            totalRewardAmount: 100,
                        },
                        {
                            totalRewardAmount: 300,
                        },
                    ],
                }
            return {
                data: [
                    {
                        totalRewardAmount: 100,
                    },
                    {
                        totalRewardAmount: 200,
                    },
                ],
            }
        })
        const { result, waitFor } = renderHook(() => useUserVeBetterStats(), { wrapper: TestWrapper })

        await waitFor(() => {
            expect(result.current.data?.week).toBe("300")
            expect(result.current.data?.month).toBe("400")
            expect(result.current.data?.totalImpact).toStrictEqual({})
        })
    })
})
