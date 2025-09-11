import React, { useCallback, useContext, useEffect, useRef, useState } from "react"
import { InteractionManager, Linking } from "react-native"
import { ConnectionLinkParams, ExternalAppRequestParams } from "./types"
import { useInteraction } from "../InteractionProvider"
// import { DeepLinkError } from "~Utils/ErrorMessageUtils"
// import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
// import { error } from "~Utils"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { selectExternalDappSessions } from "~Storage/Redux"
import { DAppUtils } from "~Utils"
import { useStore } from "../StoreProvider"
import { RootState } from "~Storage/Redux/Types"

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
    currentDappPublicKey: string | null
    setCurrentDappPublicKey: (publicKey: string | null) => void
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
    const [currentDappPublicKey, setCurrentDappPublicKey] = useState<string | null>(null)
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
    // const externalDappSessions = useAppSelector(selectExternalDappSessions)
    const { store } = useStore()

    const handleConnectionLink = useCallback(
        (params: ConnectionLinkParams) => {
            if (currentDappPublicKey) {
                DAppUtils.dispatchResourceNotAvailableError(params.redirect_url ?? "")
                return
            }
            setCurrentDappPublicKey(params.public_key)
            setConnectBsData({
                type: "external-app",
                appName: params.app_name,
                appUrl: params.app_url ?? "",
                publicKey: params.public_key,
                redirectUrl: params.redirect_url ?? "",
                network: params.network,
                iconUrl: params.app_icon,
            })
            connectBsRef.current?.present()
        },
        [setConnectBsData, connectBsRef, currentDappPublicKey],
    )

    const handleSignTransaction = useCallback(
        async (params: ExternalAppRequestParams) => {
            const externalDappSessions = selectExternalDappSessions(store?.getState() as RootState)
            try {
                const request = await DAppUtils.parseTransactionRequest(
                    params.request,
                    externalDappSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    if (currentDappPublicKey) {
                        DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                        return
                    }
                    // setCurrentDappPublicKey(request.publicKey)
                    setTransactionBsData(request)
                    transactionBsRef.current?.present()
                }
            } catch (e) {
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setTransactionBsData, transactionBsRef, currentDappPublicKey, store],
    )

    const handleSignTypedData = useCallback(
        async (params: ExternalAppRequestParams) => {
            const externalDappSessions = selectExternalDappSessions(store?.getState() as RootState)
            try {
                const request = await DAppUtils.parseTypedDataRequest(
                    params.request,
                    externalDappSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    if (currentDappPublicKey) {
                        DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                        return
                    }
                    // setCurrentDappPublicKey(request.publicKey)
                    setTypedDataBsData(request)
                    typedDataBsRef.current?.present()
                }
            } catch (e) {
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setTypedDataBsData, typedDataBsRef, currentDappPublicKey, store],
    )

    const handleSignCertificate = useCallback(
        async (params: ExternalAppRequestParams) => {
            const externalDappSessions = selectExternalDappSessions(store?.getState() as RootState)
            try {
                const request = await DAppUtils.parseCertificateRequest(
                    params.request,
                    externalDappSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    if (currentDappPublicKey) {
                        DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                        return
                    }
                    // setCurrentDappPublicKey(request.publicKey)
                    setCertificateBsData(request)
                    certificateBsRef.current?.present()
                }
            } catch (e) {
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setCertificateBsData, certificateBsRef, currentDappPublicKey, store],
    )

    const handleDisconnect = useCallback(
        async (params: ExternalAppRequestParams) => {
            const externalDappSessions = selectExternalDappSessions(store?.getState() as RootState)
            try {
                const request = await DAppUtils.parseDisconnectRequest(
                    params.request,
                    externalDappSessions,
                    params.redirect_url,
                )
                if (request && request.type === "external-app") {
                    if (currentDappPublicKey) {
                        DAppUtils.dispatchResourceNotAvailableError(params.redirect_url)
                        return
                    }
                    setCurrentDappPublicKey(request.publicKey)
                    setDisconnectBsData(request)
                    disconnectBsRef.current?.present()
                }
            } catch (e) {
                DAppUtils.dispatchInternalError(params.redirect_url)
            }
        },
        [setDisconnectBsData, disconnectBsRef, currentDappPublicKey, store],
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
                    handleSignTransaction(request as ExternalAppRequestParams)
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

    return <Context.Provider value={{ currentDappPublicKey, setCurrentDappPublicKey }}>{children}</Context.Provider>
}

export const useDeepLinksSession = () => {
    const context = useContext(Context)

    if (!context) {
        throw new Error("useDeepLinksSession must be used within a DeepLinksProvider")
    }

    return context
}
