import { act, fireEvent, screen } from "@testing-library/react-native"
import React from "react"
//MAKE SURE TO HAVE TestWrapper import before InteractionProvider, otherwise everything will collapse
import { TestHelpers, TestWrapper } from "~Test"

import * as InAppBrowserProvider from "~Components/Providers/InAppBrowserProvider"
import * as InteractionProvider from "~Components/Providers/InteractionProvider"
import * as WalletConnectProvider from "~Components/Providers/WalletConnectProvider"
import { RequestMethods } from "~Constants"
import { AccountWithDevice } from "~Model"

import { CryptoUtils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import { CertificateBottomSheet } from "./CertificateBottomSheet"
import { useExternalDappConnection } from "~Hooks/useExternalDappConnection"

jest.mock("~Components/Providers/InteractionProvider")
jest.mock("~Components/Providers/DeepLinksProvider")
jest.mock("~Components/Providers/WalletConnectProvider")
jest.mock("~Components/Providers/InAppBrowserProvider")
jest.mock("~Hooks/useCheckIdentity", () => ({
    useCheckIdentity: jest.fn().mockImplementation(({ onIdentityConfirmed }) => {
        return {
            isPasswordPromptOpen: false,
            handleClosePasswordModal: jest.fn(),
            onPasswordSuccess: jest.fn(),
            checkIdentityBeforeOpening: onIdentityConfirmed,
            isBiometricsEmpty: false,
        }
    }),
}))
jest.mock("~Hooks/useSignMessage", () => ({ useSignMessage: jest.fn().mockReturnValue({ signMessage: () => "0x00" }) }))

jest.mock("~Hooks/useExternalDappConnection", () => ({
    useExternalDappConnection: jest.fn().mockReturnValue({
        onRejectRequest: jest.fn(),
        onFailure: jest.fn(),
        onSuccess: jest.fn(),
        onDappDisconnected: jest.fn(),
        getKeyPairFromPrivateKey: jest.fn(),
        getSessionKeyPair: jest.fn(),
        onConnect: jest.fn(),
    } as any),
}))

const { device1, hdnode1 } = TestHelpers.data

const mockAccountWithDevice1: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 0),
    index: 0,
    visible: true,
    device: device1,
}

//Rendering <InAppBrowserProvider /> because it renders the CertificateBottomSheet too
describe("CertificateBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should not show anything if certificate data is empty", async () => {
        const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        ;(useExternalDappConnection as jest.Mock).mockReturnValue({
            onRejectRequest: jest.fn(),
        } as any)
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            certificateBsRef,
            certificateBsData: null,
            setCertificateData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage: jest.fn(),
        } as any)
        jest.spyOn(WalletConnectProvider, "useWalletConnect").mockReturnValue({
            failRequest: jest.fn(),
            processRequest: jest.fn(),
        } as any)
        TestHelpers.render.renderComponentWithProps(<CertificateBottomSheet />, {
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
            certificateBsRef.current.present()
        })
        expect(screen.queryByTestId("SIGN_CERTIFICATE_REQUEST_TITLE")).toBeNull()
    })

    it.each(["in-app", "wallet-connect", "external-app"] as const)(
        "should be able to reject certificate (%s)",
        async kind => {
            const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
            const postMessage = jest.fn()
            const onRejectRequest = jest.fn()
            let bottomSheetData

            if (kind === "in-app") {
                bottomSheetData = {
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
                }
            } else if (kind === "external-app") {
                bottomSheetData = {
                    method: RequestMethods.SIGN_CERTIFICATE,
                    type: "external-app",
                    message: {
                        purpose: "agreement",
                        payload: {
                            type: "text",
                            content: "TEST",
                        },
                    },
                    options: {},
                    appUrl: "https://vechain.org",
                    redirectUrl: "https://vechainwalletlink.example",
                    appName: "TEST APP",
                    isFirstRequest: false,
                }
            } else {
                bottomSheetData = {
                    method: RequestMethods.SIGN_CERTIFICATE,
                    type: "wallet-connect",
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
                    requestEvent: {
                        topic: "TOPIC",
                        id: 1,
                        params: {},
                        verifyContext: {
                            validation: "VALID",
                        } as any,
                    },
                    session: {
                        topic: "TOPIC",
                    },
                }
            }

            jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                certificateBsRef,
                certificateBsData: bottomSheetData,
                setCertificateData: jest.fn(),
            } as any)
            ;(useExternalDappConnection as jest.Mock).mockReturnValue({
                onRejectRequest,
            } as any)
            jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
                postMessage,
            } as any)
            const failRequest = jest.fn()
            jest.spyOn(WalletConnectProvider, "useWalletConnect").mockReturnValue({
                failRequest,
                processRequest: jest.fn(),
            } as any)
            jest.spyOn(WalletConnectProvider, "getRpcError").mockReturnValue({
                code: 4001,
                message: "User rejected request",
            })

            TestHelpers.render.renderComponentWithProps(<CertificateBottomSheet />, {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [mockAccountWithDevice1],
                            selectedAccount: mockAccountWithDevice1.address,
                        },
                        devices: [device1],
                        sessions: {
                            TOPIC: {
                                verifyContext: {
                                    validation: "VALID",
                                } as any,
                                isDeepLink: false,
                            },
                        },
                    },
                },
            })
            await act(() => {
                certificateBsRef.current.present()
            })
            expect(screen.queryByTestId("SIGN_CERTIFICATE_REQUEST_TITLE")).not.toBeNull()
            await act(() => {
                fireEvent.press(screen.getByTestId("SIGN_CERTIFICATE_REQUEST_BTN_CANCEL"))
            })

            if (kind === "in-app")
                expect(postMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    error: "User rejected request",
                    method: RequestMethods.SIGN_CERTIFICATE,
                })
            else if (kind === "external-app")
                expect(onRejectRequest).toHaveBeenCalledWith("https://vechainwalletlink.example")
            else
                expect(failRequest).toHaveBeenCalledWith(
                    {
                        topic: "TOPIC",
                        id: 1,
                        params: {},
                        verifyContext: {
                            validation: "VALID",
                        },
                    },
                    {
                        code: 4001,
                        message: "User rejected request",
                    },
                )
        },
    )

    it.each(["in-app", "wallet-connect", "external-app"] as const)(
        "should be able to sign certificate (%s)",
        async kind => {
            const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
            const postMessage = jest.fn()
            const onSuccess = jest.fn()

            let bottomSheetData

            if (kind === "in-app") {
                bottomSheetData = {
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
                }
            } else if (kind === "external-app") {
                bottomSheetData = {
                    method: RequestMethods.SIGN_CERTIFICATE,
                    type: "external-app",
                    message: {
                        purpose: "agreement",
                        payload: {
                            type: "text",
                            content: "TEST",
                        },
                    },
                    options: {},
                    appUrl: "https://vechain.org",
                    redirectUrl: "https://vechainwalletlink.example",
                    appName: "TEST APP",
                    isFirstRequest: false,
                    publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
                    session:
                        // eslint-disable-next-line max-len
                        "wx4c/wKNBOSLmFth2yQEbnEknxmRGag3v/shknllaFnoEVNs+gXqn9AWdjyuvcM41usbDrNso3KDWHrhjzsqC3siYXBwX2lkIjoiRXhhbXBsZSIsImdlbmVzaXNJZCI6IjB4MDAwMDAwMDAwYjJiY2UzYzcwYmM2NDlhMDI3NDllODY4NzcyMWIwOWVkMmUxNTk5N2Y0NjY1MzZiMjBiYjEyNyIsImFkZHJlc3MiOiIweGYwNzdiNDkxYjM1NWU2NDA0OGNlMjFlM2E2ZmM0NzUxZWVlYTc3ZmEiLCJ0aW1lc3RhbXAiOjE3NTg2MzcyNjU1NDV9",
                }
            } else {
                bottomSheetData = {
                    method: RequestMethods.SIGN_CERTIFICATE,
                    type: "wallet-connect",
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
                    requestEvent: {
                        topic: "TOPIC",
                        id: 1,
                        params: {},
                        verifyContext: {
                            validation: "VALID",
                        } as any,
                    },
                    session: {
                        topic: "TOPIC",
                    },
                }
            }

            jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                certificateBsRef,
                certificateBsData: bottomSheetData,
                setCertificateData: jest.fn(),
            } as any)
            ;(useExternalDappConnection as jest.Mock).mockReturnValue({
                onFailure: jest.fn(),
                onSuccess,
            } as any)
            jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
                postMessage,
            } as any)
            const processRequest = jest.fn()
            jest.spyOn(WalletConnectProvider, "useWalletConnect").mockReturnValue({
                failRequest: jest.fn(),
                processRequest,
            } as any)

            TestHelpers.render.renderComponentWithProps(<CertificateBottomSheet />, {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState: {
                        accounts: {
                            accounts: [mockAccountWithDevice1],
                            selectedAccount: mockAccountWithDevice1.address,
                        },
                        devices: [device1],
                        sessions: {
                            TOPIC: {
                                verifyContext: {
                                    validation: "VALID",
                                } as any,
                                isDeepLink: false,
                            },
                        },
                    },
                },
            })
            await act(() => {
                certificateBsRef.current.present()
            })
            expect(screen.queryByTestId("SIGN_CERTIFICATE_REQUEST_TITLE")).not.toBeNull()
            await act(() => {
                fireEvent.press(screen.getByTestId("SIGN_CERTIFICATE_REQUEST_BTN_SIGN"))
            })

            const data = {
                annex: {
                    domain: "vechain.org",
                    signer: mockAccountWithDevice1.address.toLowerCase(),
                    timestamp: expect.any(Number),
                },
                signature: "0x00",
            }

            if (kind === "in-app")
                expect(postMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    data,

                    method: RequestMethods.SIGN_CERTIFICATE,
                })
            else if (kind === "external-app")
                expect(onSuccess).toHaveBeenCalledWith({
                    data: {
                        signature: "0x00",
                        annex: {
                            domain: "vechain.org",
                            signer: "0xf077b491b355e64048ce21e3a6fc4751eeea77fa",
                            timestamp: Math.ceil(new Date().getTime() / 1000),
                        },
                    },
                    redirectUrl: "https://vechainwalletlink.example",
                    publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
                })
            else
                expect(processRequest).toHaveBeenCalledWith(
                    {
                        topic: "TOPIC",
                        id: 1,
                        params: {},
                        verifyContext: {
                            validation: "VALID",
                        },
                    },
                    data,
                )
        },
    )
})
