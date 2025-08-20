import { renderHook } from "@testing-library/react-hooks"
import { act } from "@testing-library/react-native"
import React from "react"
import { PlatformOSType } from "react-native"
import { BaseToast } from "react-native-toast-message"
import { Provider } from "react-redux"
import { defaultTestNetwork, RequestMethods, ThemeEnum } from "~Constants"
import { SecurePersistedCache } from "~Storage/PersistedCache"
import { RootState } from "../../../Storage/Redux/Types"
import { getStore } from "../../../Test"

import { usePersistedTheme } from "../PersistedThemeProvider"

import { TESTNET_NETWORK } from "@vechain/sdk-core"
import * as InteractionProvider from "../InteractionProvider"
import { InAppBrowserProvider, useInAppBrowser } from "./InAppBrowserProvider"

import { ethers } from "ethers"
import { usePostWebviewMessage } from "~Hooks/usePostWebviewMessage"

jest.mock("../InteractionProvider")
jest.mock("~Hooks/usePostWebviewMessage", () => ({
    usePostWebviewMessage: jest.fn(),
}))
const addSession = jest.fn().mockImplementation(payload => ({ type: "discovery/addSession", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    addSession: (...args: any[]) => addSession(...args),
}))
jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
}))

jest.mock("react-native/Libraries/Settings/Settings", () => ({
    get: jest.fn(),
    set: jest.fn(),
}))

const mockedNavigate = jest.fn()
const mockedReplace = jest.fn()

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

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
            replace: mockedReplace,
            canGoBack: jest.fn(),
        }),
    }
})

const createWrapper = (platform: PlatformOSType) => {
    return ({ children, preloadedState }: { children?: React.ReactNode; preloadedState: Partial<RootState> }) => {
        ;(usePersistedTheme as jest.Mock<ReturnType<typeof usePersistedTheme>>).mockReturnValue({
            themeCache: new SecurePersistedCache<ThemeEnum>("test-theme-key", "test-theme"),
            theme: ThemeEnum.DARK,
            initThemeCache: jest.fn(),
            resetThemeCache: jest.fn(),
            changeTheme: jest.fn(),
        })
        return (
            <Provider store={getStore(preloadedState)}>
                <InAppBrowserProvider platform={platform}>
                    {children}
                    <BaseToast />
                </InAppBrowserProvider>
            </Provider>
        )
    }
}

describe("useInAppBrowser hook", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    // This test is to ensure that the browser injects the integrity script on Android.
    // This is to inform Dapps that the app is officialy signed.
    it("should inject integrity script on Android informing if the app is officially signed", async () => {
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({} as any)
        const { result, waitForNextUpdate } = renderHook(() => useInAppBrowser(), {
            wrapper: createWrapper("android"),
        })

        await act(async () => {
            await waitForNextUpdate()
        })

        const injectVechainScript = result.current.injectVechainScript()
        expect(injectVechainScript).toContain(
            'integrity: {"packageName":"com.veworld.app","versionName":"1.0.0","versionCode":1,"isOfficial":true}',
        )
        expect(result.current.isLoading).toBe(false)
    })

    it("should not inject the integrity script on iOS", async () => {
        jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({} as any)
        const { result } = renderHook(() => useInAppBrowser(), {
            wrapper: createWrapper("ios"),
        })

        expect(result.current.injectVechainScript()).toContain("integrity: {}")
        expect(result.current.isLoading).toBe(false)
    })

    describe("onMessage", () => {
        describe("validateTxMessage", () => {
            it("should return an error for an invalid tx message", async () => {
                const transactionBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    transactionBsRef,
                    setTransactionBsData: jest.fn(),
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.REQUEST_TRANSACTION,
                                message: [
                                    {
                                        to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                                        data: "0x",
                                        value: {},
                                    },
                                ],
                                options: {},
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(postWebviewMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    method: RequestMethods.REQUEST_TRANSACTION,
                    error: "Invalid transaction",
                })
            })
            it("should return an error if there is a session with a different wallet", async () => {
                const transactionBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    transactionBsRef,
                    setTransactionBsData: jest.fn(),
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                    initialProps: {
                        preloadedState: {
                            discovery: {
                                bannerInteractions: {},
                                connectedApps: [],
                                custom: [],
                                favorites: [],
                                featured: [],
                                hasOpenedDiscovery: true,
                                tabsManager: {
                                    currentTabId: null,
                                    tabs: [],
                                },
                                sessions: {
                                    "https://vechain.org": {
                                        address: ethers.Wallet.createRandom().address,
                                        genesisId: TESTNET_NETWORK.genesisBlock.id,
                                        url: "https://vechain.org",
                                        kind: "temporary",
                                    },
                                },
                            },
                        },
                    },
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.REQUEST_TRANSACTION,
                                message: [
                                    {
                                        to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                                        data: "0x",
                                        value: "0x1",
                                    },
                                ],
                                options: {
                                    signer: ethers.Wallet.createRandom().address,
                                },
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(postWebviewMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    method: RequestMethods.REQUEST_TRANSACTION,
                    error: "Invalid request. Request signer is different from the session signer.",
                })
            })
            it("should navigate to the tx screen if everything is valid", async () => {
                const transactionBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                const setTransactionBsData = jest.fn()
                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    transactionBsRef,
                    setTransactionBsData,
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                    initialProps: {
                        preloadedState: {
                            networks: {
                                customNetworks: [],
                                hardfork: {},
                                isNodeError: false,
                                selectedNetwork: defaultTestNetwork.id,
                                showConversionOtherNets: false,
                                showTestNetTag: false,
                            },
                        },
                    },
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.REQUEST_TRANSACTION,
                                message: [
                                    {
                                        to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                                        data: "0x",
                                        value: "0x1",
                                    },
                                ],
                                options: {},
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(setTransactionBsData).toHaveBeenCalledWith({
                    appName: "https://vechain.org",
                    appUrl: "https://vechain.org",
                    id: "0x1",
                    isFirstRequest: true,
                    message: [
                        {
                            data: "0x",
                            to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                            value: "0x1",
                        },
                    ],
                    method: "thor_sendTransaction",
                    options: {},
                    type: "in-app",
                })
            })
            it("should navigate to the tx screen if everything is valid and create a session", async () => {
                const transactionBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                const setTransactionBsData = jest.fn()
                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    transactionBsRef,
                    setTransactionBsData,
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                    initialProps: {
                        preloadedState: {
                            networks: {
                                customNetworks: [],
                                hardfork: {},
                                isNodeError: false,
                                selectedNetwork: defaultTestNetwork.id,
                                showConversionOtherNets: false,
                                showTestNetTag: false,
                            },
                        },
                    },
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.REQUEST_TRANSACTION,
                                message: [
                                    {
                                        to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                                        data: "0x",
                                        value: "0x1",
                                    },
                                ],
                                options: {
                                    signer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                },
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(setTransactionBsData).toHaveBeenCalledWith({
                    appName: "https://vechain.org",
                    appUrl: "https://vechain.org",
                    id: "0x1",
                    isFirstRequest: true,
                    message: [
                        {
                            data: "0x",
                            to: "0xf077b491b355E64048cE21E3A6Fc4751eEeA77fa",
                            value: "0x1",
                        },
                    ],
                    method: "thor_sendTransaction",
                    options: {
                        signer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                    type: "in-app",
                })

                expect(addSession).toHaveBeenCalledWith({
                    address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    genesisId: TESTNET_NETWORK.genesisBlock.id,
                    kind: "temporary",
                    url: "https://vechain.org",
                })
            })
        })
        describe("navigateToCertificateScreen", () => {
            it("should return an error for an invalid tx message", async () => {
                const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    certificateBsRef,
                    setCertificateBsData: jest.fn(),
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.SIGN_CERTIFICATE,
                                message: {
                                    payload: {
                                        type: "text",
                                        content: "CERT CONTENT",
                                    },
                                },
                                options: {},
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(postWebviewMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    method: RequestMethods.SIGN_CERTIFICATE,
                    error: "Invalid certificate message",
                })
            })
            it("should return an error if there is a session with a different wallet", async () => {
                const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    certificateBsRef,
                    setCertificateBsData: jest.fn(),
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                    initialProps: {
                        preloadedState: {
                            discovery: {
                                bannerInteractions: {},
                                connectedApps: [],
                                custom: [],
                                favorites: [],
                                featured: [],
                                hasOpenedDiscovery: true,
                                tabsManager: {
                                    currentTabId: null,
                                    tabs: [],
                                },
                                sessions: {
                                    "https://vechain.org": {
                                        address: ethers.Wallet.createRandom().address,
                                        genesisId: TESTNET_NETWORK.genesisBlock.id,
                                        url: "https://vechain.org",
                                        kind: "temporary",
                                    },
                                },
                            },
                        },
                    },
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.SIGN_CERTIFICATE,
                                message: {
                                    purpose: "identification",
                                    payload: {
                                        type: "text",
                                        content: "CERT CONTENT",
                                    },
                                },
                                options: {
                                    signer: ethers.Wallet.createRandom().address,
                                },
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(postWebviewMessage).toHaveBeenCalledWith({
                    id: "0x1",
                    method: RequestMethods.SIGN_CERTIFICATE,
                    error: "Invalid request. Request signer is different from the session signer.",
                })
            })
            it("should navigate to the tx screen if everything is valid", async () => {
                const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                const setCertificateBsData = jest.fn()
                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    certificateBsRef,
                    setCertificateBsData,
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                    initialProps: {
                        preloadedState: {
                            networks: {
                                customNetworks: [],
                                hardfork: {},
                                isNodeError: false,
                                selectedNetwork: defaultTestNetwork.id,
                                showConversionOtherNets: false,
                                showTestNetTag: false,
                            },
                        },
                    },
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.SIGN_CERTIFICATE,
                                message: {
                                    purpose: "identification",
                                    payload: {
                                        type: "text",
                                        content: "CERT CONTENT",
                                    },
                                },
                                options: {},
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(setCertificateBsData).toHaveBeenCalledWith({
                    appName: "https://vechain.org",
                    appUrl: "https://vechain.org",
                    id: "0x1",
                    isFirstRequest: true,
                    message: {
                        purpose: "identification",
                        payload: {
                            type: "text",
                            content: "CERT CONTENT",
                        },
                    },
                    method: RequestMethods.SIGN_CERTIFICATE,
                    options: {},
                    type: "in-app",
                })
            })
            it("should navigate to the tx screen if everything is valid and create a session", async () => {
                const certificateBsRef = { current: { present: jest.fn(), close: jest.fn() } }
                const postWebviewMessage = jest.fn()
                ;(usePostWebviewMessage as jest.Mock).mockReturnValue(postWebviewMessage)

                const setCertificateBsData = jest.fn()
                jest.spyOn(InteractionProvider, "useInteraction").mockReturnValue({
                    certificateBsRef,
                    setCertificateBsData,
                } as any)

                const { result } = renderHook(() => useInAppBrowser(), {
                    wrapper: createWrapper("ios"),
                    initialProps: {
                        preloadedState: {
                            networks: {
                                customNetworks: [],
                                hardfork: {},
                                isNodeError: false,
                                selectedNetwork: defaultTestNetwork.id,
                                showConversionOtherNets: false,
                                showTestNetTag: false,
                            },
                        },
                    },
                })

                await act(() => {
                    result.current.onMessage({
                        nativeEvent: {
                            title: "https://vechain.org",
                            url: "https://vechain.org",
                            canGoBack: false,
                            canGoForward: false,
                            loading: false,
                            lockIdentifier: 1,
                            data: JSON.stringify({
                                method: RequestMethods.SIGN_CERTIFICATE,
                                message: {
                                    purpose: "identification",
                                    payload: {
                                        type: "text",
                                        content: "CERT CONTENT",
                                    },
                                },
                                options: {
                                    signer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                                },
                                genesisId: TESTNET_NETWORK.genesisBlock.id,
                                id: "0x1",
                            }),
                        },
                    } as any)
                })

                expect(setCertificateBsData).toHaveBeenCalledWith({
                    appName: "https://vechain.org",
                    appUrl: "https://vechain.org",
                    id: "0x1",
                    isFirstRequest: true,
                    message: {
                        purpose: "identification",
                        payload: {
                            type: "text",
                            content: "CERT CONTENT",
                        },
                    },
                    method: RequestMethods.SIGN_CERTIFICATE,
                    options: {
                        signer: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    },
                    type: "in-app",
                })

                expect(addSession).toHaveBeenCalledWith({
                    address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    genesisId: TESTNET_NETWORK.genesisBlock.id,
                    kind: "temporary",
                    url: "https://vechain.org",
                })
            })
        })
    })
})
