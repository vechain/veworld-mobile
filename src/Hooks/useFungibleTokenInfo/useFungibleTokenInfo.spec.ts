import { renderHook } from "@testing-library/react-hooks"
import { useFungibleTokenInfo } from "./useFungibleTokenInfo"
import { VET } from "~Constants"
import { getTokenDecimals, getTokenName, getTokenSymbol } from "~Networking"
import { useThor } from "~Components"
import * as logger from "~Utils/Logger/Logger"

jest.mock("~Networking", () => ({
    getTokenDecimals: jest.fn(),
    getTokenSymbol: jest.fn(),
    getTokenName: jest.fn(),
}))

jest.mock("~Components", () => ({
    useThor: jest.fn(),
}))

describe("useFungibleTokenInfo", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should fetch token symbol and decimals correctly", async () => {
        const tokenAddress = "tokenAddress1"
        const thor = "thor"
        const symbolMock = "SYMBOL"
        const decimalsMock = 18
        const nameMock = "NAME"

        ;(getTokenDecimals as jest.Mock).mockResolvedValue(decimalsMock)
        ;(getTokenSymbol as jest.Mock).mockResolvedValue(symbolMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)
        ;(getTokenName as jest.Mock).mockResolvedValue(nameMock)

        const { result } = renderHook(() => useFungibleTokenInfo(tokenAddress))

        expect(result.current.symbol).toEqual(symbolMock)
        expect(result.current.decimals).toEqual(decimalsMock)
        expect(getTokenSymbol).toHaveBeenCalledWith(tokenAddress, thor)
        expect(getTokenDecimals).toHaveBeenCalledWith(tokenAddress, thor)
        expect(getTokenName).toHaveBeenCalledWith(tokenAddress, thor)
    })

    it("should not fetch token symbol and decimals if token address is VET", () => {
        const tokenAddress = VET.address

        const { result } = renderHook(() => useFungibleTokenInfo(tokenAddress))

        expect(result.current.symbol).toBeUndefined()
        expect(result.current.decimals).toBeUndefined()
        expect(getTokenSymbol).not.toHaveBeenCalled()
        expect(getTokenDecimals).not.toHaveBeenCalled()
        expect(getTokenName).not.toHaveBeenCalled()
    })

    it("should handle error when fetching token info", async () => {
        const tokenAddress = "tokenAddress1"
        const thor = "thor"
        const errorMock = new Error("Error")

        ;(getTokenDecimals as jest.Mock).mockRejectedValue(errorMock)
        ;(getTokenSymbol as jest.Mock).mockRejectedValue(errorMock)
        ;(getTokenName as jest.Mock).mockRejectedValue(errorMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const consoleErrorSpy = jest.spyOn(logger, "error")

        const { result } = renderHook(() => useFungibleTokenInfo(tokenAddress))

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
        expect(result.current.symbol).toBeUndefined()
        expect(result.current.decimals).toBeUndefined()
        expect(result.current.name).toBeUndefined()
        expect(result.current.error).toEqual(errorMock)
    })

    it("fetchData should correctly fetch token info for a provided address", async () => {
        const tokenAddress = "tokenAddress2"
        const thor = "thor"
        const symbolMock = "SYMBOL2"
        const decimalsMock = 8
        const nameMock = "NAME2"

        ;(getTokenDecimals as jest.Mock).mockResolvedValue(decimalsMock)
        ;(getTokenSymbol as jest.Mock).mockResolvedValue(symbolMock)
        ;(getTokenName as jest.Mock).mockResolvedValue(nameMock)
        ;(useThor as jest.Mock).mockReturnValue(thor)

        const { result } = renderHook(() => useFungibleTokenInfo(tokenAddress))

        const fetchedData = await result.current.fetchData(tokenAddress)

        expect(fetchedData.symbol).toEqual(symbolMock)
        expect(fetchedData.decimals).toEqual(decimalsMock)
        expect(fetchedData.name).toEqual(nameMock)
    })
})
