import { useNavigation } from "@react-navigation/native"
import { FlashList } from "@shopify/flash-list"
import React, { useCallback, useMemo, useRef } from "react"
import { FlatList, RefreshControl, StyleSheet } from "react-native"
import {
    BaseSpacer,
    BaseView,
    ChangeAccountButtonPill,
    HeaderTitle,
    Layout,
    SelectAccountBottomSheet,
    SelectedNetworkViewer,
} from "~Components"
import { HeaderStyle, SCREEN_WIDTH } from "~Constants"
import { useBottomSheetModal, useSetSelectedAccount, useTheme } from "~Hooks"
import {
    AccountWithDevice,
    Activity,
    ActivityType,
    ConnectedAppActivity,
    DappTxActivity,
    FungibleToken,
    FungibleTokenActivity,
    NonFungibleTokenActivity,
    SignCertActivity,
    TransactionOutcomes,
    TypedDataActivity,
    WatchedAccount,
} from "~Model"
import { Routes } from "~Navigation"
import {
    selectBalanceVisible,
    selectOfficialTokens,
    selectSelectedAccount,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { TransactionUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import {
    ConnectedAppActivityBox,
    DappTransactionActivityBox,
    FungibleTokenActivityBox,
    NoActivitiesButton,
    NonFungibleTokenActivityBox,
    SignedCertificateActivityBox,
    SkeletonActivityBox,
    SwapTransactionActivityBox,
    TypedDataActivityBox,
} from "./Components"
import { useAccountActivities } from "./Hooks"

const SKELETON_COUNT = 12

export const HistoryScreen = () => {
    const { LL } = useI18nContext()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice | WatchedAccount) => {
        onSetSelectedAccount({ address: account.address })
    }

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    const { activities, fetchActivities, isFetching, refreshActivities, isRefreshing } = useAccountActivities()

    const nav = useNavigation()
    const theme = useTheme()
    const tokens = useAppSelector(selectOfficialTokens)
    const hasScrolled = useRef(false)

    const onStartTransactingPress = useCallback(() => nav.navigate(Routes.SELECT_TOKEN_SEND), [nav])

    const onActivityPress = useCallback(
        (activity: Activity, token?: FungibleToken, isSwap?: boolean, decodedClauses?: TransactionOutcomes) => {
            nav.navigate(Routes.ACTIVITY_DETAILS, {
                activity,
                token,
                isSwap,
                decodedClauses,
            })
        },
        [nav],
    )

    const onScroll = useCallback(() => {
        hasScrolled.current = true
    }, [])

    const onEndReached = useCallback(() => {
        if (hasScrolled.current) {
            fetchActivities()
        }
    }, [fetchActivities])

    const onRefresh = useCallback(async () => {
        await refreshActivities()
        hasScrolled.current = false
    }, [refreshActivities])

    const renderActivity = useCallback(
        (activity: Activity) => {
            const id = activity.id

            switch (activity.type) {
                case ActivityType.FUNGIBLE_TOKEN:
                case ActivityType.VET_TRANSFER:
                    return (
                        <FungibleTokenActivityBox
                            key={id}
                            activity={activity as FungibleTokenActivity}
                            onPress={onActivityPress}
                        />
                    )
                case ActivityType.NFT_TRANSFER:
                    return (
                        <NonFungibleTokenActivityBox
                            key={id}
                            activity={activity as NonFungibleTokenActivity}
                            onPress={onActivityPress}
                        />
                    )
                case ActivityType.DAPP_TRANSACTION: {
                    const decodedClauses = TransactionUtils.interpretClauses(activity.clauses ?? [], tokens)

                    const isSwap = TransactionUtils.isSwapTransaction(decodedClauses)

                    return isSwap ? (
                        <SwapTransactionActivityBox
                            key={id}
                            activity={activity as DappTxActivity}
                            decodedClauses={decodedClauses}
                            onPress={onActivityPress}
                        />
                    ) : (
                        <DappTransactionActivityBox
                            key={id}
                            activity={activity as DappTxActivity}
                            onPress={onActivityPress}
                        />
                    )
                }
                case ActivityType.SIGN_CERT:
                    return (
                        <SignedCertificateActivityBox
                            key={id}
                            activity={activity as SignCertActivity}
                            onPress={onActivityPress}
                        />
                    )
                case ActivityType.CONNECTED_APP_TRANSACTION:
                    return (
                        <ConnectedAppActivityBox
                            key={id}
                            activity={activity as ConnectedAppActivity}
                            onPress={onActivityPress}
                        />
                    )
                case ActivityType.SIGN_TYPED_DATA:
                    return (
                        <TypedDataActivityBox
                            key={id}
                            activity={activity as TypedDataActivity}
                            onPress={onActivityPress}
                        />
                    )
            }
        },
        [onActivityPress, tokens],
    )

    const renderActivitiesList = useMemo(() => {
        return (
            <BaseView flexDirection="row" style={baseStyles.list}>
                <FlashList
                    data={activities}
                    keyExtractor={activity => activity.id}
                    ListFooterComponent={
                        false ? (
                            <BaseSpacer height={20} />
                        ) : (
                            <BaseView mx={20}>
                                <SkeletonActivityBox />
                            </BaseView>
                        )
                    }
                    renderItem={({ item: activity }) => {
                        return <BaseView mx={20}>{renderActivity(activity)}</BaseView>
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={80}
                    estimatedListSize={{
                        height: 80 * activities.length,
                        width: SCREEN_WIDTH,
                    }}
                    onScroll={onScroll}
                    onEndReachedThreshold={0.5}
                    onEndReached={onEndReached}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.border}
                        />
                    }
                />
            </BaseView>
        )
    }, [activities, isRefreshing, onEndReached, onRefresh, onScroll, renderActivity, theme.colors.border])

    const renderSkeletonList = useMemo(() => {
        return (
            <BaseView flexDirection="row" style={baseStyles.list}>
                <FlatList
                    data={[...Array(SKELETON_COUNT)]}
                    keyExtractor={(_, index) => `skeleton-${index}`}
                    ListFooterComponent={<BaseSpacer height={20} />}
                    renderItem={() => {
                        return (
                            <BaseView mx={20}>
                                <SkeletonActivityBox />
                            </BaseView>
                        )
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                />
            </BaseView>
        )
    }, [])

    const renderNoActivitiesButton = useMemo(() => {
        return (
            <BaseView justifyContent="center" alignItems="center" w={100} style={baseStyles.noActivitiesButton}>
                <NoActivitiesButton onPress={onStartTransactingPress} />
            </BaseView>
        )
    }, [onStartTransactingPress])

    const renderList = useCallback(() => {
        if (activities.length > 0) {
            return renderActivitiesList
        } else if (isFetching && activities.length === 0) {
            return renderSkeletonList
        } else {
            return renderNoActivitiesButton
        }
    }, [activities.length, isFetching, renderActivitiesList, renderNoActivitiesButton, renderSkeletonList])

    return (
        <Layout
            safeAreaTestID="History_Screen"
            noBackButton
            fixedHeader={
                <BaseView style={HeaderStyle}>
                    <HeaderTitle title={LL.BTN_HISTORY()} />
                    <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                        <SelectedNetworkViewer />
                        <BaseSpacer width={8} />
                        <ChangeAccountButtonPill action={openSelectAccountBottomSheet} />
                    </BaseView>
                </BaseView>
            }
            fixedBody={
                <>
                    {renderList()}
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottonSheet}
                        accounts={accounts}
                        setSelectedAccount={setSelectedAccount}
                        selectedAccount={selectedAccount}
                        isBalanceVisible={isBalanceVisible}
                        ref={selectAccountBottomSheetRef}
                    />
                </>
            }
        />
    )
}

const baseStyles = StyleSheet.create({
    backIcon: {
        marginHorizontal: 8,
        alignSelf: "flex-start",
    },
    list: {
        top: 0,
        flex: 1,
    },
    noActivitiesButton: {
        position: "absolute",
        bottom: "50%",
    },
})
