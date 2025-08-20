import { act, fireEvent, screen } from "@testing-library/react-native"
import React from "react"
//MAKE SURE TO HAVE TestWrapper import before InteractionProvider, otherwise everything will collapse
import { TestHelpers, TestWrapper } from "~Test"

import * as InAppBrowserProvider from "~Components/Providers/InAppBrowserProvider"
import * as InteractionProvider from "~Components/Providers/InteractionProvider"
import { RequestMethods } from "~Constants"
import { AccountWithDevice, LoginRequest } from "~Model"

import { TESTNET_NETWORK } from "@vechain/sdk-core"
import { HDNode } from "thor-devkit"
import { WalletEncryptionKeyHelper } from "~Components/Providers/EncryptedStorageProvider"
import { CryptoUtils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import { LoginBottomSheet } from "./LoginBottomSheet"

jest.mock("~Components/Providers/InteractionProvider")

jest.mock("~Components/Providers/InAppBrowserProvider")

jest.mock("~Components/Providers/EncryptedStorageProvider/Helpers", () => ({
    ...jest.requireActual("~Components/Providers/EncryptedStorageProvider/Helpers"),
    WalletEncryptionKeyHelper: {
        get: jest.fn(),
        set: jest.fn(),
        decryptWallet: jest.fn(),
        encryptWallet: jest.fn(),
        init: jest.fn(),
    },
}))

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

const { device1, hdnode1, defaultMnemonicPhrase } = TestHelpers.data

const mockAccountWithDevice1: AccountWithDevice = {
    alias: "Account 1",
    rootAddress: device1.rootAddress,
    address: AddressUtils.getAddressFromXPub(CryptoUtils.xPubFromHdNode(hdnode1), 0),
    index: 0,
    visible: true,
    device: device1,
}

describe("LoginBottomSheet", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it("should not show anything if data is empty", async () => {
        const loginBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            loginBsRef,
            loginBsData: null,
            setLoginBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage: jest.fn(),
        } as any)
        TestHelpers.render.renderComponentWithProps(<LoginBottomSheet />, {
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
            loginBsRef.current.present()
        })
        expect(screen.queryByTestId("LOGIN_REQUEST_TITLE")).toBeNull()
    })

    it.each(["in-app"] as const)("should be able to cancel login (%s)", async () => {
        const loginBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        const postMessage = jest.fn()
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            loginBsRef,
            loginBsData: {
                method: RequestMethods.CONNECT,
                id: "0x1",
                type: "in-app",
                appUrl: "https://vechain.org",
                appName: "TEST APP",
                isFirstRequest: false,
                external: false,
                genesisId: TESTNET_NETWORK.genesisBlock.id,
                kind: "simple",
                value: null,
            } satisfies LoginRequest,
            setLoginBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage,
        } as any)

        TestHelpers.render.renderComponentWithProps(<LoginBottomSheet />, {
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
            loginBsRef.current.present()
        })
        expect(screen.queryByTestId("LOGIN_REQUEST_TITLE")).not.toBeNull()
        await act(() => {
            fireEvent.press(screen.getByTestId("LOGIN_REQUEST_BTN_CANCEL"))
        })

        expect(postMessage).toHaveBeenCalledWith({
            id: "0x1",
            error: "User rejected request",
            method: RequestMethods.CONNECT,
        })
    })

    it.each(["simple", "certificate", "typed-data"] as const)("should be able to login with (%s)", async kind => {
        const loginBsRef = { current: { present: jest.fn(), close: jest.fn() } }
        const postMessage = jest.fn()
        const getValue = () => {
            switch (kind) {
                case "simple":
                    return null
                case "certificate":
                    return {
                        purpose: "identification",
                        payload: {
                            type: "text",
                            content: "Test certificate: <<veworld_address>>",
                        },
                    }
                case "typed-data":
                    return {
                        domain: {
                            name: "Ether Mail",
                            version: "1",
                            chainId: "1176455790972829965191905223412607679856028701100105089447013101863",
                            verifyingContract: "0x1CAB02Ec1922F1a5a55996de8c590161A88378b9",
                        },
                        types: {
                            Person: [
                                { name: "name", type: "string" },
                                { name: "wallet", type: "address" },
                            ],
                            Mail: [
                                { name: "from", type: "Person" },
                                { name: "to", type: "Person" },
                                { name: "contents", type: "string" },
                            ],
                        },
                        value: {
                            from: {
                                name: "Cow",
                                wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                            },
                            to: {
                                name: "Bob",
                                wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                            },
                            contents: "Hello, Bob!",
                        },
                    }
            }
        }
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
            loginBsRef,
            loginBsData: {
                method: RequestMethods.CONNECT,
                id: "0x1",
                type: "in-app",
                appUrl: "https://vechain.org",
                appName: "TEST APP",
                isFirstRequest: false,
                external: false,
                genesisId: TESTNET_NETWORK.genesisBlock.id,
                kind: kind,
                value: getValue(),
            },
            setLoginBsData: jest.fn(),
        } as any)
        jest.spyOn(InAppBrowserProvider, "useInAppBrowser").mockReturnValue({
            postMessage,
        } as any)
        const wallet = HDNode.fromMnemonic(defaultMnemonicPhrase).derive(0)
        ;(WalletEncryptionKeyHelper.decryptWallet as jest.Mock).mockResolvedValue({
            mnemonic: defaultMnemonicPhrase,
            rootAddress: wallet.address,
            nonce: "nonce",
        })

        TestHelpers.render.renderComponentWithProps(<LoginBottomSheet />, {
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
            loginBsRef.current.present()
        })
        expect(screen.queryByTestId("LOGIN_REQUEST_TITLE")).not.toBeNull()
        await act(() => {
            fireEvent.press(screen.getByTestId("LOGIN_REQUEST_BTN_SIGN"))
        })

        switch (kind) {
            case "simple":
                expect(postMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    data: { signer: mockAccountWithDevice1.address },
                    method: RequestMethods.CONNECT,
                })
                break
            case "certificate":
                expect(postMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    data: {
                        annex: {
                            domain: "vechain.org",
                            signer: mockAccountWithDevice1.address.toLowerCase(),
                            timestamp: expect.any(Number),
                        },
                        signature: expect.any(String),
                    },
                    method: RequestMethods.CONNECT,
                })
                break
            case "typed-data":
                expect(postMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    data: {
                        signer: mockAccountWithDevice1.address,
                        signature:
                            // eslint-disable-next-line max-len
                            "0xbc10d67411b5a5409e96717dee98f37ef682712e8f37521c261f369b0f287bb71daeddfec1ce37c2b8faa19727d97ad8a1198895d6c6860f0f2ee8fe74d961b51b",
                    },
                    method: RequestMethods.CONNECT,
                })
        }
    })
})
