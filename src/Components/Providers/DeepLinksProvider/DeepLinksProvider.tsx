import React, { useCallback, useContext, useEffect, useRef, useState } from "react"
import { InteractionManager, Linking } from "react-native"
import { ConnectionLinkParams, ExternalAppRequestParams } from "./types"
import { useInteraction } from "../InteractionProvider"
// import { DeepLinkError } from "~Utils/ErrorMessageUtils"
// import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
// import { error } from "~Utils"
import { useBrowserTab } from "~Hooks/useBrowserTab"
import { selectExternalDappSessions, useAppSelector } from "~Storage/Redux"
import { DAppUtils } from "~Utils"

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
    const externalDappSessions = useAppSelector(selectExternalDappSessions)

    const handleConnectionLink = useCallback(
        (params: ConnectionLinkParams) => {
            if (currentDappPublicKey) {
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
            if (currentDappPublicKey) {
                return
            }
            const request = await DAppUtils.parseTransactionRequest(params.request, externalDappSessions)
            if (request) {
                // setCurrentDappPublicKey(request.publicKey)
                setTransactionBsData(request)
                transactionBsRef.current?.present()
            }
        },
        [setTransactionBsData, transactionBsRef, currentDappPublicKey, externalDappSessions],
    )

    const handleSignTypedData = useCallback(
        async (params: ExternalAppRequestParams) => {
            if (currentDappPublicKey) {
                return
            }
            const request = await DAppUtils.parseTypedDataRequest(params.request, externalDappSessions)
            if (request) {
                // setCurrentDappPublicKey(request.publicKey)
                setTypedDataBsData(request)
                typedDataBsRef.current?.present()
            }
        },
        [setTypedDataBsData, typedDataBsRef, currentDappPublicKey, externalDappSessions],
    )

    const handleSignCertificate = useCallback(
        async (params: ExternalAppRequestParams) => {
            if (currentDappPublicKey) {
                return
            }
            const request = await DAppUtils.parseCertificateRequest(params.request, externalDappSessions)
            if (request) {
                // setCurrentDappPublicKey(request.publicKey)
                setCertificateBsData(request)
                certificateBsRef.current?.present()
            }
        },
        [setCertificateBsData, certificateBsRef, currentDappPublicKey, externalDappSessions],
    )

    const handleDisconnect = useCallback(
        async (params: ExternalAppRequestParams) => {
            if (currentDappPublicKey) {
                return
            }

            const request = await DAppUtils.parseDisconnectRequest(params.request, externalDappSessions)
            if (request) {
                setCurrentDappPublicKey(request.publicKey)
                setDisconnectBsData(request)
                disconnectBsRef.current?.present()
            }
        },
        [setDisconnectBsData, disconnectBsRef, externalDappSessions, currentDappPublicKey],
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

        Linking.addEventListener("url", handleDeepLink)

        if (!mounted.current) {
            mounted.current = true
            InteractionManager.runAfterInteractions(() =>
                Linking.getInitialURL().then(url => url && handleDeepLink({ url })),
            )
        }

        return () => {
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
