import { useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo, useState } from "react"
import { FlatList, RefreshControl, StyleSheet } from "react-native"
import { SCREEN_WIDTH, useTheme } from "~Common"
import { FormattingUtils, PlatformUtils } from "~Utils"
import {
    BaseText,
    BaseSafeArea,
    BaseView,
    ChangeAccountButtonPill,
    BaseIcon,
    BaseSpacer,
} from "~Components"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { FlashList } from "@shopify/flash-list"
import {
    DappTransactionActivityBox,
    FungibleTokenActivityBox,
    NoActivitiesButton,
    SignedCertificateActivityBox,
    SkeletonActivityBox,
} from "./Components"
import {
    Activity,
    ActivityType,
    ConnectedAppTxActivity,
    FungibleToken,
    FungibleTokenActivity,
    SignCertActivity,
} from "~Model"
import { Routes } from "~Navigation"
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useAccountActivities } from "./Hooks"

// Number of Skeleton Activity boxes to show when fetching first page of activities
const SKELETON_COUNT = 12

export const HistoryScreen = () => {
    const { LL } = useI18nContext()

    const selectedAccount = useAppSelector(selectSelectedAccount)

    // Pull down to refresh
    const [refreshing, setRefreshing] = React.useState(false)

    const { fetchActivities, activities, hasFetched, page, setPage } =
        useAccountActivities(selectedAccount.address)

    const nav = useNavigation()

    const theme = useTheme()

    const insets = useSafeAreaInsets()

    const tabBarHeight = useBottomTabBarHeight()

    const styles = baseStyles(insets, tabBarHeight)

    // To prevent fetching next page of activities on FlashList mount
    const [hasScrolled, setHasScrolled] = useState(false)

    // TODO, when account changes set page of activity fetching back to 0 and refetch otherwise we would be at the page of activities of the previous account
    const onChangeAccountPress = () => {}

    const goBack = useCallback(() => nav.goBack(), [nav])

    const onStartTransactingPress = useCallback(
        () =>
            nav.navigate(Routes.SELECT_TOKEN_SEND, {
                initialRoute: Routes.HOME,
            }),
        [nav],
    )

    const onActivityPress = useCallback(
        (activity: Activity, token?: FungibleToken) => {
            nav.navigate(Routes.ACTIVITY_DETAILS, { activity, token })
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
                case ActivityType.CONNECTED_APP_TRANSACTION:
                    return (
                        <DappTransactionActivityBox
                            key={id}
                            activity={activity as ConnectedAppTxActivity}
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
            }
        },
        [onActivityPress],
    )

    const renderActivitiesList = useMemo(() => {
        return (
            <>
                <BaseSpacer height={30} />
                <BaseView flexDirection="row" style={styles.list}>
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
                            width: SCREEN_WIDTH - 40,
                        }}
                        onScroll={onScroll}
                        onEndReachedThreshold={1}
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
        styles.list,
        theme.colors.border,
    ])

    const renderSkeletonList = useMemo(() => {
        return (
            <>
                <BaseSpacer height={40} />
                <BaseView flexDirection="row" style={styles.list}>
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
    }, [styles.list])

    const renderNoActivitiesButton = useMemo(() => {
        return (
            <BaseView
                justifyContent="center"
                alignItems="center"
                w={100}
                style={styles.noActivitiesButton}>
                <NoActivitiesButton onPress={onStartTransactingPress} />
            </BaseView>
        )
    }, [onStartTransactingPress, styles.noActivitiesButton])

    return (
        <BaseSafeArea grow={1} testID="History_Screen">
            <BaseIcon
                style={styles.backIcon}
                size={36}
                name="chevron-left"
                color={theme.colors.text}
                action={goBack}
            />

            <BaseSpacer height={12} />
            <BaseView
                flexDirection="row"
                mx={20}
                justifyContent="space-between">
                <BaseText typographyFont="title">{LL.BTN_HISTORY()}</BaseText>

                <ChangeAccountButtonPill
                    title={selectedAccount.alias ?? LL.WALLET_LABEL_ACCOUNT()}
                    text={FormattingUtils.humanAddress(
                        selectedAccount.address ?? "",
                        5,
                        4,
                    )}
                    action={onChangeAccountPress}
                />
            </BaseView>

            {/* Activities List */}
            {!!activities.length &&
                (page !== 0 || hasFetched) &&
                renderActivitiesList}

            {/* Fetching Activities shows skeleton */}
            {!hasFetched && page === 0 && renderSkeletonList}

            {/* No Activities */}
            {!activities.length && hasFetched && renderNoActivitiesButton}
        </BaseSafeArea>
    )
}

const baseStyles = (insets: EdgeInsets, tabBarHeight: number) =>
    StyleSheet.create({
        backIcon: {
            marginHorizontal: 8,
            alignSelf: "flex-start",
        },
        list: {
            top: 0,
            flex: 1,
            marginBottom: PlatformUtils.isIOS()
                ? tabBarHeight - insets.bottom
                : 0,
        },
        noActivitiesButton: {
            position: "absolute",
            bottom: "50%",
        },
    })
