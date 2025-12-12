import { useQueryClient } from "@tanstack/react-query"
import { Mutex } from "async-mutex"
import React, { useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { InteractionManager, Linking } from "react-native"
import { showInfoToast } from "~Components/Base/BaseToast"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"
import { useI18nContext } from "~i18n/i18n-react"
import { ConnectAppRequest } from "~Model"
import { isValidSession, selectAccounts, switchNetwork, useAppSelector } from "~Storage/Redux"
import { AddressUtils, DAppUtils } from "~Utils"
import { DeepLinkError } from "~Utils/ErrorMessageUtils"
import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { useInteraction } from "../InteractionProvider"
import { useStore } from "../StoreProvider"
import { ConnectionLinkParams, ExternalAppRequestParams } from "./types"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { AnalyticsEvent } from "~Constants"

type DeepLinkEvent = "discover" | "connect" | "signTransaction" | "signCertificate" | "signTypedData" | "disconnect"

type DiscoverURLRequest = {
    event: "discover"
    request: string
}

type DappURLRequest = {
    event: Exclude<DeepLinkEvent, "discover">
    request: Record<string, string>
}

type ContextType = {
    /**
     * A mutex to prevent multiple requests from being processed at the same time
     */
    mutex: Mutex
}

const Context = React.createContext<ContextType | undefined>(undefined)

const parseUrl = (url: string): DiscoverURLRequest | DappURLRequest => {
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const destructuredPath = path.split("/")

    if (destructuredPath[0] === "discover") {
        return {
            event: "discover",
            request: decodeURIComponent(destructuredPath[destructuredPath.length - 1]),
        }
    }
    return {
        event: destructuredPath.pop() as Exclude<DeepLinkEvent, "discover">,
        request: Object.fromEntries(urlObj.searchParams),
    }
}

export const DeepLinksProvider = ({ children }: { children: React.ReactNode }) => {
    /**
     * A mutex to prevent multiple requests from being processed at the same time
     */
    const mutex = useRef<Mutex>(new Mutex())
    const { navigateWithTab } = useBrowserTab()
    const queryClient = useQueryClient()
    const mounted = useRef(false)
    const {
        setConnectBsData,
        connectBsRef,
        setTransactionBsData,
        transactionBsRef,
        setDisconnectBsData,
        disconnectBsRef,
        setTypedDataBsData,
        typedDataBsRef,
        setCertificateBsData,
        certificateBsRef,
    } = useInteraction()
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()
    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { store } = useStore()

    const track = useAnalyticTracking()

    const getInitialStore = useCallback(() => {
        return store
    }, [store])

    const switchAccount = useCallback(
        (address: string) => {
            onSetSelectedAccount({ address })
            const account = accounts.find(acct => AddressUtils.compareAddresses(acct.address, address))
            showInfoToast({
                text1: LL.NOTIFICATION_WC_ACCOUNT_CHANGED({
                    account: account?.alias ?? "",
                }),
            })
        },
        [accounts, onSetSelectedAccount, LL],
    )

    const handleConnectionLink = useCallback(
        async (params: ConnectionLinkParams) => {
            if (mutex.current.isLocked()) {
                DAppUtils.dispatchResourceNotAvailableError(params.redirect_url ?? "")
                return
            }

            track(AnalyticsEvent.EXTERNAL_APP_WALLET_INTERACTION, {
                event: "connect",
                appName: params.app_name,
                appUrl: params.app_url,
            })

            const release = await mutex.current.acquire()

            const decodedRequest: ConnectAppRequest = {
                type: "external-app",
                appName: params.app_name,
                appUrl: params.app_url ?? "",
                publicKey: params.public_key,
                redirectUrl: params.redirect_url ?? "",
                iconUrl: params.app_icon,
                genesisId: params.genesis_id,
            }

            const initialStore = getInitialStore()

            if (!initialStore) {
                release?.()
                DAppUtils.dispatchInternalError(params.redirect_url ?? "")
                return
            }

            try {
                initialStore.dispatch(switchNetwork(decodedRequest.genesisId, LL))

                setConnectBsData(decodedRequest)
                connectBsRef.current?.present()
            } catch (e) {
                release?.()
                if (e instanceof DeepLinkError) {
                    DAppUtils.dispatchExternalAppError(params.redirect_url, e)
                } else {
                    DAppUtils.dispatchInternalError(params.redirect_url)
                }
            }
        },
        [track, getInitialStore, LL, setConnectBsData, connectBsRef],
    )

    const handleSignAndSendTransaction = useCallback(
        async (params: ExternalAppRequestParams) => {
            if (mutex.current.isLocked()) {
                DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                return
            }

            const release = await mutex.current.acquire()

            // Decode the request from the params uri encoded string
            const decodedRequest = DAppUtils.decodeRequest(params.request)

            const initialStore = getInitialStore()

            if (!initialStore) {
                release?.()
                DAppUtils.dispatchInternalError(params.redirect_url)
                return
            }

            try {
                const externalSessions = initialStore.dispatch(switchNetwork(decodedRequest.genesisId, LL))

                if (!externalSessions) {
                    release?.()
                    throw new DeepLinkError(DeepLinkErrorCode.Unauthorized)
                }

                const request = await DAppUtils.parseTransactionRequest(
                    decodedRequest,
                    externalSessions,
                    params.redirect_url,
                )

                if (request && request.type === "external-app") {
                    track(AnalyticsEvent.EXTERNAL_APP_WALLET_INTERACTION, {
                        event: "signTransaction",
                        appName: request?.appName,
                        appUrl: request?.appUrl,
                    })
                    const isValid = initialStore.dispatch(
                        isValidSession(request.genesisId, request.publicKey, request.session, switchAccount),
                    )

                    if (!isValid) {
                        DAppUtils.dispatchInternalError(params.redirect_url)
                        return
                    }

                    setTransactionBsData({
                        ...request,
                        redirectUrl: params.redirect_url,
                    })
                    transactionBsRef.current?.present()
                }
            } catch (e) {
                release?.()
                if (e instanceof DeepLinkError) {
                    DAppUtils.dispatchExternalAppError(params.redirect_url, e)
                } else {
                    DAppUtils.dispatchInternalError(params.redirect_url)
                }
            }
        },
        [getInitialStore, LL, track, switchAccount, setTransactionBsData, transactionBsRef],
    )

    const handleSignTypedData = useCallback(
        async (params: ExternalAppRequestParams) => {
            if (mutex.current.isLocked()) {
                DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                return
            }

            const release = await mutex.current.acquire()

            // Decode the request from the params uri encoded string
            const decodedRequest = DAppUtils.decodeRequest(params.request)

            const initialStore = getInitialStore()

            if (!initialStore) {
                release?.()
                DAppUtils.dispatchInternalError(params.redirect_url)
                return
            }

            try {
                const externalSessions = initialStore.dispatch(switchNetwork(decodedRequest.genesisId, LL))

                if (!externalSessions) {
                    release?.()
                    throw new DeepLinkError(DeepLinkErrorCode.Unauthorized)
                }

                const request = await DAppUtils.parseTypedDataRequest(
                    decodedRequest,
                    externalSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    track(AnalyticsEvent.EXTERNAL_APP_WALLET_INTERACTION, {
                        event: "signTypedData",
                        appName: request?.appName,
                        appUrl: request?.appUrl,
                    })

                    const isValid = initialStore.dispatch(
                        isValidSession(request.genesisId, request.publicKey, request.session, switchAccount),
                    )

                    if (!isValid) {
                        DAppUtils.dispatchInternalError(params.redirect_url)
                        release?.()
                        return
                    }

                    setTypedDataBsData({
                        ...request,
                        redirectUrl: params.redirect_url,
                    })
                    typedDataBsRef.current?.present()
                }
            } catch (e) {
                release?.()
                if (e instanceof DeepLinkError) {
                    DAppUtils.dispatchExternalAppError(params.redirect_url, e)
                } else {
                    DAppUtils.dispatchInternalError(params.redirect_url)
                }
            }
        },
        [getInitialStore, LL, track, switchAccount, setTypedDataBsData, typedDataBsRef],
    )

    const handleSignCertificate = useCallback(
        async (params: ExternalAppRequestParams) => {
            if (mutex.current.isLocked()) {
                DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                return
            }

            const release = await mutex.current.acquire()

            // Decode the request from the params uri encoded string
            const decodedRequest = DAppUtils.decodeRequest(params.request)

            const initialStore = getInitialStore()

            if (!initialStore) {
                release?.()
                DAppUtils.dispatchInternalError(params.redirect_url ?? "")
                return
            }

            try {
                const externalSessions = initialStore.dispatch(switchNetwork(decodedRequest.genesisId, LL))

                if (!externalSessions) {
                    release?.()
                    throw new DeepLinkError(DeepLinkErrorCode.Unauthorized)
                }

                //Parse and decrypt the request
                const request = await DAppUtils.parseCertificateRequest(
                    decodedRequest,
                    externalSessions,
                    params.redirect_url,
                )

                if (request && request.type === "external-app") {
                    track(AnalyticsEvent.EXTERNAL_APP_WALLET_INTERACTION, {
                        event: "signCertificate",
                        appName: request?.appName,
                        appUrl: request?.appUrl,
                    })

                    const isValid = initialStore.dispatch(
                        isValidSession(request.genesisId, request.publicKey, request.session, switchAccount),
                    )

                    if (!isValid) {
                        DAppUtils.dispatchInternalError(params.redirect_url)
                        release?.()
                        throw new DeepLinkError(DeepLinkErrorCode.Unauthorized)
                    }

                    setCertificateBsData({
                        ...request,
                        redirectUrl: params.redirect_url,
                    })
                    certificateBsRef.current?.present()
                }
            } catch (e) {
                release?.()
                if (e instanceof DeepLinkError) {
                    DAppUtils.dispatchExternalAppError(params.redirect_url, e)
                } else {
                    DAppUtils.dispatchInternalError(params.redirect_url)
                }
            }
        },
        [getInitialStore, LL, track, switchAccount, setCertificateBsData, certificateBsRef],
    )

    const handleDisconnect = useCallback(
        async (params: ExternalAppRequestParams) => {
            if (mutex.current.isLocked()) {
                DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                return
            }

            const release = await mutex.current.acquire()

            // Decode the request from the params uri encoded string
            const decodedRequest = DAppUtils.decodeRequest(params.request)

            const initialStore = getInitialStore()

            if (!initialStore) {
                release?.()
                DAppUtils.dispatchInternalError(params.redirect_url ?? "")
                return
            }

            try {
                const externalSessions = initialStore.dispatch(switchNetwork(decodedRequest.genesisId, LL))

                if (!externalSessions) {
                    release?.()
                    throw new DeepLinkError(DeepLinkErrorCode.Unauthorized)
                }

                const request = await DAppUtils.parseDisconnectRequest(
                    decodedRequest,
                    externalSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    track(AnalyticsEvent.EXTERNAL_APP_WALLET_INTERACTION, {
                        event: "disconnect",
                        appName: request?.appName,
                        appUrl: request?.appUrl,
                    })

                    const isValid = initialStore.dispatch(
                        isValidSession(request.genesisId, request.publicKey, request.session, switchAccount),
                    )

                    if (!isValid) {
                        DAppUtils.dispatchInternalError(params.redirect_url)
                        return
                    }

                    setDisconnectBsData({
                        ...request,
                        redirectUrl: params.redirect_url,
                    })
                    disconnectBsRef.current?.present()
                }
            } catch (e) {
                release?.()
                if (e instanceof DeepLinkError) {
                    DAppUtils.dispatchExternalAppError(params.redirect_url, e)
                } else {
                    DAppUtils.dispatchInternalError(params.redirect_url)
                }
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [getInitialStore, LL, track, switchAccount, setDisconnectBsData, disconnectBsRef],
    )

    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
            // Force fresh dApp data when coming from external browser
            queryClient.invalidateQueries({ queryKey: ["fetchFeaturedDApps"] })

            const { event, request } = parseUrl(url)

            switch (event) {
                case "discover":
                    navigateWithTab({ url: request, title: request, navigationFn: () => {} })
                    break
                case "connect":
                    handleConnectionLink(request as ConnectionLinkParams)
                    break
                case "signTransaction":
                    handleSignAndSendTransaction(request as ExternalAppRequestParams)
                    break
                case "signCertificate":
                    handleSignCertificate(request as ExternalAppRequestParams)
                    break
                case "signTypedData":
                    handleSignTypedData(request as ExternalAppRequestParams)
                    break
                case "disconnect":
                    handleDisconnect(request as ExternalAppRequestParams)
                    break
                default:
                    break
            }
        }

        const interaction = InteractionManager.runAfterInteractions(() => {
            Linking.addEventListener("url", handleDeepLink)
        })

        if (!mounted.current) {
            mounted.current = true
            InteractionManager.runAfterInteractions(() =>
                Linking.getInitialURL().then(url => url && handleDeepLink({ url })),
            )
        }

        return () => {
            interaction?.cancel()
            Linking.removeAllListeners("url")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const contextValue = useMemo(() => ({ mutex: mutex.current }), [mutex])

    return <Context.Provider value={contextValue}>{children}</Context.Provider>
}

export const useDeepLinksSession = () => {
    const context = useContext(Context)

    if (!context) {
        throw new Error("useDeepLinksSession must be used within a DeepLinksProvider")
    }

    return context
}
