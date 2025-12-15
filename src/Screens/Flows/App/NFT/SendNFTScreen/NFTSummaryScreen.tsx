import { StackActions, useNavigation } from "@react-navigation/native"
import { Transaction } from "@vechain/sdk-core"
import React, { useCallback, useMemo, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseView } from "~Components"
import { SendContent } from "~Components/Reusable/Send/Shared"
import { TransactionAlert } from "~Components/Reusable/Send/03-SummarySend/Components"
import { TransactionFeeCard } from "~Components/Reusable/Send/03-SummarySend/Components/TransactionFeeCard"
import { TransactionProvider } from "~Components/Reusable/Send/03-SummarySend/Components/TransactionProvider"
import { useNFTSendContext } from "~Components/Reusable/Send"
import { AnalyticsEvent, creteAnalyticsEvent } from "~Constants"
import { useAnalyticTracking, useThemedStyles, useTransactionScreen } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import {
    addPendingNFTtransferTransactionActivity,
    selectSelectedAccount,
    selectSelectedNetwork,
    setIsAppLoading,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { prepareNonFungibleClause } from "~Utils/TransactionUtils/TransactionUtils"
import { NFTReceiverCard } from "./Components"

export const NFTSummaryScreen = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)
    const { flowState } = useNFTSendContext()
    const [txError, setTxError] = useState(false)

    const nav = useNavigation()
    const track = useAnalyticTracking()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const { address } = flowState

    const onFinish = useCallback(
        (txId: string | undefined, success: boolean) => {
            if (success) {
                track(AnalyticsEvent.WALLET_OPERATION, {
                    ...creteAnalyticsEvent({
                        medium: AnalyticsEvent.SEND,
                        signature: AnalyticsEvent.LOCAL,
                        network: network.name,
                        subject: AnalyticsEvent.NFT,
                        context: AnalyticsEvent.SEND,
                    }),
                })
            }

            dispatch(setIsAppLoading(false))
            nav.dispatch(StackActions.popToTop())
        },
        [dispatch, nav, track, network.name],
    )

    const onTransactionSuccess = useCallback(
        (transaction: Transaction) => {
            dispatch(addPendingNFTtransferTransactionActivity(transaction))
            onFinish(transaction.id.toString(), true)
        },
        [onFinish, dispatch],
    )

    const onTransactionFailure = useCallback(() => {
        setTxError(true)
        onFinish(undefined, false)
    }, [onFinish])

    const clauses = useMemo(
        () =>
            prepareNonFungibleClause(
                selectedAccount.address,
                address!,
                flowState.contractAddress ?? "",
                flowState.tokenId ?? "",
            ),
        [selectedAccount.address, address, flowState.contractAddress, flowState.tokenId],
    )

    const {
        isEnoughGas,
        isDelegated,
        gasOptions,
        selectedFeeOption,
        selectedDelegationToken,
        fallbackToVTHO,
        isDisabledButtonState,
        onSubmit,
        ...transactionProps
    } = useTransactionScreen({
        clauses,
        onTransactionSuccess,
        onTransactionFailure,
        autoVTHOFallback: true,
        initialRoute: Routes.NFTS,
    })

    if (!address) {
        return <BaseView flex={1} />
    }

    return (
        <SendContent>
            <SendContent.Header />
            <SendContent.Container>
                <Animated.View style={styles.root}>
                    <NFTReceiverCard />
                    <TransactionProvider
                        fallbackToVTHO={fallbackToVTHO}
                        isEnoughGas={isEnoughGas}
                        isDelegated={isDelegated}
                        gasOptions={gasOptions}
                        selectedFeeOption={selectedFeeOption}
                        selectedDelegationToken={selectedDelegationToken}
                        isDisabledButtonState={isDisabledButtonState}
                        onSubmit={onSubmit}
                        {...transactionProps}>
                        <TransactionFeeCard />
                    </TransactionProvider>

                    <TransactionAlert hasGasAdjustment={false} txError={txError} />
                </Animated.View>
            </SendContent.Container>
            <SendContent.Footer>
                <SendContent.Footer.Back />
                <SendContent.Footer.Next action={onSubmit} disabled={isDisabledButtonState}>
                    {txError ? LL.COMMON_BTN_TRY_AGAIN() : LL.COMMON_BTN_CONFIRM()}
                </SendContent.Footer.Next>
            </SendContent.Footer>
        </SendContent>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: "column",
            gap: 16,
        },
    })
