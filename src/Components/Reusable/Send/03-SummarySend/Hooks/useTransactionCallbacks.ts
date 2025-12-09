import { useNavigation } from "@react-navigation/native"
import { Transaction } from "@vechain/sdk-core"
import { useCallback, useMemo } from "react"
import { AnalyticsEvent, creteAnalyticsEvent, ERROR_EVENTS, VET, VTHO } from "~Constants"
import { useAnalyticTracking } from "~Hooks"
import { Token } from "~Model"
import { Routes } from "~Navigation"
import {
    addPendingTransferTransactionActivity,
    selectSelectedNetwork,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { error } from "~Utils"

export const useTransactionCallbacks = ({ token, onFailure }: { token: Token; onFailure: () => void }) => {
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const nav = useNavigation()
    const onFinish = useCallback(
        (success: boolean) => {
            const isNative =
                token.symbol.toUpperCase() === VET.symbol.toUpperCase() ||
                token.symbol.toUpperCase() === VTHO.symbol.toUpperCase()

            dispatch(setIsAppLoading(false))
            if (success) {
                track(AnalyticsEvent.WALLET_OPERATION, {
                    ...creteAnalyticsEvent({
                        medium: AnalyticsEvent.SEND,
                        signature: AnalyticsEvent.LOCAL,
                        network: network.name,
                        subject: isNative ? AnalyticsEvent.NATIVE_TOKEN : AnalyticsEvent.TOKEN,
                        context: AnalyticsEvent.SEND,
                    }),
                })
                nav.navigate(Routes.HOME)
                return
            }
            onFailure()
        },
        [token.symbol, dispatch, onFailure, track, network.name, nav],
    )

    const onTransactionSuccess = useCallback(
        async (transaction: Transaction) => {
            try {
                dispatch(addPendingTransferTransactionActivity(transaction))
                dispatch(setIsAppLoading(false))
                onFinish(true)
            } catch (e) {
                error(ERROR_EVENTS.SEND, e)
                onFinish(false)
            }
        },
        [dispatch, onFinish],
    )

    const onTransactionFailure = useCallback(() => {
        onFinish(false)
    }, [onFinish])

    return useMemo(() => ({ onTransactionSuccess, onTransactionFailure }), [onTransactionFailure, onTransactionSuccess])
}
