import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"

import { RootState } from "~Storage/Redux/Types"
import { TestHelpers, TestWrapper } from "~Test"

import { SendContextProvider } from "../../Provider"

import { WalletAddressCard } from "./WalletAddressCard"

const { account2D1 } = TestHelpers.data

const getVnsAddress = jest.fn()

jest.mock("~Hooks/useVns", () => ({
    ...jest.requireActual("~Hooks/useVns"),
    useVns: jest.fn().mockReturnValue({ getVnsAddress: (...args: any[]) => getVnsAddress(...args) }),
}))

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
    beforeEach(() => {
        jest.clearAllMocks()
    })
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

    it("should handle vns input", async () => {
        const onAddressChangeMock = jest.fn()
        let isError = false
        const setIsError = jest.fn().mockImplementation((value: boolean) => (isError = value))

        const randomAddr = ethers.Wallet.createRandom().address

        getVnsAddress
            .mockImplementationOnce(() => Promise.resolve(randomAddr))
            .mockImplementationOnce(() => Promise.resolve(ethers.constants.AddressZero))
            .mockImplementationOnce(() => Promise.reject("RANDOM ERROR"))

        render(
            <WalletAddressCard
                value=""
                onAddressChange={onAddressChangeMock}
                address="0x0"
                isError={isError}
                setIsError={setIsError}
            />,
            {
                wrapper: createWrapper({}),
            },
        )

        act(() => {
            fireEvent.changeText(screen.getByTestId("Send_Receiver_Address_Input"), "test1.veworld.vet")
        })

        await waitFor(() => {
            expect(onAddressChangeMock).toHaveBeenNthCalledWith(1, "test1.veworld.vet", "test1.veworld.vet")
            expect(onAddressChangeMock).toHaveBeenNthCalledWith(2, "test1.veworld.vet", randomAddr)
            expect(setIsError).toHaveBeenNthCalledWith(1, false)
        })

        act(() => {
            fireEvent.changeText(screen.getByTestId("Send_Receiver_Address_Input"), "test2.veworld.vet")
        })

        await waitFor(() => {
            expect(onAddressChangeMock).toHaveBeenNthCalledWith(3, "test2.veworld.vet", "test2.veworld.vet")
            expect(setIsError).toHaveBeenNthCalledWith(2, true)
        })

        act(() => {
            fireEvent.changeText(screen.getByTestId("Send_Receiver_Address_Input"), "test3.veworld.vet")
        })

        await waitFor(() => {
            expect(onAddressChangeMock).toHaveBeenNthCalledWith(4, "test3.veworld.vet", "test3.veworld.vet")
            expect(setIsError).toHaveBeenNthCalledWith(3, true)
        })
    })
})
