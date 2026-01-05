import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React from "react"
import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"
import { SendContextProvider } from "../../Provider"
import { WalletAddressCard } from "./WalletAddressCard"

const { account2D1 } = TestHelpers.data

const createWrapper = (preloadedState: Partial<RootState>) => {
    return ({ children }: { children: React.ReactNode }) => (
        <TestWrapper preloadedState={preloadedState}>
            <SendContextProvider
                initialFlowState={{
                    type: "token",
                    token: undefined,
                    amount: "0",
                    fiatAmount: "",
                    address: "",
                    amountInFiat: false,
                }}>
                {children}
            </SendContextProvider>
        </TestWrapper>
    )
}

describe("WalletAddressCard", () => {
    it("should render correctly", () => {
        render(<WalletAddressCard onAddressChange={jest.fn()} isError={false} setIsError={jest.fn()} address="" />, {
            wrapper: createWrapper({}),
        })
        expect(screen.getByTestId("Send_Receiver_Address_Input")).toBeOnTheScreen()
        expect(screen.getByTestId("Send_Receiver_Address_Scan_Button")).toBeOnTheScreen()
    })

    it("should render error message when address is invalid", async () => {
        const onAddressChangeMock = jest.fn()
        let isError = false
        const setIsError = jest.fn().mockImplementation((value: boolean) => (isError = value))
        const { rerender } = render(
            <WalletAddressCard
                value="0x00"
                onAddressChange={onAddressChangeMock}
                isError={isError}
                setIsError={setIsError}
                address="0x00"
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        act(() => {
            fireEvent.changeText(screen.getByTestId("Send_Receiver_Address_Input"), "0x01")
        })

        rerender(
            <WalletAddressCard
                value="0x00"
                onAddressChange={onAddressChangeMock}
                isError={isError}
                setIsError={setIsError}
                address="0x00"
            />,
        )

        expect(screen.getByTestId("Send_Receiver_Address_Input_Error")).toBeOnTheScreen()
    })

    it("should call onAddressChange when address changes", async () => {
        const onAddressChangeMock = jest.fn()
        render(
            <WalletAddressCard
                onAddressChange={onAddressChangeMock}
                isError={false}
                setIsError={jest.fn()}
                address="0x00"
                value=""
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        fireEvent.changeText(screen.getByTestId("Send_Receiver_Address_Input"), "0x1212")

        expect(onAddressChangeMock).toHaveBeenCalledWith("0x1212", "0x1212")
    })

    it("should render add to contacts button when address is not in contacts or accounts", async () => {
        const onAddressChangeMock = jest.fn()
        render(
            <WalletAddressCard
                value={account2D1.address}
                onAddressChange={onAddressChangeMock}
                address="0x0"
                isError={false}
                setIsError={jest.fn()}
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        expect(screen.getByTestId("Send_Receiver_Address_Add_To_Contacts_Button")).toBeOnTheScreen()
    })

    it("should render paste button when address is not set", async () => {
        const onAddressChangeMock = jest.fn()
        render(
            <WalletAddressCard
                onAddressChange={onAddressChangeMock}
                value=""
                address="0x0"
                isError={false}
                setIsError={jest.fn()}
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        expect(screen.getByTestId("Send_Receiver_Address_Input_Paste_Button")).toBeOnTheScreen()
    })

    it("should render clear button when address is set", async () => {
        const onAddressChangeMock = jest.fn()
        render(
            <WalletAddressCard
                value={account2D1.address}
                onAddressChange={onAddressChangeMock}
                address="0x0"
                isError={false}
                setIsError={jest.fn()}
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        expect(screen.getByTestId("Send_Receiver_Address_Input_Clear_Button")).toBeOnTheScreen()
    })
})
