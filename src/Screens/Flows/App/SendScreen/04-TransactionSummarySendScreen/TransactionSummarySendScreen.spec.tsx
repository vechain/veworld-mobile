import { RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack"
import { render, screen } from "@testing-library/react-native"
import React from "react"
import { GasPriceCoefficient, VTHO } from "~Constants"
import { useTransactionScreen } from "~Hooks/useTransactionScreen"
import { DelegationType } from "~Model/Delegation"
import { RootStackParamListHome, Routes } from "~Navigation"
import { TestWrapper } from "~Test"
import { BigNutils } from "~Utils"
import { TransactionSummarySendScreen } from "./04-TransactionSummarySendScreen"

jest.mock("@gorhom/bottom-sheet", () => ({
    ...jest.requireActual("@gorhom/bottom-sheet"),
}))

type NavigationScreenPropAlias = NativeStackScreenProps<RootStackParamListHome, Routes.TRANSACTION_SUMMARY_SEND>

type NavigationType = NativeStackNavigationProp<RootStackParamListHome, Routes.TRANSACTION_SUMMARY_SEND, undefined>

type RouteType = RouteProp<RootStackParamListHome, Routes.TRANSACTION_SUMMARY_SEND>

const findElement = async () => await screen.findByTestId("Transaction_Summary_Send_Screen", {}, { timeout: 5000 })

const createRouteToken = (balance = "0x470de4df820000") => {
    return {
        address: "VET",
        balance: {
            accountAddress: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
            balance,
            genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
            position: undefined,
            timeUpdated: "2023-05-24T13:14:07.205Z",
            tokenAddress: "VET",
            isHidden: false,
        },
        custom: false,
        decimals: 18,
        genesisId: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
        icon: "soe image url",
        name: "Vechain",
        symbol: "VET",
    }
}

const route = {
    key: "string",
    name: Routes.NFT_DETAILS,
    path: "string",
    params: {
        initialRoute: Routes.HOME,
        amount: "1492",
        address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
        token: createRouteToken(),
    },
}

const createTestProps = (): unknown & NavigationScreenPropAlias => ({
    navigation: {
        navigate: jest.fn(),
    } as unknown as NavigationType,
    route: route as unknown as RouteType,
})

jest.mock("~Hooks/useCheckIdentity/useCheckIdentity", () => ({
    useCheckIdentity: () => ({
        ConfirmIdentityBottomSheet: "ConfirmIdentityBottomSheet",
        checkIdentityBeforeOpening: jest.fn(),
    }),
}))

jest.mock("~Hooks/useVns/useVns", () => ({
    useVns: () => ({
        name: "grenos.vet",
        address: "0x",
    }),
}))

jest.mock("~Hooks/useTransactionScreen", () => ({
    useTransactionScreen: jest.fn(),
}))

describe("TransactionSummarySendScreen", () => {
    const fallbackToVTHO = jest.fn()
    beforeEach(() => {
        ;(useTransactionScreen as jest.Mock).mockReturnValue({
            selectedDelegationOption: DelegationType.URL,
            onSubmit: jest.fn(),
            isPasswordPromptOpen: false,
            handleClosePasswordModal: jest.fn(),
            onPasswordSuccess: jest.fn(),
            setSelectedFeeOption: jest.fn(),
            resetDelegation: jest.fn(),
            setSelectedDelegationAccount: jest.fn(),
            setSelectedDelegationUrl: jest.fn(),
            isEnoughGas: false,
            isDelegated: true,
            selectedDelegationAccount: undefined,
            selectedDelegationUrl: "https://testnet.delegator.vechain.org",
            isDisabledButtonState: false,
            gasOptions: {
                [GasPriceCoefficient.REGULAR]: {
                    maxFee: BigNutils("37827962264150944"),
                    estimatedFee: BigNutils("37827962264150944"),
                    priorityFee: BigNutils("0"),
                },
                [GasPriceCoefficient.MEDIUM]: {
                    maxFee: BigNutils("37827962264150944"),
                    estimatedFee: BigNutils("37827962264150944"),
                    priorityFee: BigNutils("0"),
                },
                [GasPriceCoefficient.HIGH]: {
                    maxFee: BigNutils("37827962264150944"),
                    estimatedFee: BigNutils("37827962264150944"),
                    priorityFee: BigNutils("0"),
                },
            },
            gasUpdatedAt: Date.now(),
            selectedFeeOption: GasPriceCoefficient.MEDIUM,
            isGalactica: true,
            isBaseFeeRampingUp: false,
            speedChangeEnabled: false,
            availableTokens: ["VTHO", "VET", "B3TR"],
            selectedDelegationToken: "VET",
            setSelectedDelegationToken: jest.fn(),
            fallbackToVTHO,
            hasEnoughBalanceOnAny: false,
            isFirstTimeLoadingFees: false,
            hasEnoughBalanceOnToken: {
                VET: false,
                VTHO: false,
                B3TR: false,
            },
        })
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", async () => {
        render(<TransactionSummarySendScreen {...createTestProps()} />, {
            wrapper: TestWrapper,
        })

        await findElement()
    })

    it("should auto fallback to vtho if user does not have enough balance", () => {
        render(
            <TransactionSummarySendScreen
                {...createTestProps()}
                route={{
                    key: "string",
                    name: Routes.TRANSACTION_SUMMARY_SEND,
                    path: "string",
                    params: {
                        amount: "1492",
                        address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                        token: createRouteToken(),
                    },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(fallbackToVTHO).toHaveBeenCalled()
    })

    it("should not auto fallback to vtho if user has enough balance to cover fees at least", () => {
        const balance = `0x${BigNutils("1492").multiply(BigNutils(10).toBN.pow(18)).toHex}`

        render(
            <TransactionSummarySendScreen
                {...createTestProps()}
                route={{
                    key: "string",
                    name: Routes.TRANSACTION_SUMMARY_SEND,
                    path: "string",
                    params: {
                        amount: "1492",
                        address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                        token: createRouteToken(balance),
                    },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(fallbackToVTHO).not.toHaveBeenCalled()

        expect(useTransactionScreen).toHaveBeenLastCalledWith({
            onTransactionSuccess: expect.any(Function),
            onTransactionFailure: expect.any(Function),
            autoVTHOFallback: false,
            clauses: [
                {
                    to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                    data: "0x",
                    value: `0x${
                        BigNutils(balance)
                            //Gas Fees
                            .minus("37827962264150944")
                            .toHuman(18)
                            .decimals(4)
                            .multiply(BigNutils(10).toBN.pow(18)).toHex
                    }`,
                },
            ],
        })
    })

    it("should fallback when sending VTHO with VET set as the default delegation token without having VET", () => {
        const balance = `0x${BigNutils("1492").multiply(BigNutils(10).toBN.pow(18)).toHex}`

        render(
            <TransactionSummarySendScreen
                {...createTestProps()}
                route={{
                    key: "string",
                    name: Routes.TRANSACTION_SUMMARY_SEND,
                    path: "string",
                    params: {
                        amount: "1492",
                        address: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                        token: {
                            address: VTHO.address,
                            balance: {
                                balance,
                                position: undefined,
                                timeUpdated: "2023-05-24T13:14:07.205Z",
                                tokenAddress: "VTHO",
                                isHidden: false,
                            },
                            custom: false,
                            decimals: 18,
                            icon: "soe image url",
                            name: "Vechain",
                            symbol: "VTHO",
                        },
                    },
                }}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(fallbackToVTHO).toHaveBeenCalled()
    })
})
