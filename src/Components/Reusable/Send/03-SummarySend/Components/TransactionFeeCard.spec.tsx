import React from "react"
import { render, waitFor } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { TransactionFeeCard } from "./TransactionFeeCard"
import { FungibleTokenWithBalance } from "~Model"
import { GasPriceCoefficient, VET, VTHO } from "~Constants"
import { BigNutils } from "~Utils"
import { useSendContext } from "~Components/Reusable/Send"

const mockSetFlowState = jest.fn()

jest.mock("~Hooks/useTransactionScreen", () => ({
    useTransactionScreen: jest.fn(),
}))

jest.mock("~Components/Reusable/Send", () => ({
    ...jest.requireActual("~Components/Reusable/Send"),
    useSendContext: jest.fn(),
}))

jest.mock("~Components/Reusable/DelegationView", () => ({
    DelegationView: () => null,
}))

jest.mock("~Components/Reusable/GasFeeSpeed", () => ({
    GasFeeSpeed: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}))

const { useTransactionScreen } = require("~Hooks/useTransactionScreen")

const mockedUseSendContext = useSendContext as jest.Mock

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

describe("TransactionFeeCard", () => {
    beforeEach(() => {
        mockedUseSendContext.mockReturnValue({
            flowState: {
                token: createToken(),
                amount: "0",
                fiatAmount: "",
                address: "",
                amountInFiat: false,
            },
            setFlowState: mockSetFlowState,
            setIsNextButtonEnabled: jest.fn(),
        })
        ;(useTransactionScreen as jest.Mock).mockReturnValue(baseHookReturn)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("renders without crashing and binds transaction controls", () => {
        const token = createToken()
        const onBindTransactionControls = jest.fn()

        render(
            <TransactionFeeCard
                token={token}
                amount="1"
                address="0xreceiver"
                onBindTransactionControls={onBindTransactionControls}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(onBindTransactionControls).toHaveBeenCalledWith({
            onSubmit: expect.any(Function),
            isDisabledButtonState: false,
        })
    })

    it("calls onGasAdjusted when gas is not enough and amount is adjusted", async () => {
        const token = createToken()
        const onGasAdjusted = jest.fn()

        const notEnoughGasReturn = {
            ...baseHookReturn,
            isEnoughGas: false,
            isDelegated: false,
            selectedDelegationToken: token.symbol,
            gasOptions: {
                [GasPriceCoefficient.REGULAR]: {
                    maxFee: BigNutils("1"),
                    estimatedFee: BigNutils("1"),
                    priorityFee: BigNutils("0"),
                },
            },
        }

        ;(useTransactionScreen as jest.Mock).mockReturnValue(notEnoughGasReturn)

        render(<TransactionFeeCard token={token} amount="1" address="0xreceiver" onGasAdjusted={onGasAdjusted} />, {
            wrapper: TestWrapper,
        })

        await waitFor(() => {
            expect(onGasAdjusted).toHaveBeenCalled()
        })
    })
})
