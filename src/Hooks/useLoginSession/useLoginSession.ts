import { useCallback, useMemo } from "react"
import { CertificateRequest, TransactionRequest, TypeDataRequest } from "~Model"
import { addConnectedDiscoveryApp, addSession, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { selectSelectedNetwork, selectSelectedAccountOrNull, selectSessions } from "~Storage/Redux/Selectors"

export const useLoginSession = () => {
    const loginSessions = useAppSelector(selectSessions)
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const selectedNetwork = useAppSelector(selectSelectedNetwork)
    const dispatch = useAppDispatch()
    const getLoginSession = useCallback(
        (url: string, genesisId?: string) => {
            const session = loginSessions[new URL(url).origin]
            if (!genesisId) return session
            if (session?.genesisId?.toLowerCase() === genesisId.toLowerCase()) return session
            return undefined
        },
        [loginSessions],
    )

    const createSessionIfNotExists = useCallback(
        (request: TransactionRequest | TypeDataRequest | CertificateRequest) => {
            if (request.type !== "in-app") return
            const session = getLoginSession(request.appUrl, selectedNetwork.genesis.id)
            if (session && !session.replaceable) return
            dispatch(
                addSession({
                    kind: "temporary",
                    address: selectedAccount!.address ?? "",
                    genesisId: selectedNetwork.genesis.id,
                    url: request.appUrl,
                    name: request.appName,
                    replaceable: true,
                }),
            )
            dispatch(
                addConnectedDiscoveryApp({
                    connectedTime: Date.now(),
                    href: new URL(request.appUrl).hostname,
                    name: request.appName,
                }),
            )
        },
        [dispatch, getLoginSession, selectedAccount, selectedNetwork.genesis.id],
    )

    return useMemo(() => ({ getLoginSession, createSessionIfNotExists }), [createSessionIfNotExists, getLoginSession])
}
