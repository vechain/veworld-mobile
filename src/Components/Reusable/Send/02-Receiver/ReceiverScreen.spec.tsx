import { render, screen } from "@testing-library/react-native"
import * as React from "react"
import { TestHelpers, TestWrapper } from "~Test"

import { SendContextProvider, SendFlowState } from "~Components/Reusable"
import { useVns } from "~Hooks/useVns"
import { RootState } from "~Storage/Redux/Types"

import { ethers } from "ethers"
import { defaultMainNetwork } from "~Constants"
import { ContactType } from "~Model"
import { ReceiverScreen } from "./ReceiverScreen"

jest.mock("~Hooks/useVns", () => ({
    ...jest.requireActual("~Hooks/useVns"),
    useVns: jest.fn().mockReturnValue({}),
}))

const createWrapper = (preloadedState: Partial<RootState>, initialFlowState?: Partial<SendFlowState>) => {
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
                    ...initialFlowState,
                }}>
                {children}
            </SendContextProvider>
        </TestWrapper>
    )
}

describe("ReceiverScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should render correctly", () => {
        ;(useVns as jest.Mock).mockReturnValue({})
        render(<ReceiverScreen />, {
            wrapper: createWrapper({}),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toBeOnTheScreen()
        expect(screen.getByTestId("Send_Receiver_Address_Scan_Button")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-recent-selected")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts")).toBeOnTheScreen()
        expect(screen.getByTestId("Send_Receiver_Addresses_List_Empty_State")).toBeOnTheScreen()
    })

    it("should show the address in the address bar", () => {
        const addr = ethers.Wallet.createRandom().address
        ;(useVns as jest.Mock).mockReturnValue({})
        render(<ReceiverScreen />, {
            wrapper: createWrapper({}, { address: addr }),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toHaveProp("value", addr)
    })

    it("should show the vns in the address bar", () => {
        const addr = ethers.Wallet.createRandom().address
        ;(useVns as jest.Mock).mockReturnValue({
            name: "test.veworld.vet",
        })
        render(<ReceiverScreen />, {
            wrapper: createWrapper({}, { address: addr }),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toHaveProp("value", "test.veworld.vet")
    })

    it("should show an empty address bar if no address is specified", () => {
        ;(useVns as jest.Mock).mockReturnValue({})
        render(<ReceiverScreen />, {
            wrapper: createWrapper({}, {}),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toHaveProp("value", "")
    })

    it("should not show the address if it is in the recent contacts", () => {
        const addr = ethers.Wallet.createRandom().address

        ;(useVns as jest.Mock).mockReturnValue({})
        render(<ReceiverScreen />, {
            wrapper: createWrapper(
                {
                    contacts: {
                        recentContacts: {
                            [defaultMainNetwork.genesis.id]: {
                                ["0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"]: [
                                    { address: addr, timestamp: Date.now(), alias: "Contact 1" },
                                ],
                            },
                        },
                        contacts: [],
                    },
                },
                {
                    address: addr,
                },
            ),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toHaveProp("value", "")
        expect(screen.getByTestId("AnimatedFilterChips-recent-selected")).toBeVisible()
        expect(screen.getByTestId("GenericAccountCard-selected-icon")).toBeVisible()
    })

    it("should not show the address if it is in the contacts", () => {
        const addr = ethers.Wallet.createRandom().address

        ;(useVns as jest.Mock).mockReturnValue({})
        render(<ReceiverScreen />, {
            wrapper: createWrapper(
                {
                    contacts: {
                        recentContacts: {},
                        contacts: [{ address: addr, alias: "Contact 1", type: ContactType.KNOWN }],
                    },
                },
                {
                    address: addr,
                },
            ),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toHaveProp("value", "")
        expect(screen.getByTestId("AnimatedFilterChips-contacts-selected")).toBeVisible()
        expect(screen.getByTestId("GenericAccountCard-selected-icon")).toBeVisible()
    })

    it("should not show the address if it is in the accounts", () => {
        ;(useVns as jest.Mock).mockReturnValue({})
        render(<ReceiverScreen />, {
            wrapper: createWrapper(
                {
                    accounts: {
                        accounts: [TestHelpers.data.account1D1, TestHelpers.data.account2D1],
                        selectedAccount: TestHelpers.data.account1D1.address,
                    },
                    devices: [TestHelpers.data.device1],
                },
                {
                    address: TestHelpers.data.account2D1.address,
                },
            ),
        })

        expect(screen.getByTestId("Send_Receiver_Address_Input")).toHaveProp("value", "")
        expect(screen.getByTestId("AnimatedFilterChips-accounts-selected")).toBeVisible()
        expect(screen.getByTestId("GenericAccountCard-selected-icon")).toBeVisible()
    })
})
