import React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { screen } from "@testing-library/react-native"
import { ethers } from "ethers"
import { defaultTestNetwork } from "~Constants"
import { useUserNodes, useUserStargateNfts } from "~Hooks/Staking"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { Balance, DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import AccountFiatBalance from "./AccountFiatBalance"

const { renderComponentWithProps } = TestHelpers.render

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

const createPreloadedState = (...balances: Balance[]): Partial<RootState> => {
    const userAddress = ethers.Wallet.createRandom().address

    return {
        balances: {
            testnet: {
                [userAddress]: balances,
            },
        } as any,
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

describe("AccountFiatBalance", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render with default balances (1 VET + 1 VTHO + B3TR)", () => {
        ;(useTokenWithCompleteInfo as jest.Mock).mockReturnValue({
            exchangeRate: 1,
            fiatBalance: "1",
        })
        ;(useNonVechainTokenFiat as jest.Mock).mockReturnValue([])
        ;(useUserNodes as jest.Mock).mockReturnValue({ stargateNodes: [], isLoading: false })
        ;(useUserStargateNfts as jest.Mock).mockReturnValue({ ownedStargateNfts: [], isLoading: false })
        renderComponentWithProps(<AccountFiatBalance isLoading={false} isVisible />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createPreloadedState(),
            },
        })

        expect(screen.getByTestId("fiat-balance")).toHaveTextContent("$3.00")
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

        const preloadedState = createPreloadedState()
        // Update the stargate nodes to use the same user address as in the preloaded state
        const selectedAccountAddress = preloadedState.accounts?.selectedAccount
        ;(useUserNodes as jest.Mock).mockReturnValue({
            stargateNodes: [{ xNodeOwner: selectedAccountAddress }],
            isLoading: false,
        })

        renderComponentWithProps(<AccountFiatBalance isLoading={false} isVisible />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(screen.getByTestId("fiat-balance")).toHaveTextContent("$1.00")
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

        renderComponentWithProps(<AccountFiatBalance isLoading={false} isVisible />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: createPreloadedState(),
            },
        })

        expect(screen.getByTestId("fiat-balance")).toHaveTextContent("$1.00")
    })
})
