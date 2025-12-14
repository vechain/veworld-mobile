import { TestHelpers, TestWrapper } from "~Test"
import { useTokenSendContext } from "../../Provider"
import { renderHook } from "@testing-library/react-hooks"
import { useDefaultToken } from "./useDefaultToken"
import { defaultMainNetwork, VTHO } from "~Constants"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { ethers } from "ethers"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"

jest.mock("../../Provider", () => ({
    useTokenSendContext: jest.fn(),
}))

jest.mock("~Hooks/useNonVechainTokensBalance", () => ({
    useNonVechainTokensBalance: jest.fn().mockReturnValue({ data: [] }),
}))

jest.mock("~Hooks/useSendableTokensWithBalance", () => ({
    useSendableTokensWithBalance: jest.fn().mockReturnValue([]),
}))

jest.mock("~Hooks/useNonVechainTokenFiat", () => ({
    useNonVechainTokenFiat: jest.fn().mockReturnValue([]),
}))

jest.mock("~Api/Coingecko", () => ({
    ...jest.requireActual("~Api/Coingecko"),
    useExchangeRate: jest.fn().mockReturnValue({ data: 1 }),
}))

describe("useDefaultToken", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should use the flow state token if defined", () => {
        ;(useTokenSendContext as jest.Mock).mockReturnValue({ flowState: { token: TestHelpers.data.VETWithBalance } })

        const { result } = renderHook(() => useDefaultToken(), {
            wrapper: TestWrapper,
        })

        expect(result.current).toBe(TestHelpers.data.VETWithBalance)
    })
    it("should use the last sent token if available", () => {
        ;(useTokenSendContext as jest.Mock).mockReturnValue({ flowState: {} })
        ;(useSendableTokensWithBalance as jest.Mock).mockReturnValue([
            TestHelpers.data.VETWithBalance,
            TestHelpers.data.VTHOWithBalance,
        ])

        const { result } = renderHook(() => useDefaultToken(), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    walletPreferences: {
                        [defaultMainNetwork.genesis.id]: {
                            ["0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"]: {
                                lastSentTokenAddress: VTHO.address,
                            },
                        },
                    },
                },
            },
        })

        expect(result.current).toBe(TestHelpers.data.VTHOWithBalance)
    })
    it("should use the token with the highest fiat value", () => {
        const randomAddress = ethers.Wallet.createRandom().address
        ;(useTokenSendContext as jest.Mock).mockReturnValue({ flowState: {} })
        ;(useSendableTokensWithBalance as jest.Mock).mockReturnValue([
            {
                ...TestHelpers.data.VETWithBalance,
                balance: {
                    ...TestHelpers.data.VETWithBalance.balance,
                    balance: ethers.utils.parseEther("1").toString(),
                },
            },
            {
                ...TestHelpers.data.VTHOWithBalance,
                balance: {
                    ...TestHelpers.data.VTHOWithBalance.balance,
                    balance: ethers.utils.parseEther("2").toString(),
                },
            },
            {
                ...TestHelpers.data.VETWithBalance,
                symbol: "BTC",
                address: randomAddress,
                balance: {
                    ...TestHelpers.data.VETWithBalance.balance,
                    balance: ethers.utils.parseEther("3").toString(),
                },
            },
        ])
        ;(useNonVechainTokensBalance as jest.Mock).mockReturnValue({
            data: [{ address: randomAddress }],
            isLoading: false,
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({
            data: [ethers.utils.parseEther("4").toString()],
            isLoading: false,
        })

        const { result } = renderHook(() => useDefaultToken(), {
            wrapper: TestWrapper,
        })

        expect(result.current?.address).toBe(randomAddress)
        expect(result.current?.symbol).toBe("BTC")
    })
})
