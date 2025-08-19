import { act, fireEvent, screen } from "@testing-library/react-native"
import React from "react"
//MAKE SURE TO HAVE TestWrapper import before InteractionProvider, otherwise everything will collapse
import { TestHelpers, TestWrapper } from "~Test"

import * as InAppBrowserProvider from "~Components/Providers/InAppBrowserProvider"
import * as InteractionProvider from "~Components/Providers/InteractionProvider"
import { RequestMethods } from "~Constants"
import { AccountWithDevice } from "~Model"

import { CryptoUtils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import { SwitchWalletBottomSheet } from "./SwitchWalletBottomSheet"

jest.mock("~Components/Providers/InteractionProvider")

jest.mock("~Components/Providers/InAppBrowserProvider")

const { device1, hdnode1 } = TestHelpers.data

const mockAccountWithDevice1: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 0),
    index: 0,
    visible: true,
    device: device1,
}

const mockAccountWithDevice2: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 1),
    index: 1,
    visible: true,
    device: device1,
}

//Rendering <InAppBrowserProvider /> because it renders the CertificateBottomSheet too
describe("SwitchWalletBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should not show anything if data is empty", async () => {
        const switchWalletBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            switchWalletBsRef,
            switchWalletBsData: null,
            setCertificateData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage: jest.fn(),
        } as any)
        TestHelpers.render.renderComponentWithProps(<SwitchWalletBottomSheet />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [mockAccountWithDevice1],
                        selectedAccount: mockAccountWithDevice1.address,
                    },
                    devices: [device1],
                },
            },
        })
        await act(() => {
            switchWalletBsRef.current.present()
        })
        expect(screen.queryByTestId("SWITCH_WALLET_REQUEST_TITLE")).toBeNull()
    })

    it.each(["in-app"] as const)("should be able to cancel switch (%s)", async () => {
        const switchWalletBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        const postMessage = jest.fn()
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            switchWalletBsRef,
            switchWalletBsData: {
                method: RequestMethods.SWITCH_WALLET,
                id: "0x1",
                type: "in-app",
                appUrl: "https://vechain.org",
                appName: "TEST APP",
                isFirstRequest: false,
            },
            setSwitchWalletBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage,
        } as any)

        TestHelpers.render.renderComponentWithProps(<SwitchWalletBottomSheet />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [mockAccountWithDevice1],
                        selectedAccount: mockAccountWithDevice1.address,
                    },
                    devices: [device1],
                },
            },
        })
        await act(() => {
            switchWalletBsRef.current.present()
        })
        expect(screen.queryByTestId("SWITCH_WALLET_REQUEST_TITLE")).not.toBeNull()
        await act(() => {
            fireEvent.press(screen.getByTestId("SWITCH_WALLET_REQUEST_BTN_CANCEL"))
        })

        expect(postMessage).toHaveBeenCalledWith({
            id: "0x1",
            data: mockAccountWithDevice1.address,
            method: RequestMethods.SWITCH_WALLET,
        })
    })

    it.each(["in-app"] as const)("should be able to sign certificate (%s)", async () => {
        const switchWalletBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        const postMessage = jest.fn()
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            switchWalletBsRef,
            switchWalletBsData: {
                method: RequestMethods.SWITCH_WALLET,
                id: "0x1",
                type: "in-app",
                appUrl: "https://vechain.org",
                appName: "TEST APP",
                isFirstRequest: false,
            },
            setSwitchWalletBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage,
        } as any)

        TestHelpers.render.renderComponentWithProps(<SwitchWalletBottomSheet />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [mockAccountWithDevice1, mockAccountWithDevice2],
                        selectedAccount: mockAccountWithDevice1.address,
                    },
                    devices: [device1],
                },
            },
        })
        await act(() => {
            switchWalletBsRef.current.present()
        })
        expect(screen.queryByTestId("SWITCH_WALLET_REQUEST_TITLE")).not.toBeNull()
        const accounts = screen.getAllByTestId("SWITCH_WALLET_ACCOUNT_BOX")
        const lastAccount = accounts[accounts.length - 1]
        await act(() => {
            fireEvent(lastAccount, "click")
        })
        await act(() => {
            fireEvent.press(screen.getByTestId("SWITCH_WALLET_REQUEST_BTN_SIGN"))
        })

        expect(postMessage).toHaveBeenCalledWith({
            id: "0x1",
            data: mockAccountWithDevice2.address,

            method: RequestMethods.SWITCH_WALLET,
        })
    })
})
