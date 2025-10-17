import { TestWrapper } from "~Test"

import { renderHook } from "@testing-library/react-hooks"
import { ethers } from "ethers"
import { defaultTestNetwork } from "~Constants"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenBalance } from "~Hooks/useTokenBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { useTotalFiatBalance } from "./useTotalFiatBalance"

jest.mock("~Hooks/useTokenWithCompleteInfo", () => ({
    useTokenWithCompleteInfo: jest.fn(),
}))

jest.mock("~Hooks/useNonVechainTokenFiat", () => ({
    useNonVechainTokenFiat: jest.fn(),
}))

jest.mock("~Hooks/Staking", () => ({
    useUserNodes: jest.fn(),
    useUserStargateNfts: jest.fn(),
}))

jest.mock("~Hooks/useTokenBalance", () => ({
    useTokenBalance: jest.fn(),
}))

const createPreloadedState = (): Partial<RootState> => {
    const userAddress = ethers.Wallet.createRandom().address

    return {
        networks: {
            customNetworks: [],
            hardfork: {},
            isNodeError: false,
            selectedNetwork: defaultTestNetwork.id,
            showConversionOtherNets: false,
            showTestNetTag: false,
        },
        accounts: {
            accounts: [
                {
                    address: userAddress,
                    alias: "TEST",
                    index: 0,
                    rootAddress: userAddress,
                    visible: true,
                    hasAttemptedClaim: false,
                },
            ],
            selectedAccount: userAddress,
        },
        devices: [
            {
                alias: "TEST",
                index: 0,
                rootAddress: userAddress,
                wallet: userAddress,
                type: DEVICE_TYPE.LOCAL_MNEMONIC,
                position: 0,
            },
        ],
    }
}

describe("useTotalFiatBalance", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render with default balances (1 VET + 1 VTHO + B3TR)", () => {
        const preloadedState = createPreloadedState()
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
            exchangeRate: 1,
            fiatBalance: "1",
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: [], isLoading: false })
        ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [], isLoading: false })
        ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })
        const { result } = renderHook(
            () => useTotalFiatBalance({ address: preloadedState.accounts!.selectedAccount! }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            },
        )

        expect(result.current.renderedBalance).toBe("$3.00")
        expect(result.current.balances).toStrictEqual([
            "1", //VET
            "1", //VTHO
            "1", //B3TR
            "0", //VOT3
            "0", //Stargate
        ])
    })
    it("should render with stargate balances", () => {
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
            exchangeRate: 1,
            fiatBalance: "0",
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: [], isLoading: false })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({
            ownedStargateNfts: [{ vetAmountStaked: ethers.utils.parseEther("1").toString() }],
            isLoading: false,
        })
        ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

        const preloadedState = createPreloadedState()
        // Update the stargate nodes to use the same user address as in the preloaded state
        const selectedAccountAddress = preloadedState.accounts?.selectedAccount
        ;(useUserNodes as jest.Mock).mockReturnValue({
            stargateNodes: [{ xNodeOwner: selectedAccountAddress }],
            isLoading: false,
        })

        const { result } = renderHook(
            () => useTotalFiatBalance({ address: preloadedState.accounts!.selectedAccount! }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            },
        )

        expect(result.current.renderedBalance).toBe("$1.00")
        expect(result.current.balances).toStrictEqual([
            "0", //VET
            "0", //VTHO
            "0", //B3TR
            "0", //VOT3
            "1", //Stargate
        ])
    })
    it("should render non vechain tokens", () => {
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
            exchangeRate: 1,
            fiatBalance: "0",
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: ["1"], isLoading: false })
        ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({
            ownedStargateNfts: [],
            isLoading: false,
        })
        ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

        const preloadedState = createPreloadedState()

        const { result } = renderHook(
            () => useTotalFiatBalance({ address: preloadedState.accounts!.selectedAccount! }),
            {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            },
        )

        expect(result.current.renderedBalance).toBe("$1.00")
        expect(result.current.balances).toStrictEqual([
            "0", //VET
            "0", //VTHO
            "0", //B3TR
            "0", //VOT3
            "1", //Non Vechain Token
            "0", //Stargate
        ])
    })

    describe("useCompactNotation parameter", () => {
        it("should use compact notation by default for large balances", () => {
            const preloadedState = createPreloadedState()
            ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
                exchangeRate: 1,
                fiatBalance: "15000", // 15K
                tokenInfoLoading: false,
            })
            ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: [], isLoading: false })
            ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
            ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [], isLoading: false })
            ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

            const { result } = renderHook(
                () => useTotalFiatBalance({ address: preloadedState.accounts!.selectedAccount! }),
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            // Should use compact notation by default (K, M, B)
            expect(result.current.renderedBalance).toBe("$45K")
        })

        it("should use compact notation when explicitly enabled", () => {
            const preloadedState = createPreloadedState()
            ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
                exchangeRate: 1,
                fiatBalance: "50000",
                tokenInfoLoading: false,
            })
            ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: [], isLoading: false })
            ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
            ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [], isLoading: false })
            ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

            const { result } = renderHook(
                () =>
                    useTotalFiatBalance({
                        address: preloadedState.accounts!.selectedAccount!,
                        useCompactNotation: true,
                    }),
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            expect(result.current.renderedBalance).toBe("$150K")
        })

        it("should not use compact notation when disabled", () => {
            const preloadedState = createPreloadedState()
            ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
                exchangeRate: 1,
                fiatBalance: "15000",
                tokenInfoLoading: false,
            })
            ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: [], isLoading: false })
            ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
            ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [], isLoading: false })
            ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

            const { result } = renderHook(
                () =>
                    useTotalFiatBalance({
                        address: preloadedState.accounts!.selectedAccount!,
                        useCompactNotation: false,
                    }),
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            // Should show full number with decimals
            expect(result.current.renderedBalance).toBe("$45,000.00")
        })

        it("should format small balances correctly without compact notation", () => {
            const preloadedState = createPreloadedState()
            ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
                exchangeRate: 1,
                fiatBalance: "1234.56",
                tokenInfoLoading: false,
            })
            ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: [], isLoading: false })
            ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
            ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [], isLoading: false })
            ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

            const { result } = renderHook(
                () =>
                    useTotalFiatBalance({
                        address: preloadedState.accounts!.selectedAccount!,
                        useCompactNotation: false,
                    }),
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            expect(result.current.renderedBalance).toBe("$3,703.68")
        })

        it("should handle million-dollar balances correctly without compact notation", () => {
            const preloadedState = createPreloadedState()
            ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
                exchangeRate: 1,
                fiatBalance: "1000000",
                tokenInfoLoading: false,
            })
            ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue({ data: [], isLoading: false })
            ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
            ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [], isLoading: false })
            ;(useTokenBalance as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

            const { result } = renderHook(
                () =>
                    useTotalFiatBalance({
                        address: preloadedState.accounts!.selectedAccount!,
                        useCompactNotation: false,
                    }),
                {
                    wrapper: TestWrapper,
                    initialProps: {
                        preloadedState,
                    },
                },
            )

            expect(result.current.renderedBalance).toBe("$3,000,000.00")
        })
    })
})
