import { useFocusEffect, useNavigation, useScrollToTop } from "@react-navigation/native"
import { useQueryClient } from "@tanstack/react-query"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import { NestableScrollContainer } from "react-native-draggable-flatlist"
import { RefreshControl } from "react-native-gesture-handler"
import { FadeInRight } from "react-native-reanimated"
import {
    BaseIcon,
    BaseSpacer,
    BaseView,
    DisabledBuySwapIosBottomSheet,
    FastActionsBar,
    Layout,
    QRCodeBottomSheet,
    SelectAccountBottomSheet,
    useFeatureFlags,
    VersionChangelogBottomSheet,
    VersionUpdateAvailableBottomSheet,
} from "~Components"
import { AnalyticsEvent } from "~Constants"
import {
    getVeDelegateBalanceQueryKey,
    useAnalyticTracking,
    useBottomSheetModal,
    useMemoizedAnimation,
    usePrefetchAllVns,
    useSetSelectedAccount,
    useTheme,
} from "~Hooks"
import { AccountWithDevice, FastAction, WatchedAccount } from "~Model"
import { Routes } from "~Navigation"
import {
    selectBalanceVisible,
    selectCurrency,
    selectSelectedAccount,
    selectSelectedNetwork,
    selectVisibleAccounts,
    setAppResetTimestamp,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { AccountUtils, AddressUtils, PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import {
    AccountCard,
    ClaimUsernameBanner,
    DeviceBackupBottomSheet,
    DeviceJailBrokenAlert,
    DeviceJailBrokenWarningModal,
    EditTokensBar,
    Header,
    TokenList,
} from "./Components"
import { BannersCarousel } from "./Components/BannerCarousel"
import { EnableNotificationsBottomSheet } from "./Components/EnableNotificationsBottomSheet"
import { StakingSection } from "./Components/Staking"
import { useTokenBalances } from "./Hooks"

export const HomeScreen = () => {
    /* Pre Fetch all VNS names and addresses */
    usePrefetchAllVns()

    const nav = useNavigation()
    const queryClient = useQueryClient()

    const selectedCurrency = useAppSelector(selectCurrency)
    const track = useAnalyticTracking()
    const { updateBalances, updateSuggested } = useTokenBalances()
    const selectedNetwork = useAppSelector(selectSelectedNetwork)

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

    const {
        ref: blockedFeaturesIOSBottomSheetRef,
        onOpen: openBlockedFeaturesIOSBottomSheet,
        onClose: closeBlockedFeaturesIOSBottomSheet,
    } = useBottomSheetModal()

    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const setSelectedAccount = (account: AccountWithDevice | WatchedAccount) => {
        onSetSelectedAccount({ address: account.address })
    }

    const invalidateStargateQueries = useCallback(async () => {
        await queryClient.invalidateQueries({
            predicate(query) {
                if (!["userStargateNodes", "userStargateNfts"].includes(query.queryKey[0] as string)) return false
                if (query.queryKey.length < 3) return false
                if (query.queryKey[1] !== selectedNetwork.type) return false
                if (!AddressUtils.compareAddresses(query.queryKey[2] as string | undefined, selectedAccount.address))
                    return false
                return true
            },
        })
    }, [queryClient, selectedAccount.address, selectedNetwork.type])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        await Promise.all([updateBalances(true), updateSuggested(), invalidateStargateQueries()])

        setRefreshing(false)
    }, [invalidateStargateQueries, updateBalances, updateSuggested])

    const { animateEntering } = useMemoizedAnimation({
        enteringAnimation: new FadeInRight(),
        enteringDelay: 50,
        enteringDuration: 200,
    })

    const [isEdit, setIsEdit] = useState(false)
    const scrollViewRef = useRef(null)

    useScrollToTop(scrollViewRef)

    const featureFlags = useFeatureFlags()

    const Actions: FastAction[] = useMemo(() => {
        // If the account is observed, we don't want to show the send button as it's not possible to send from an observed account
        if (AccountUtils.isObservedAccount(selectedAccount)) return []

        const sharedActions: FastAction[] = [
            {
                name: LL.BTN_SEND(),
                action: () => nav.navigate(Routes.SELECT_TOKEN_SEND),
                icon: <BaseIcon color={theme.colors.text} name="icon-arrow-up" size={20} />,
                testID: "sendButton",
            },
            {
                name: LL.BTN_SWAP(),
                action: () => {
                    if (PlatformUtils.isIOS()) {
                        openBlockedFeaturesIOSBottomSheet()
                        return
                    }
                    nav.navigate(Routes.SWAP)
                },
                icon: <BaseIcon color={theme.colors.text} name="icon-arrow-left-right" size={20} />,
                testID: "swapButton",
            },
            {
                name: LL.BTN_BUY(),
                action: () => {
                    if (PlatformUtils.isIOS()) {
                        openBlockedFeaturesIOSBottomSheet()
                        return
                    }
                    nav.navigate(Routes.BUY_FLOW)
                    track(AnalyticsEvent.BUY_CRYPTO_BUTTON_CLICKED)
                },
                icon: <BaseIcon color={theme.colors.text} name="icon-plus-circle" size={20} />,
                testID: "buyButton",
            },
        ]

        const sellAction = {
            name: LL.BTN_SELL(),
            action: () => {
                nav.navigate(Routes.SELL_FLOW)
                track(AnalyticsEvent.SELL_CRYPTO_BUTTON_CLICKED)
            },
            icon: <BaseIcon color={theme.colors.text} name="icon-minus-circle" size={20} />,
            testID: "sellButton",
        }

        if (PlatformUtils.isAndroid() && featureFlags.paymentProvidersFeature.coinify.android)
            return [...sharedActions, sellAction]
        if (PlatformUtils.isIOS() && featureFlags.paymentProvidersFeature.coinify.iOS)
            return [...sharedActions, sellAction]

        return sharedActions
    }, [
        LL,
        featureFlags.paymentProvidersFeature.coinify.android,
        featureFlags.paymentProvidersFeature.coinify.iOS,
        nav,
        openBlockedFeaturesIOSBottomSheet,
        selectedAccount,
        theme.colors.text,
        track,
    ])

    useFocusEffect(
        useCallback(() => {
            // Invalidate the veDelegateBalance query to solve cache issues
            queryClient.refetchQueries({
                queryKey: getVeDelegateBalanceQueryKey(selectedAccount.address),
                exact: true,
                stale: true,
            })
        }, [queryClient, selectedAccount.address]),
    )

    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            fixedBody={
                <NestableScrollContainer
                    ref={scrollViewRef}
                    testID="HomeScreen_ScrollView"
                    refreshControl={
                        <RefreshControl onRefresh={onRefresh} tintColor={theme.colors.border} refreshing={refreshing} />
                    }>
                    <BaseView style={styles.container}>
                        <BaseView alignItems="center">
                            <DeviceJailBrokenAlert />
                            <ClaimUsernameBanner />
                            <AccountCard
                                balanceVisible={isBalanceVisible}
                                openSelectAccountBottomSheet={openSelectAccountBottomSheet}
                                account={selectedAccount}
                                selectedCurrency={selectedCurrency}
                                openQRCodeSheet={openQRCodeSheet}
                            />
                        </BaseView>
                        <BaseSpacer height={16} />
                        <FastActionsBar actions={Actions} />
                        <BaseSpacer height={16} />
                    </BaseView>

                    <BannersCarousel location="home_screen" />

                    <BaseView style={styles.container} gap={24}>
                        <StakingSection />
                        <BaseView>
                            <EditTokensBar isEdit={isEdit} setIsEdit={setIsEdit} />
                            <BaseSpacer height={8} />
                            <TokenList isEdit={isEdit} isBalanceVisible={isBalanceVisible} entering={animateEntering} />
                            <BaseSpacer height={24} />
                        </BaseView>
                    </BaseView>

                    {/*Account Selection*/}
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottonSheet}
                        accounts={accounts}
                        setSelectedAccount={setSelectedAccount}
                        selectedAccount={selectedAccount}
                        ref={selectAccountBottomSheetRef}
                    />

                    <QRCodeBottomSheet ref={QRCodeBottomSheetRef} />
                    <DeviceBackupBottomSheet />
                    <DeviceJailBrokenWarningModal />
                    <EnableNotificationsBottomSheet />
                    <VersionUpdateAvailableBottomSheet />
                    <VersionChangelogBottomSheet />
                    <DisabledBuySwapIosBottomSheet
                        ref={blockedFeaturesIOSBottomSheetRef}
                        onConfirm={closeBlockedFeaturesIOSBottomSheet}
                    />
                </NestableScrollContainer>
            }
        />
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
})
