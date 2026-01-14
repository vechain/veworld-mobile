import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { useStargateStats } from "./useStargateStats"

const getStargateTotalSupply = jest.fn()
const getStargateTotalVet = jest.fn()
const getStargateRewardsDistributed = jest.fn()
const getVthoPerDay = jest.fn()

jest.mock("~Hooks/useIndexerClient", () => ({
    ...jest.requireActual("~Hooks/useIndexerClient"),
    useMainnetIndexerClient: jest.fn().mockReturnValue({
        GET: (url: string, ...args: any[]) => {
            switch (url) {
                case "/api/v1/stargate/total-vet-delegated":
                    return getStargateTotalSupply(...args).then((res: any) => ({ data: res }))
                case "/api/v1/stargate/total-vet-staked":
                    return getStargateTotalVet(...args).then((res: any) => ({ data: res }))
                case "/api/v1/stargate/total-vtho-claimed":
                    return getStargateRewardsDistributed(...args).then((res: any) => ({ data: res }))
                case "/api/v1/stargate/vtho-generated/{period}":
                    return getVthoPerDay(...args).then((res: any) => ({ data: res }))
            }
        },
    }),
}))

describe("useStargateStats", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should return the stargate stats", async () => {
        ;(getStargateTotalSupply as jest.Mock).mockResolvedValue({
            totalNftCount: 12816,
        })
        ;(getStargateTotalVet as jest.Mock).mockResolvedValue({
            total: "6318030000000000000000000000",
            byLevel: {
                Dawn: "55080000000000000000000000",
                Strength: "920000000000000000000000000",
                ThunderX: "655200000000000000000000000",
                Flash: "429600000000000000000000000",
                VeThorX: "141000000000000000000000000",
                Lightning: "152150000000000000000000000",
                StrengthX: "731200000000000000000000000",
                MjolnirX: "1528800000000000000000000000",
                Mjolnir: "390000000000000000000000000",
                Thunder: "1315000000000000000000000000",
            },
        })
        ;(getStargateRewardsDistributed as jest.Mock).mockResolvedValue("526381931206666467000000000")
        ;(getVthoPerDay as jest.Mock).mockResolvedValue({
            data: [{ total: "226381931206666467000000000" }],
        })

        const { result, waitFor } = renderHook(() => useStargateStats(), {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBeDefined()
        })

        expect(result.current.data?.totalSupply).toBe("12816")
        expect(result.current.data?.totalVetStaked?.total).toBe("6318030000000000000000000000")
        expect(result.current.data?.rewardsDistributed).toBe("526381931206666467000000000")
        expect(result.current.data?.vthoPerDay).toBe("226381931206666467000000000")
    })
})
