import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"

import { useUserVeBetterStats } from "./useUserVeBetterStats"

const getVeBetterUserOverview = jest.fn()
const getVeBetterUserGeneralOverview = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (url: string, ...args: any[]) => {
            switch (url) {
                case "/api/v1/b3tr/actions/users/{wallet}/daily-summaries":
                    return getVeBetterUserOverview(...args).then((res: any) => ({ data: res }))
                case "/api/v1/b3tr/actions/users/{wallet}/overview":
                    return getVeBetterUserGeneralOverview(...args).then((res: any) => ({ data: res }))
            }
        },
    }),
}))

describe("useUserVeBetterStats", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should return the correct data", async () => {
        ;(getVeBetterUserGeneralOverview as jest.Mock).mockResolvedValue({
            totalImpact: {
                carbon: 1000,
            },
        })
        ;(getVeBetterUserOverview as jest.Mock).mockImplementation(({ params }) => {
            //It is a monthly overview request. 10 is > 7, which is a week.
            if (params.query.size > 10)
                return Promise.resolve({
                    data: [
                        {
                            totalRewardAmount: 100,
                        },
                        {
                            totalRewardAmount: 300,
                        },
                    ],
                })
            return Promise.resolve({
                data: [
                    {
                        totalRewardAmount: 100,
                    },
                    {
                        totalRewardAmount: 200,
                    },
                ],
            })
        })
        const { result, waitFor } = renderHook(() => useUserVeBetterStats(), { wrapper: TestWrapper })

        await waitFor(() => {
            expect(result.current.data?.week).toBe("300")
            expect(result.current.data?.month).toBe("400")
            expect(result.current.data?.totalImpact.carbon).toBe(1000)
        })
    })

    it("should return totalImpact if not returned by the first call", async () => {
        ;(getVeBetterUserGeneralOverview as jest.Mock).mockResolvedValue({})
        ;(getVeBetterUserOverview as jest.Mock).mockImplementation(({ params }) => {
            //It is a monthly overview request
            if (params.query.size > 10)
                return Promise.resolve({
                    data: [
                        {
                            totalRewardAmount: 100,
                        },
                        {
                            totalRewardAmount: 300,
                        },
                    ],
                })
            return Promise.resolve({
                data: [
                    {
                        totalRewardAmount: 100,
                    },
                    {
                        totalRewardAmount: 200,
                    },
                ],
            })
        })
        const { result, waitFor } = renderHook(() => useUserVeBetterStats(), { wrapper: TestWrapper })

        await waitFor(() => {
            expect(result.current.data?.week).toBe("300")
            expect(result.current.data?.month).toBe("400")
            expect(result.current.data?.totalImpact).toStrictEqual({})
        })
    })
})
