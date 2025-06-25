import { act, screen } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"
//MAKE SURE TO HAVE TestWrapper import before InteractionProvider, otherwise everything will collapse
import { TestHelpers, TestWrapper } from "~Test"
import * as InteractionProvider from "~Components/Providers/InteractionProvider"
import * as WalletConnectProvider from "~Components/Providers/WalletConnectProvider"
import { RequestMethods } from "~Constants"
import { AccountWithDevice } from "~Model"

import { CryptoUtils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import { InAppBrowserProvider } from "../../InAppBrowserProvider"

jest.mock("~Components/Providers/InteractionProvider")

jest.mock("~Components/Providers/WalletConnectProvider")

const { device1, hdnode1 } = TestHelpers.data

const mockAccountWithDevice1: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 0),
    index: 0,
    visible: true,
    device: device1,
}

jest.mock("react-native/Libraries/Settings/Settings", () => ({
    get: jest.fn(),
    set: jest.fn(),
}))

jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native")
    return {
        ...RN,
        NativeModules: {
            ...RN.NativeModules,
            PackageDetails: {
                getPackageInfo: jest.fn().mockResolvedValue({
                    packageName: "com.veworld.app",
                    versionName: "1.0.0",
                    versionCode: 1,
                    isOfficial: true,
                }),
            },
        },
    }
})

//Rendering <InAppBrowserProvider /> because it renders the CertificateBottomSheet too
describe("CertificateBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(WalletConnectProvider, "useWalletConnect").mockReturnValue({
            failRequest: jest.fn(),
            processRequest: jest.fn(),
        } as any)
    })
    it("should not show anything if certificate data is empty", async () => {
        const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            certificateBsRef,
            certificateBsData: null,
            setCertificateData: jest.fn(),
        } as any)
        TestHelpers.render.renderComponentWithProps(
            <InAppBrowserProvider platform="android">
                <View />
            </InAppBrowserProvider>,
            {
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
            },
        )
        await act(() => {
            certificateBsRef.current.present()
        })
        expect(screen.queryByTestId("SIGN_CERTIFICATE_REQUEST_TITLE")).toBeNull()
    })
    it("should show something if certificate data is not empty", async () => {
        const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            certificateBsRef,
            certificateBsData: {
                method: RequestMethods.SIGN_CERTIFICATE,
                id: "0x1",
                type: "in-app",
                message: {
                    purpose: "agreement",
                    payload: {
                        type: "text",
                        content: "TEST",
                    },
                },
                options: {},
                appUrl: "https://vechain.org",
                appName: "TEST APP",
                isFirstRequest: false,
            },
            setCertificateData: jest.fn(),
        } as any)

        TestHelpers.render.renderComponentWithProps(
            <InAppBrowserProvider platform="android">
                <View />
            </InAppBrowserProvider>,
            {
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
            },
        )
        await act(() => {
            certificateBsRef.current.present()
        })
        expect(screen.queryByTestId("SIGN_CERTIFICATE_REQUEST_TITLE")).not.toBeNull()
    })
})
