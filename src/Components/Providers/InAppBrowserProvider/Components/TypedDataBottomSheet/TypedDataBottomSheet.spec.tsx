import { TestHelpers, TestWrapper } from "~Test"

import { act, fireEvent, screen } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import * as InAppBrowserProvider from "~Components/Providers/InAppBrowserProvider"
import * as InteractionProvider from "~Components/Providers/InteractionProvider"
import * as WalletConnectProvider from "~Components/Providers/WalletConnectProvider"
import { RequestMethods } from "~Constants"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { AddressUtils, CryptoUtils } from "~Utils"
import { TypedDataBottomSheet } from "./TypedDataBottomSheet"

const { renderComponentWithProps } = TestHelpers.render

jest.mock("~Components/Providers/InteractionProvider")
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

const { device1, hdnode1 } = TestHelpers.data

const mockAccountWithDevice1: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 0),
    index: 0,
    visible: true,
    device: device1,
}

jest.mock("~Hooks/useSignTypedData", () => ({
    useSignTypedMessage: jest.fn().mockReturnValue({ signTypedData: () => "0x00" }),
}))

describe("TypedDataBottomSheet", () => {
    it.each(["in-app", "wallet-connect"] as const)("should be able to reject typed data (%s)", async kind => {
        const typedDataBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        const postMessage = jest.fn()
        const userAddress = ethers.Wallet.createRandom().address
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            typedDataBsRef,
            typedDataBsData:
                kind === "in-app"
                    ? {
                          method: RequestMethods.SIGN_TYPED_DATA,
                          id: "0x1",
                          type: "in-app",
                          domain: {
                              chainId: 1,
                              name: "Test APP",
                              version: "1",
                          },
                          types: {
                              Authentication: [
                                  {
                                      name: "user",
                                      type: "address",
                                  },
                                  {
                                      name: "isSocialLogin",
                                      type: "bool",
                                  },
                                  {
                                      name: "timestamp",
                                      type: "string",
                                  },
                              ],
                          },
                          value: {
                              user: userAddress,
                              isSocialLogin: false,
                              timestamp: "2025-07-22T07:33:23.599Z",
                          },
                          options: {},
                          origin: "0x0",
                          appUrl: "https://vechain.org",
                          appName: "TEST APP",
                          isFirstRequest: false,
                      }
                    : {
                          method: RequestMethods.SIGN_TYPED_DATA,
                          type: "wallet-connect",
                          domain: {
                              chainId: 1,
                              name: "Test APP",
                              version: "1",
                          },
                          types: {
                              Authentication: [
                                  {
                                      name: "user",
                                      type: "address",
                                  },
                                  {
                                      name: "isSocialLogin",
                                      type: "bool",
                                  },
                                  {
                                      name: "timestamp",
                                      type: "string",
                                  },
                              ],
                          },
                          value: {
                              user: userAddress,
                              isSocialLogin: false,
                              timestamp: "2025-07-22T07:33:23.599Z",
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
                      },
            setTypedDataBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage,
            getLoginSession: jest.fn(),
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

        renderComponentWithProps(<TypedDataBottomSheet />, {
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
            typedDataBsRef.current.present()
        })
        expect(screen.queryByTestId("SIGN_TYPED_DATA_REQUEST_TITLE")).not.toBeNull()
        await act(() => {
            fireEvent.press(screen.getByTestId("SIGN_TYPED_DATA_REQUEST_BTN_CANCEL"))
        })

        if (kind === "in-app")
            expect(postMessage).toHaveBeenCalledWith({
                id: "0x1",
                error: "User rejected request",
                method: RequestMethods.SIGN_TYPED_DATA,
            })
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
    })
    it.each(["in-app", "wallet-connect"] as const)("should be able to sign typed data (%s)", async kind => {
        const typedDataBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        const postMessage = jest.fn()
        const userAddress = ethers.Wallet.createRandom().address
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            typedDataBsRef,
            typedDataBsData:
                kind === "in-app"
                    ? {
                          method: RequestMethods.SIGN_TYPED_DATA,
                          id: "0x1",
                          type: "in-app",
                          domain: {
                              chainId: 1,
                              name: "Test APP",
                              version: "1",
                          },
                          types: {
                              Authentication: [
                                  {
                                      name: "user",
                                      type: "address",
                                  },
                                  {
                                      name: "isSocialLogin",
                                      type: "bool",
                                  },
                                  {
                                      name: "timestamp",
                                      type: "string",
                                  },
                              ],
                          },
                          value: {
                              user: userAddress,
                              isSocialLogin: false,
                              timestamp: "2025-07-22T07:33:23.599Z",
                          },
                          options: {},
                          origin: "0x0",
                          appUrl: "https://vechain.org",
                          appName: "TEST APP",
                          isFirstRequest: false,
                      }
                    : {
                          method: RequestMethods.SIGN_TYPED_DATA,
                          type: "wallet-connect",
                          domain: {
                              chainId: 1,
                              name: "Test APP",
                              version: "1",
                          },
                          types: {
                              Authentication: [
                                  {
                                      name: "user",
                                      type: "address",
                                  },
                                  {
                                      name: "isSocialLogin",
                                      type: "bool",
                                  },
                                  {
                                      name: "timestamp",
                                      type: "string",
                                  },
                              ],
                          },
                          value: {
                              user: userAddress,
                              isSocialLogin: false,
                              timestamp: "2025-07-22T07:33:23.599Z",
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
                      },
            setTypedDataBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage,
            getLoginSession: jest.fn(),
        } as any)
        const processRequest = jest.fn()
        jest.spyOn(WalletConnectProvider, "useWalletConnect").mockReturnValue({
            failRequest: jest.fn(),
            processRequest,
        } as any)

        TestHelpers.render.renderComponentWithProps(<TypedDataBottomSheet />, {
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
            typedDataBsRef.current.present()
        })
        expect(screen.queryByTestId("SIGN_TYPED_DATA_REQUEST_TITLE")).not.toBeNull()
        await act(() => {
            fireEvent.press(screen.getByTestId("SIGN_TYPED_DATA_REQUEST_BTN_SIGN"))
        })

        if (kind === "in-app")
            expect(postMessage).toHaveBeenCalledWith({
                id: "0x1",
                data: "0x00",
                method: RequestMethods.SIGN_TYPED_DATA,
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
                "0x00",
            )
    })

    it("should show an alert when selected account is ledger", async () => {
        const typedDataBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        const postMessage = jest.fn()
        const userAddress = ethers.Wallet.createRandom().address
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            typedDataBsRef,
            typedDataBsData: {
                method: RequestMethods.SIGN_TYPED_DATA,
                id: "0x1",
                type: "in-app",
                domain: {
                    chainId: 1,
                    name: "Test APP",
                    version: "1",
                },
                types: {
                    Authentication: [
                        {
                            name: "user",
                            type: "address",
                        },
                        {
                            name: "isSocialLogin",
                            type: "bool",
                        },
                        {
                            name: "timestamp",
                            type: "string",
                        },
                    ],
                },
                value: {
                    user: userAddress,
                    isSocialLogin: false,
                    timestamp: "2025-07-22T07:33:23.599Z",
                },
                options: {},
                origin: "0x0",
                appUrl: "https://vechain.org",
                appName: "TEST APP",
                isFirstRequest: false,
            },
            setTypedDataBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage,
            getLoginSession: jest.fn(),
        } as any)
        const processRequest = jest.fn()
        jest.spyOn(WalletConnectProvider, "useWalletConnect").mockReturnValue({
            failRequest: jest.fn(),
            processRequest,
        } as any)

        TestHelpers.render.renderComponentWithProps(<TypedDataBottomSheet />, {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState: {
                    accounts: {
                        accounts: [
                            {
                                ...mockAccountWithDevice1,
                                device: {
                                    ...device1,
                                    type: DEVICE_TYPE.LEDGER,
                                    deviceId: "TEST",
                                },
                            },
                        ],
                        selectedAccount: mockAccountWithDevice1.address,
                    },
                    devices: [
                        {
                            ...device1,
                            type: DEVICE_TYPE.LEDGER,
                            deviceId: "TEST",
                        },
                    ],
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
            typedDataBsRef.current.present()
        })

        expect(screen.getByTestId("LEDGER_DEVICE_ALERT")).toBeVisible()
    })
})
