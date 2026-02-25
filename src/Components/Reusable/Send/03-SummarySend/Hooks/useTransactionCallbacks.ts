import { useNavigation } from "@react-navigation/native"
import { Transaction } from "@vechain/sdk-core"
import { useCallback, useMemo } from "react"
import { AnalyticsEvent, ERROR_EVENTS, VET, VTHO } from "~Constants"
import { Token } from "~Model"
import { Routes } from "~Navigation"
import { addPendingTransferTransactionActivity, setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { setLastSentTokenAction } from "~Storage/Redux/Actions/WalletPreferences"
import { error } from "~Utils"

export const useTransactionCallbacks = ({ token, onFailure }: { token: Token; onFailure: () => void }) => {
    const dispatch = useAppDispatch()
    const nav = useNavigation()
    const onFinish = useCallback(
        (success: boolean) => {
            dispatch(setIsAppLoading(false))
            if (success) {
                nav.navigate(Routes.HOME)
                return
            }
            onFailure()
        },
        [dispatch, onFailure, nav],
    )

    const onTransactionSuccess = useCallback(
        async (transaction: Transaction) => {
            try {
                const isNative =
                    token.symbol.toUpperCase() === VET.symbol.toUpperCase() ||
                    token.symbol.toUpperCase() === VTHO.symbol.toUpperCase()
                dispatch(
                    addPendingTransferTransactionActivity(transaction, {
                        medium: AnalyticsEvent.SEND,
                        signature: AnalyticsEvent.LOCAL,
                        subject: isNative ? AnalyticsEvent.NATIVE_TOKEN : AnalyticsEvent.TOKEN,
                        context: AnalyticsEvent.SEND,
                    }),
                )
                dispatch(setLastSentTokenAction(transaction))
                dispatch(setIsAppLoading(false))
                onFinish(true)
            } catch (e) {
                error(ERROR_EVENTS.SEND, e)
                // The TX was succesful but we failed to add a pending activity card
                // so we navigate to the home screen anyway
                onFinish(true)
            }
        },
        [dispatch, onFinish, token.symbol],
    )

    const onTransactionFailure = useCallback(() => {
        onFinish(false)
    }, [onFinish])

    return useMemo(() => ({ onTransactionSuccess, onTransactionFailure }), [onTransactionFailure, onTransactionSuccess])
}
