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
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue([])
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
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue([])
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
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue(["1"])
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
})
