import { useCallback, useEffect, useState } from "react"
import { debug, error, WalletConnectUtils } from "~Utils"
import { getSdkError } from "@walletconnect/utils"
import { ActiveSessions, showInfoToast, showSuccessToast } from "~Components"
import { useI18nContext } from "~i18n"
import { SessionTypes, SignClientTypes } from "@walletconnect/types"
import { cleanContexts, deleteContext, useAppDispatch } from "~Storage/Redux"

type SessionDelete = Omit<SignClientTypes.BaseEventArgs, "params">
type SessionDeleteState = Record<string, SessionDelete>

export const useWcSessions = () => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()

    const [sessionDeletes, setSessionDeletes] = useState<SessionDeleteState>({})
    const [activeSessions, setActiveSessions] = useState<ActiveSessions>({})

    /**
     * DO NOT add any dependencies to this callback, otherwise the listener will be added multiple times
     */
    const addSessionDisconnect = useCallback((sessionDelete: SessionDelete) => {
        setSessionDeletes(prev => ({
            ...prev,
            [sessionDelete.topic]: sessionDelete,
        }))
    }, [])

    const disconnectSession = useCallback(
        async (topic: string, fromRemote = false) => {
            debug("Disconnecting session", topic, fromRemote)

            setActiveSessions(prev => {
                const _prev = { ...prev }
                delete _prev[topic]
                return _prev
            })

            const web3Wallet = await WalletConnectUtils.getWeb3Wallet()

            try {
                await web3Wallet.disconnectSession({
                    topic,
                    reason: getSdkError("USER_DISCONNECTED"),
                })
            } catch (err: unknown) {
                error("WalletConnectProvider:disconnect", err)
            } finally {
                dispatch(deleteContext({ topic }))
                if (fromRemote) {
                    showInfoToast({
                        text1: LL.NOTIFICATION_wallet_connect_disconnected_from_remote(),
                    })
                } else {
                    showSuccessToast({
                        text1: LL.NOTIFICATION_wallet_connect_disconnected_success(),
                    })
                }
            }
        },
        [LL, dispatch],
    )

    const addSession = useCallback((session: SessionTypes.Struct) => {
        setActiveSessions(prev => ({
            ...prev,
            [session.topic]: session,
        }))
    }, [])

    useEffect(() => {
        Object.values(sessionDeletes).forEach(sessionDelete => {
            disconnectSession(sessionDelete.topic, true).catch(err => {
                error("WalletConnectProvider:disconnect", err)
            })
        })
    }, [disconnectSession, sessionDeletes])

    useEffect(() => {
        WalletConnectUtils.getWeb3Wallet().then(async web3Wallet => {
            const _activeSessions = web3Wallet.getActiveSessions()

            setActiveSessions(_activeSessions)

            dispatch(cleanContexts({ activeTopics: Object.keys(_activeSessions) }))
        })
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        debug(
            "activeSessions",
            Object.values(activeSessions).map(s => s.topic),
        )
    }, [activeSessions])

    return {
        addSession,
        disconnectSession,
        addSessionDisconnect,
        activeSessions,
    }
}
