import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { FlatList, RefreshControl, StyleSheet } from "react-native"
import { useBottomSheetModal, useSetSelectedAccount, useTheme } from "~Hooks"
import { SCREEN_WIDTH } from "~Constants"
import { FormattingUtils, TransactionUtils } from "~Utils"
import {
    BaseText,
    BaseView,
    ChangeAccountButtonPill,
    BaseSpacer,
    SelectAccountBottomSheet,
    Layout,
} from "~Components"
import {
    selectBalanceVisible,
    selectSelectedAccount,
    selectTokensWithInfo,
    selectVisibleAccounts,
    useAppSelector,
} from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { FlashList } from "@shopify/flash-list"
import {
    ConnectedAppActivityBox,
    DappTransactionActivityBox,
    FungibleTokenActivityBox,
    NoActivitiesButton,
    NonFungibleTokenActivityBox,
    SignedCertificateActivityBox,
    SkeletonActivityBox,
    SwapTransactionActivityBox,
} from "./Components"
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
} from "~Model"
import { Routes } from "~Navigation"
import { useAccountActivities } from "./Hooks"

// Number of Skeleton Activity boxes to show when fetching first page of activities
const SKELETON_COUNT = 12

export const HistoryScreen = () => {
    const { LL } = useI18nContext()

    const isBalanceVisible = useAppSelector(selectBalanceVisible)

    const { onSetSelectedAccount } = useSetSelectedAccount()

    const accounts = useAppSelector(selectVisibleAccounts)
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const setSelectedAccount = (account: AccountWithDevice) => {
        onSetSelectedAccount({ address: account.address })
    }

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()

    // Pull down to refresh
    const [refreshing, setRefreshing] = React.useState(false)

    const { fetchActivities, activities, hasFetched, page, setPage } =
        useAccountActivities()

    const nav = useNavigation()

    const theme = useTheme()

    const tokens = useAppSelector(selectTokensWithInfo)

    // To prevent fetching next page of activities on FlashList mount
    const [hasScrolled, setHasScrolled] = useState(false)

    const onStartTransactingPress = useCallback(
        () =>
            nav.navigate(Routes.SELECT_TOKEN_SEND, {
                initialRoute: Routes.HOME,
            }),
        [nav],
    )

    const onActivityPress = useCallback(
        (
            activity: Activity,
            token?: FungibleToken,
            isSwap?: boolean,
            decodedClauses?: TransactionOutcomes,
        ) => {
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
        setHasScrolled(true)
    }, [])

    const onEndReached = useCallback(async () => {
        if (hasScrolled) {
            await fetchActivities()
        }
    }, [fetchActivities, hasScrolled])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)

        setHasScrolled(false)
        setPage(0)

        setRefreshing(false)
    }, [setPage])

    const renderActivity = useCallback(
        (activity: Activity, index: number) => {
            const id = `activity-${index}`

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
                case ActivityType.DAPP_TRANSACTION:
                    const decodedClauses = TransactionUtils.interpretClauses(
                        activity.clauses ?? [],
                        tokens,
                    )

                    const isSwap =
                        TransactionUtils.isSwapTransaction(decodedClauses)

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
            }
        },
        [onActivityPress, tokens],
    )

    const renderActivitiesList = useMemo(() => {
        return (
            <>
                <BaseView flexDirection="row" style={baseStyles.list}>
                    <FlashList
                        data={activities}
                        keyExtractor={activity => activity.id}
                        ListFooterComponent={
                            hasFetched ? (
                                <BaseSpacer height={20} />
                            ) : (
                                <BaseView mx={20} pt={12}>
                                    <SkeletonActivityBox />
                                </BaseView>
                            )
                        }
                        renderItem={({ item: activity, index }) => {
                            return (
                                <BaseView mx={20}>
                                    {renderActivity(activity, index)}
                                </BaseView>
                            )
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
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={theme.colors.border}
                            />
                        }
                    />
                </BaseView>
            </>
        )
    }, [
        activities,
        hasFetched,
        onEndReached,
        onRefresh,
        onScroll,
        refreshing,
        renderActivity,
        theme.colors.border,
    ])

    const renderSkeletonList = useMemo(() => {
        return (
            <>
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
            </>
        )
    }, [])

    const renderNoActivitiesButton = useMemo(() => {
        return (
            <BaseView
                justifyContent="center"
                alignItems="center"
                w={100}
                style={baseStyles.noActivitiesButton}>
                <NoActivitiesButton onPress={onStartTransactingPress} />
            </BaseView>
        )
    }, [onStartTransactingPress])

    return (
        <Layout
            safeAreaTestID="History_Screen"
            fixedHeader={
                <>
                    <BaseView
                        flexDirection="row"
                        justifyContent="space-between">
                        <BaseText typographyFont="title">
                            {LL.BTN_HISTORY()}
                        </BaseText>

                        <ChangeAccountButtonPill
                            title={
                                selectedAccount.alias ??
                                LL.WALLET_LABEL_ACCOUNT()
                            }
                            text={FormattingUtils.humanAddress(
                                selectedAccount.address ?? "",
                                5,
                                4,
                            )}
                            action={openSelectAccountBottomSheet}
                        />
                    </BaseView>
                    <BaseSpacer height={16} />
                </>
            }
            bodyWithoutScrollView={
                <>
                    {/* Activities List */}
                    {!!activities.length &&
                        (page !== 0 || hasFetched) &&
                        renderActivitiesList}

                    {/* Fetching Activities shows skeleton */}
                    {!hasFetched && page === 0 && renderSkeletonList}

                    {/* No Activities */}
                    {!activities.length &&
                        hasFetched &&
                        renderNoActivitiesButton}

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
        marginBottom: 0,
    },
    noActivitiesButton: {
        position: "absolute",
        bottom: "50%",
    },
})
