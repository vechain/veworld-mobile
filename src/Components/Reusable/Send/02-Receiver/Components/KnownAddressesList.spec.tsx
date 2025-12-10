import * as React from "react"
import { fireEvent, render, screen } from "@testing-library/react-native"
import { TestWrapper } from "~Test"
import { SendContextProvider } from "../../Provider"
import { defaultMainNetwork, defaultTestNetwork } from "~Constants"
import { RootState } from "~Storage/Redux/Types"
import { KnownAddressesList } from "./KnownAddressesList"
import { ContactType, DEVICE_TYPE } from "~Model"

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

describe("KnownAddressesList", () => {
    it("should render correctly", () => {
        render(<KnownAddressesList onAddressChange={jest.fn()} />, {
            wrapper: createWrapper({}),
        })

        expect(screen.getByTestId("AnimatedFilterChips-recent-selected")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts")).toBeOnTheScreen()
        expect(screen.getByTestId("Send_Receiver_Addresses_List_Empty_State")).toBeOnTheScreen()
    })

    it("should render recent contacts list when recent filter is selected", () => {
        render(<KnownAddressesList onAddressChange={jest.fn()} />, {
            wrapper: createWrapper({
                contacts: {
                    contacts: [],
                    recentContacts: {
                        [defaultMainNetwork.genesis.id]: {
                            ["0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"]: [
                                {
                                    address: "0x1234567890123456789012345678901234567890",
                                    alias: "Test Contact",
                                    timestamp: 1764700419038,
                                },
                            ],
                        },
                        [defaultTestNetwork.genesis.id]: {
                            ["0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"]: [
                                {
                                    address: "0x1234567890123456789012345678901234567890",
                                    alias: "Test Contact",
                                    timestamp: 1764700419038,
                                },
                            ],
                        },
                    },
                },
            }),
        })

        expect(screen.getByTestId("AnimatedFilterChips-recent-selected")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts")).toBeOnTheScreen()

        expect(screen.getByTestId("Send_Receiver_Addresses_List_Recent_Contacts")).toBeOnTheScreen()
    })

    it("should render accounts list when accounts filter is selected", () => {
        render(<KnownAddressesList onAddressChange={jest.fn()} />, {
            wrapper: createWrapper({
                accounts: {
                    accounts: [
                        {
                            address: "0x1234567890123456789012345678901234567890",
                            alias: "Test Account",
                            rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                            index: 0,
                            visible: true,
                        },
                        {
                            address: "0x1234567890123456789012345678901234567891",
                            alias: "Test Account 2",
                            rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                            index: 1,
                            visible: true,
                        },
                    ],
                },
                devices: [
                    {
                        alias: "Wallet 1",
                        index: 0,
                        rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                        type: DEVICE_TYPE.LOCAL_MNEMONIC,
                        xPub: {
                            chainCode: "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
                            publicKey:
                                // eslint-disable-next-line max-len
                                "0494c3ff1acb0cf8e842c54a2bf109b7549d8f800895576892a4ea67eff584a427904a4b2545cf84569be87387bc5fe221c20d1ba5f23d278468faa98f54ddedbe",
                        },
                        wallet: JSON.stringify({
                            mnemonic:
                                "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(
                                    " ",
                                ),
                            rootAddress: "0x0c1a60341e1064bebb94e8769bd508b11ca2a27d",
                            nonce: "nonce",
                        }),
                        position: 0,
                    },
                ],
            }),
        })

        expect(screen.getByTestId("AnimatedFilterChips-recent-selected")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts")).toBeOnTheScreen()

        fireEvent.press(screen.getByTestId("AnimatedFilterChips-accounts"))

        expect(screen.getByTestId("AnimatedFilterChips-recent")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts-selected")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts")).toBeOnTheScreen()

        expect(screen.getByTestId("Send_Receiver_Addresses_List_Accounts")).toBeOnTheScreen()
    })

    it("should render contacts list when contacts filter is selected", () => {
        render(<KnownAddressesList onAddressChange={jest.fn()} />, {
            wrapper: createWrapper({
                contacts: {
                    contacts: [
                        {
                            address: "0x1234567890123456769012345678901234567890",
                            alias: "Test Contact",
                            type: ContactType.KNOWN,
                        },
                    ],
                    recentContacts: {},
                },
            }),
        })

        expect(screen.getByTestId("AnimatedFilterChips-recent-selected")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts")).toBeOnTheScreen()

        fireEvent.press(screen.getByTestId("AnimatedFilterChips-contacts"))

        expect(screen.getByTestId("AnimatedFilterChips-recent")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-accounts")).toBeOnTheScreen()
        expect(screen.getByTestId("AnimatedFilterChips-contacts-selected")).toBeOnTheScreen()

        expect(screen.getByTestId("Send_Receiver_Addresses_List_Contacts")).toBeOnTheScreen()
    })
})
