import { render, screen } from "@testing-library/react-native"
import React, { ComponentProps, useEffect } from "react"
import { FungibleTokenWithBalance } from "~Model"
import { TestWrapper } from "~Test"
import { SendContextProvider, useTokenSendContext } from "../../Provider/SendContextProvider"
import { useCurrentExchangeRate } from "../Hooks"
import { TransactionAlert } from "./TransactionAlert"

jest.mock("../Hooks", () => {
    const actual = jest.requireActual("../Hooks") as typeof import("../Hooks")
    return {
        ...actual,
        useCurrentExchangeRate: jest.fn().mockReturnValue({ data: undefined }),
    }
})

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

const InitializeSendFlow: React.FC<{
    children: React.ReactNode
    token: FungibleTokenWithBalance
    isInputInFiat: boolean
}> = ({ children, token, isInputInFiat }) => {
    const { setFlowState } = useTokenSendContext()

    useEffect(() => {
        setFlowState({
            type: "token",
            token,
            amount: "1.234",
            address: "0xreceiver",
            fiatAmount: undefined,
            amountInFiat: isInputInFiat,
            initialExchangeRate: 1,
        })
    }, [setFlowState, token, isInputInFiat])

    return <>{children}</>
}

const renderScreen = (props: ComponentProps<typeof TransactionAlert>, isInputInFiat: boolean = false) => {
    const token = createToken()

    return render(
        <TestWrapper preloadedState={{}}>
            <SendContextProvider
                initialFlowState={{
                    type: "token",
                    token,
                    amount: "0",
                    fiatAmount: "",
                    address: "",
                    amountInFiat: isInputInFiat,
                }}>
                <InitializeSendFlow token={token} isInputInFiat={isInputInFiat}>
                    <TransactionAlert {...props} />
                </InitializeSendFlow>
            </SendContextProvider>
        </TestWrapper>,
    )
}

describe("TransactionAlert", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("does not render any alert when there is no error, gas adjustment or price update", () => {
        renderScreen({ txError: false, hasGasAdjustment: false })

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

    it("shows transaction failed alert when transaction finishes with error", async () => {
        renderScreen({ txError: true, hasGasAdjustment: false })
        const alert = await screen.findByText("Transaction failed. Please try again.")
        expect(alert).toBeTruthy()
    })

    it("shows gas adjustment alert when onGasAdjusted is called", async () => {
        renderScreen({ txError: false, hasGasAdjustment: true })

        const alert = await screen.findByText("Token amount adjusted for transaction fee.")
        expect(alert).toBeTruthy()
    })

    it("shows price updated alert when exchange rate changes compared to initialExchangeRate", async () => {
        ;(useCurrentExchangeRate as jest.Mock).mockReturnValue({ data: 3 })

        renderScreen({ txError: false, hasGasAdjustment: false }, true)

        const alert = await screen.findByText("Displayed amounts have been updated based on the latest market price.")

        expect(alert).toBeTruthy()
    })

    it("does not show price updated alert when exchange rate changes but the difference less than 0.01", async () => {
        ;(useCurrentExchangeRate as jest.Mock).mockReturnValue({ data: 1.001 })

        renderScreen({ txError: false, hasGasAdjustment: false })
        const alert = await screen.queryByText(
            "Displayed amounts have been updated based on the latest market price.",
            {
                exact: false,
            },
        )

        expect(alert).toBeNull()
    })
})
