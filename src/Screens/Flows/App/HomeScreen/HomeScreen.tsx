import { useNavigation, useScrollToTop } from "@react-navigation/native"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AccountCard, EditTokensBar, Header, TokenList } from "./Components"
import { RefreshControl } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { FadeInRight } from "react-native-reanimated"
import {
    useAnalyticTracking,
    useBottomSheetModal,
    useCheckVersion,
    usePrefetchAllVns,
    useMemoizedAnimation,
    useSetSelectedAccount,
    useTheme,
} from "~Hooks"
import {
    BaseIcon,
    BaseSpacer,
    BaseView,
    FastActionsBar,
    Layout,
    QRCodeBottomSheet,
    SelectAccountBottomSheet,
} from "~Components"
import { AnalyticsEvent } from "~Constants"
import { AccountWithDevice, FastAction, WatchedAccount } from "~Model"
import { Routes } from "~Navigation"
import {
    selectBalanceVisible,
    selectCurrency,
    selectSelectedAccount,
    selectVisibleAccounts,
    setAppResetTimestamp,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useTokenBalances } from "./Hooks"

export const HomeScreen = () => {
    /* Pre Fetch all VNS names and addresses */
    usePrefetchAllVns()

    const nav = useNavigation()

    const selectedCurrency = useAppSelector(selectCurrency)
    const track = useAnalyticTracking()
    const { updateBalances, updateSuggested } = useTokenBalances()

    const { onSetSelectedAccount } = useSetSelectedAccount()

    /*
        This is used to reset the state of the app when the user presses the reload button
        on the error boundary. This is needed because the error boundary will not unmount
        and we're left with a wrong state.
    */
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(setAppResetTimestamp())
    }, [dispatch])

    const { LL } = useI18nContext()
    // Pull down to refresh
    const [refreshing, setRefreshing] = React.useState(false)

    const theme = useTheme()
    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { ref: QRCodeBottomSheetRef, onOpen: openQRCodeSheet } = useBottomSheetModal()

    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice | WatchedAccount) => {
        onSetSelectedAccount({ address: account.address })
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await updateBalances()
        await updateSuggested()

        setRefreshing(false)
    }, [updateBalances, updateSuggested])

    const { animateEntering } = useMemoizedAnimation({
        enteringAnimation: new FadeInRight(),
        enteringDelay: 50,
        enteringDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)
    const scrollViewRef = useRef(null)

    useScrollToTop(scrollViewRef)

    useCheckVersion()

    const Actions: FastAction[] = useMemo(() => {
        let actions: FastAction[] = []

        // account must not be observed to show the buy button
        if (!AccountUtils.isObservedAccount(selectedAccount)) {
            actions.push({
                name: LL.BTN_BUY(),
                action: () => {
                    nav.navigate(Routes.BUY_FLOW)
                    track(AnalyticsEvent.BUY_CRYPTO_BUTTON_CLICKED)
                },
                icon: <BaseIcon color={theme.colors.text} name="plus-circle-outline" size={21} />,
                testID: "buyButton",
            })
        }

        // If the account is observed, we don't want to show the send button as it's not possible to send from an observed account
        if (!AccountUtils.isObservedAccount(selectedAccount)) {
            actions.push({
                name: LL.BTN_SEND(),
                action: () => nav.navigate(Routes.SELECT_TOKEN_SEND),
                icon: <BaseIcon color={theme.colors.text} name="arrow-up" />,
                testID: "sendButton",
            })
        }

        if (!AccountUtils.isObservedAccount(selectedAccount)) {
            actions.push({
                name: LL.BTN_SWAP(),
                action: () => nav.navigate(Routes.SWAP),
                icon: <BaseIcon color={theme.colors.text} name="swap-horizontal" />,
                testID: "swapButton",
            })
        }

        return actions
    }, [LL, nav, selectedAccount, theme.colors.text, track])

    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            noMargin
            fixedBody={
                <NestableScrollContainer
                    ref={scrollViewRef}
                    testID="HomeScreen_ScrollView"
                    refreshControl={
                        <RefreshControl onRefresh={onRefresh} tintColor={theme.colors.border} refreshing={refreshing} />
                    }>
                    <BaseView>
                        <BaseView alignItems="center">
                            <BaseSpacer height={20} />
                            <AccountCard
                                balanceVisible={isBalanceVisible}
                                openSelectAccountBottomSheet={openSelectAccountBottomSheet}
                                account={selectedAccount}
                                selectedCurrency={selectedCurrency}
                                openQRCodeSheet={openQRCodeSheet}
                            />
                        </BaseView>
                        <BaseSpacer height={24} />

                        <FastActionsBar actions={Actions} />

                        <BaseSpacer height={24} />
                        <EditTokensBar isEdit={isEdit} setIsEdit={setIsEdit} />
                        <BaseSpacer height={24} />

                        <TokenList isEdit={isEdit} isBalanceVisible={isBalanceVisible} entering={animateEntering} />
                        <BaseSpacer height={24} />
                    </BaseView>

                    {/*Account Selection*/}
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottonSheet}
                        accounts={accounts}
                        setSelectedAccount={setSelectedAccount}
                        selectedAccount={selectedAccount}
                        isBalanceVisible={isBalanceVisible}
                        ref={selectAccountBottomSheetRef}
                    />

                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
                </NestableScrollContainer>
            }
        />
    )
}
