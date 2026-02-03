import React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { TestHelpers, TestWrapper } from "~Test"
import { LedgerDeviceBox } from "./LedgerDeviceBox"

const { connectedLedgerDevice } = TestHelpers.data

describe("LedgerDeviceBox", () => {
    it("should render correctly", () => {
        render(<LedgerDeviceBox device={connectedLedgerDevice} onPress={() => {}} isSelected={false} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId(`LEDGER_DEVICE_BOX_${connectedLedgerDevice.id}`)).toBeOnTheScreen()
        expect(screen.getByText(connectedLedgerDevice.localName)).toBeOnTheScreen()
        expect(screen.getByText(connectedLedgerDevice.id)).toBeOnTheScreen()
        expect(
            screen.queryByTestId(`LEDGER_DEVICE_BOX_SELECTED_ICON_${connectedLedgerDevice.id}`),
        ).not.toBeOnTheScreen()
    })

    it("should call onPress when pressed", () => {
        const onPress = jest.fn()
        render(<LedgerDeviceBox device={connectedLedgerDevice} onPress={onPress} isSelected={false} />, {
            wrapper: TestWrapper,
        })

        fireEvent.press(screen.getByTestId(`LEDGER_DEVICE_BOX_${connectedLedgerDevice.id}`))

        expect(onPress).toHaveBeenCalled()
    })

    it("should render correctly when selected", () => {
        render(<LedgerDeviceBox device={connectedLedgerDevice} onPress={() => {}} isSelected={true} />, {
            wrapper: TestWrapper,
        })

        expect(screen.getByTestId(`LEDGER_DEVICE_BOX_${connectedLedgerDevice.id}`)).toBeOnTheScreen()
        expect(screen.getByTestId(`LEDGER_DEVICE_BOX_SELECTED_ICON_${connectedLedgerDevice.id}`)).toBeOnTheScreen()
        expect(screen.getByTestId(`LEDGER_DEVICE_BOX_${connectedLedgerDevice.id}`)).toHaveStyle({
            borderWidth: 2,
            borderColor: "rgba(226, 248, 149, 1)", // LIME_GREEN
        })
    })
})
