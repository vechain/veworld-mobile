import { Mutex } from "async-mutex"
import React, { useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { InteractionManager, Linking } from "react-native"
import { showInfoToast } from "~Components/Base/BaseToast"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { useI18nContext } from "~i18n/i18n-react"
import { ConnectAppRequest, DecodedRequest } from "~Model"
import {
    changeSelectedNetwork,
    isValidSession,
    selectAccounts,
    selectExternalDappSessions,
    selectNetworks,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { AddressUtils, DAppUtils } from "~Utils"
import { DeepLinkError } from "~Utils/ErrorMessageUtils"
import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { useInteraction } from "../InteractionProvider"
import { useStore } from "../StoreProvider"
import { ConnectionLinkParams, ExternalAppRequestParams } from "./types"
import { useSetSelectedAccount } from "~Hooks/useSetSelectedAccount"

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
    const { store } = useStore()
    const networks = useAppSelector(selectNetworks)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const accounts = useAppSelector(selectAccounts)
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const { onSetSelectedAccount } = useSetSelectedAccount()

    const switchNetwork = useCallback(
        (request: Omit<DecodedRequest, "nonce" | "session" | "payload">) => {
            // Get the selected network from the store directly because rehydration is slow
            if (selectedNetwork.genesis.id === request.genesisId) {
                return
            }

            const network = networks.find(n => n.genesis.id === request.genesisId)
            if (!network) {
                throw new DeepLinkError(DeepLinkErrorCode.InvalidPayload)
            }

            showInfoToast({
                text1: LL.NOTIFICATION_WC_NETWORK_CHANGED({
                    network: network.name,
                }),
            })

            dispatch(changeSelectedNetwork(network))
        },
        [networks, dispatch, LL, selectedNetwork],
    )

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

            try {
                // Switch network if I'm not on the same network
                switchNetwork(decodedRequest)

                setConnectBsData(decodedRequest)
                connectBsRef.current?.present()
            } catch (e) {
                release?.()
                //TODO: check the error code and dispatch the correct error
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setConnectBsData, connectBsRef, switchNetwork],
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

            // Get the selected network from the store directly because rehydration is slow
            const externalDappSessions = selectExternalDappSessions(
                store?.getState() as RootState,
                decodedRequest.genesisId,
            )

            // Switch network if I'm not on the same network
            switchNetwork({ ...decodedRequest, redirectUrl: params.redirect_url })

            try {
                const request = await DAppUtils.parseTransactionRequest(
                    decodedRequest,
                    externalDappSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    const isValid = dispatch(
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
                //TODO: check the error code and dispatch the correct error
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setTransactionBsData, transactionBsRef, store, switchNetwork, switchAccount, dispatch],
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

            // Switch network if I'm not on the same network
            switchNetwork({ ...decodedRequest, redirectUrl: params.redirect_url })

            // Get the selected network from the store directly because rehydration is slow
            const externalDappSessions = selectExternalDappSessions(
                store?.getState() as RootState,
                decodedRequest.genesisId,
            )

            try {
                const request = await DAppUtils.parseTypedDataRequest(
                    decodedRequest,
                    externalDappSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    const isValid = dispatch(
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
                //TODO: check the error code and dispatch the correct error
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setTypedDataBsData, typedDataBsRef, store, switchNetwork, dispatch, switchAccount],
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

            // Get the selected network from the store directly because rehydration is slow
            const externalDappSessions = selectExternalDappSessions(
                store?.getState() as RootState,
                decodedRequest.genesisId,
            )

            // Switch network if I'm not on the same network
            switchNetwork({ ...decodedRequest, redirectUrl: params.redirect_url })

            try {
                const request = await DAppUtils.parseCertificateRequest(
                    decodedRequest,
                    externalDappSessions,
                    params.redirect_url,
                )

                if (request && request.type === "external-app") {
                    const isValid = dispatch(
                        isValidSession(request.genesisId, request.publicKey, request.session, switchAccount),
                    )

                    if (!isValid) {
                        DAppUtils.dispatchInternalError(params.redirect_url)
                        release?.()
                        return
                    }

                    setCertificateBsData({
                        ...request,
                        redirectUrl: params.redirect_url,
                    })
                    certificateBsRef.current?.present()
                }
            } catch (e) {
                release?.()
                //TODO: check the error code and dispatch the correct error
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setCertificateBsData, certificateBsRef, store, switchNetwork, switchAccount, dispatch],
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

            // Get the selected network from the store directly because rehydration is slow
            const externalDappSessions = selectExternalDappSessions(
                store?.getState() as RootState,
                decodedRequest.genesisId,
            )

            // Switch network if I'm not on the same network
            switchNetwork({ ...decodedRequest, redirectUrl: params.redirect_url })

            try {
                const request = await DAppUtils.parseDisconnectRequest(
                    decodedRequest,
                    externalDappSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    const isValid = dispatch(
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
                //TODO: check the error code and dispatch the correct error
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setDisconnectBsData, disconnectBsRef, store, switchNetwork, dispatch, switchAccount],
    )

    useEffect(() => {
        const handleDeepLink = ({ url }: { url: string }) => {
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
            interaction.cancel()
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
