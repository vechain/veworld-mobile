import { fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { TestHelpers, TestWrapper } from "~Test"
import { AddressUtils } from "~Utils"
import LedgerAccountBox from "./LedgerAccountBox"

const { mockLedgerAccount } = TestHelpers.data

describe("LedgerAccountBox", () => {
    it("should render correctly", () => {
        render(
            <LedgerAccountBox account={mockLedgerAccount} index={0} isSelected={false} onAccountClick={() => {}} />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByTestId(`LEDGER_ACCOUNT_BOX_${mockLedgerAccount.address}`)).toBeOnTheScreen()
        expect(screen.getByText("Account 1")).toBeOnTheScreen()
        expect(screen.getByText(AddressUtils.humanAddress(mockLedgerAccount.address))).toBeOnTheScreen()
    })

    it("should call onAccountClick when pressed", () => {
        const onAccountClick = jest.fn()
        render(
            <LedgerAccountBox
                account={mockLedgerAccount}
                index={0}
                isSelected={false}
                onAccountClick={onAccountClick}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        fireEvent.press(screen.getByTestId(`LEDGER_ACCOUNT_BOX_${mockLedgerAccount.address}`))

        expect(onAccountClick).toHaveBeenCalled()
    })

    it("should render correctly when selected", () => {
        render(<LedgerAccountBox account={mockLedgerAccount} index={0} isSelected={true} onAccountClick={() => {}} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId(`LEDGER_ACCOUNT_BOX_${mockLedgerAccount.address}`)).toBeOnTheScreen()
        expect(screen.getByText("Account 1")).toBeOnTheScreen()
        expect(screen.getByTestId("LEDGER_ACCOUNT_BOX_SELECTED_ICON")).toBeOnTheScreen()
        expect(screen.getByTestId(`LEDGER_ACCOUNT_BOX_${mockLedgerAccount.address}`)).toHaveStyle({
            borderWidth: 2,
            borderColor: "rgba(226, 248, 149, 1)", // LIME_GREEN
        })
    })
})
