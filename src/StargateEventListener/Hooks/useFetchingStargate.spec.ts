import { renderHook, act } from "@testing-library/react-hooks"
import { useFetchingStargate } from "./useFetchingStargate"
import { getStargateNetworkConfig } from "~Constants/Constants/Staking"

// Mocks
const invalidateQueriesMock = jest.fn().mockResolvedValue(undefined)
const refetchQueriesMock = jest.fn().mockResolvedValue(undefined)
const getQueriesDataMock = jest.fn().mockReturnValue([])

jest.mock("@tanstack/react-query", () => {
    const actual = jest.requireActual("@tanstack/react-query")
    return {
        ...actual,
        useQueryClient: () => ({
            invalidateQueries: invalidateQueriesMock,
            refetchQueries: refetchQueriesMock,
            getQueriesData: getQueriesDataMock,
        }),
    }
})

jest.mock("~Storage/Redux", () => {
    return {
        // Provide stable selector values for tests
        selectSelectedNetwork: () => ({ type: "mainnet" }),
        selectSelectedAccount: () => ({ address: "0xabc" }),
        // selector executor simply invokes provided selector
        useAppSelector: (selector: any) => selector(),
    }
})

jest.mock("~Constants/Constants/Staking", () => ({
    getStargateNetworkConfig: jest.fn(),
}))

jest.mock("~Utils", () => ({
    debug: jest.fn(),
}))

describe("useFetchingStargate", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        getQueriesDataMock.mockReturnValue([])
    })

    it("should early return when no Stargate network config is available", async () => {
        ;(getStargateNetworkConfig as jest.Mock).mockReturnValue(undefined)

        const { result } = renderHook(() => useFetchingStargate())

        await act(async () => {
            await result.current.refetchStargateData()
        })

        expect(invalidateQueriesMock).not.toHaveBeenCalled()
        expect(refetchQueriesMock).not.toHaveBeenCalled()
    })

    it("should invalidate Stargate-related queries via predicate when config is available", async () => {
        // minimal shape; only presence matters for the hook
        ;(getStargateNetworkConfig as jest.Mock).mockReturnValue({ NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xnode" })

        const { result } = renderHook(() => useFetchingStargate())

        await act(async () => {
            await result.current.refetchStargateData()
        })

        // Should call both invalidateQueries and refetchQueries with predicates
        expect(invalidateQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ predicate: expect.any(Function) }))
        expect(refetchQueriesMock).toHaveBeenCalledWith(expect.objectContaining({ predicate: expect.any(Function) }))
        expect(getQueriesDataMock).toHaveBeenCalledWith(expect.objectContaining({ predicate: expect.any(Function) }))

        // Should be called exactly once each
        expect(invalidateQueriesMock).toHaveBeenCalledTimes(1)
        expect(refetchQueriesMock).toHaveBeenCalledTimes(1)
        expect(getQueriesDataMock).toHaveBeenCalledTimes(1)
    })
})
