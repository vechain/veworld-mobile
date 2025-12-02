import React from "react"
import { act, render, screen } from "@testing-library/react-native"
import { SummaryScreen } from "./SummaryScreen"
import { FungibleTokenWithBalance } from "~Model"
import { TestWrapper } from "~Test"
import { GasPriceCoefficient, VET, VTHO } from "~Constants"
import { BigNutils } from "~Utils"

const mockUseInterval = jest.fn()
const mockUseExchangeRate = jest.fn()

jest.mock("usehooks-ts", () => ({
    useInterval: (callback: () => void, delay?: number) => mockUseInterval(callback, delay),
}))

jest.mock("~Hooks/useTransactionScreen", () => ({
    useTransactionScreen: jest.fn(),
}))

jest.mock("~Components/Reusable/DelegationView", () => ({
    DelegationView: () => null,
}))

jest.mock("~Components/Reusable/GasFeeSpeed", () => ({
    GasFeeSpeed: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}))

let lastTransactionFeeCardProps: {
    onGasAdjusted?: () => void
} | null = null

jest.mock("./Components/TransactionFeeCard", () => {
    const actual = jest.requireActual(
        "./Components/TransactionFeeCard",
    ) as typeof import("./Components/TransactionFeeCard")

    return {
        ...actual,
        TransactionFeeCard: (props: React.ComponentProps<(typeof actual)["TransactionFeeCard"]>) => {
            lastTransactionFeeCardProps = {
                onGasAdjusted: props.onGasAdjusted,
            }
            return <actual.TransactionFeeCard {...props} />
        },
    }
})

const { useTransactionScreen } = require("~Hooks/useTransactionScreen")

const baseHookReturn = {
    selectedDelegationOption: undefined,
    onSubmit: jest.fn(),
    isPasswordPromptOpen: false,
    handleClosePasswordModal: jest.fn(),
    onPasswordSuccess: jest.fn(),
    setSelectedFeeOption: jest.fn(),
    resetDelegation: jest.fn(),
    setSelectedDelegationAccount: jest.fn(),
    setSelectedDelegationUrl: jest.fn(),
    isEnoughGas: true,
    isDelegated: false,
    selectedDelegationAccount: undefined,
    selectedDelegationUrl: undefined,
    isDisabledButtonState: false,
    gasOptions: {
        [GasPriceCoefficient.REGULAR]: {
            maxFee: BigNutils("0"),
            estimatedFee: BigNutils("0"),
            priorityFee: BigNutils("0"),
        },
    },
    gasUpdatedAt: Date.now(),
    selectedFeeOption: GasPriceCoefficient.REGULAR,
    isGalactica: false,
    isBaseFeeRampingUp: false,
    speedChangeEnabled: false,
    availableTokens: [VET.symbol, VTHO.symbol],
    selectedDelegationToken: VET.symbol,
    setSelectedDelegationToken: jest.fn(),
    fallbackToVTHO: jest.fn(),
    hasEnoughBalanceOnAny: true,
    isFirstTimeLoadingFees: false,
    hasEnoughBalanceOnToken: {
        [VET.symbol]: true,
        [VTHO.symbol]: true,
    },
}

const createToken = (overrides: Partial<FungibleTokenWithBalance> = {}): FungibleTokenWithBalance =>
    ({
        address: "VET",
        balance: {
            accountAddress: "0xaccount",
            balance: "0x470de4df820000",
            genesisId: "0xgenesis",
            position: undefined,
            timeUpdated: "2023-05-24T13:14:07.205Z",
            tokenAddress: "VET",
            isHidden: false,
        },
        custom: false,
        decimals: 18,
        genesisId: "0xgenesis",
        icon: "icon",
        name: "Vechain",
        symbol: "VET",
        ...overrides,
    } as FungibleTokenWithBalance)

describe("SummaryScreen", () => {
    beforeEach(() => {
        ;(useTransactionScreen as jest.Mock).mockReturnValue(baseHookReturn)
        lastTransactionFeeCardProps = null
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderSummaryScreen = (props?: Partial<React.ComponentProps<typeof SummaryScreen>>) => {
        const token = createToken()

        return render(
            <TestWrapper preloadedState={{}}>
                <SummaryScreen
                    token={token}
                    amount="1.234"
                    address="0xreceiver"
                    onTxFinished={jest.fn()}
                    onBindTransactionControls={jest.fn()}
                    txError={false}
                    {...props}
                />
            </TestWrapper>,
        )
    }

    it("renders summary header and transaction fee section", async () => {
        mockUseExchangeRate.mockReturnValue({
            data: 1,
            refetch: jest.fn(),
        })

        renderSummaryScreen()

        const headerTitle = await screen.findByText("Review details", {}, { timeout: 5000 })
        expect(headerTitle).toBeTruthy()

        const feeTitle = await screen.findByText("Transaction fee", {}, { timeout: 5000 })
        expect(feeTitle).toBeTruthy()
    })

    it("does not render any alert when there is no error, gas adjustment or price update", () => {
        mockUseExchangeRate.mockReturnValue({
            data: 1,
            refetch: jest.fn(),
        })

        renderSummaryScreen()

        expect(
            screen.queryByText("Transaction failed. Please try again.", {
                exact: false,
            }),
        ).toBeNull()
        expect(
            screen.queryByText("Token amount adjusted for transaction fee.", {
                exact: false,
            }),
        ).toBeNull()
        expect(
            screen.queryByText("Displayed amounts have been updated based on the latest market price.", {
                exact: false,
            }),
        ).toBeNull()
    })

    it("shows transaction failed alert when txError is true", async () => {
        mockUseExchangeRate.mockReturnValue({
            data: 1,
            refetch: jest.fn(),
        })

        renderSummaryScreen({ txError: true })

        const alert = await screen.findByText("Transaction failed. Please try again.")
        expect(alert).toBeTruthy()
    })

    it("shows gas adjustment alert when onGasAdjusted is called", async () => {
        mockUseExchangeRate.mockReturnValue({
            data: 1,
            refetch: jest.fn(),
        })

        renderSummaryScreen()

        expect(lastTransactionFeeCardProps).not.toBeNull()

        await act(async () => {
            lastTransactionFeeCardProps?.onGasAdjusted?.()
        })

        const alert = await screen.findByText("Token amount adjusted for transaction fee.")
        expect(alert).toBeTruthy()
    })
})
