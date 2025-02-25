import { useFocusEffect, useNavigation } from "@react-navigation/native"
import React, { useCallback, useMemo } from "react"
import { FlatList, StyleSheet } from "react-native"
import {
    BaseSpacer,
    BaseView,
    ChangeAccountButtonPill,
    HeaderStyle,
    HeaderTitle,
    Layout,
    SelectAccountBottomSheet,
    SelectedNetworkViewer,
} from "~Components"
import { useBottomSheetModal, useSetSelectedAccount } from "~Hooks"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { Routes } from "~Navigation"
import { selectBalanceVisible, selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { ActivitySectionList, NoActivitiesButton, SkeletonActivityBox } from "./Components"
import { useAccountActivities } from "./Hooks"

const SKELETON_COUNT = 6

export const ActivityScreen = () => {
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

    const onStartTransactingPress = useCallback(() => nav.navigate(Routes.SELECT_TOKEN_SEND), [nav])

    const renderActivitiesList = useMemo(() => {
        return (
            <ActivitySectionList
                activities={activities}
                fetchActivities={fetchActivities}
                refreshActivities={refreshActivities}
                isFetching={isFetching}
                isRefreshing={isRefreshing}
            />
        )
    }, [activities, fetchActivities, isFetching, isRefreshing, refreshActivities])

    const renderSkeletonList = useMemo(() => {
        return (
            <FlatList
                data={[...Array(SKELETON_COUNT)]}
                keyExtractor={(_, index) => `skeleton-${index}`}
                contentContainerStyle={baseStyles.list}
                ListFooterComponent={<BaseSpacer height={20} />}
                renderItem={() => {
                    return <SkeletonActivityBox />
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={!isFetching || activities.length > 0}
            />
        )
    }, [activities.length, isFetching])

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

    useFocusEffect(
        useCallback(() => {
            if (activities.length === 0) {
                fetchActivities()
            }
        }, [activities.length, fetchActivities]),
    )

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
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    noActivitiesButton: {
        position: "absolute",
        bottom: "50%",
    },
})
