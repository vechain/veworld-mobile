import { useQuery } from "@tanstack/react-query"
import { renderHook } from "@testing-library/react-hooks"
import { useGenericDelegationTokens } from "./useGenericDelegationTokens"
import { TestWrapper } from "~Test"
import { B3TR, defaultTestNetwork, VET, VTHO } from "~Constants"

jest.mock("@tanstack/react-query", () => ({
    ...jest.requireActual("@tanstack/react-query"),
    useQuery: jest.fn(),
}))

describe("useGenericDelegationTokens", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    it("it should return tokens if data is defined", async () => {
        ;(useQuery as jest.Mock).mockReturnValue({
            data: [VET.symbol, B3TR.symbol, "GLO"],
            isFetching: false,
        })

        const { result } = renderHook(() => useGenericDelegationTokens(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    networks: {
                        customNetworks: [],
                        hardfork: {},
                        isNodeError: false,
                        selectedNetwork: defaultTestNetwork.id,
                        showConversionOtherNets: false,
                        showTestNetTag: false,
                    },
                },
            },
        })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.tokens).toStrictEqual([VTHO.symbol, VET.symbol, B3TR.symbol])
    })

    it("it should return just VTHO is data is undefined", async () => {
        ;(useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() => useGenericDelegationTokens(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    networks: {
                        customNetworks: [],
                        hardfork: {},
                        isNodeError: false,
                        selectedNetwork: defaultTestNetwork.id,
                        showConversionOtherNets: false,
                        showTestNetTag: false,
                    },
                },
            },
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.tokens).toStrictEqual([VTHO.symbol])
    })
})
