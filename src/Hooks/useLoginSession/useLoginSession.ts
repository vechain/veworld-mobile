import { useCallback, useMemo } from "react"
import { CertificateRequest, TransactionRequest, TypeDataRequest } from "~Model"
import {
    addSession,
    selectSelectedAccountOrNull,
    selectSelectedNetwork,
    selectSessions,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"

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
            if (session) return
            dispatch(
                addSession({
                    kind: "temporary",
                    address: selectedAccount!.address ?? "",
                    genesisId: selectedNetwork.genesis.id,
                    url: request.appUrl,
                    name: request.appName,
                }),
            )
        },
        [dispatch, getLoginSession, selectedAccount, selectedNetwork.genesis.id],
    )

    return useMemo(() => ({ getLoginSession, createSessionIfNotExists }), [createSessionIfNotExists, getLoginSession])
}
