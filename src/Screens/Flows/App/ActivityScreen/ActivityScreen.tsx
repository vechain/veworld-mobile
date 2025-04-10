import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import React from "react"
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
import { selectBalanceVisible, selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { useResetActivityStack } from "./Hooks"
import { ActivityTabBar } from "./navigation"
import {
    ActivityAllScreen,
    ActivityB3trScreen,
    ActivityNftScreen,
    ActivitySwapScreen,
    ActivityTransferScreen,
} from "./screens"
import { Routes } from "~Navigation"
import { ActivityDappsScreen } from "./screens/ActivityDappsScreen"

const Tab = createMaterialTopTabNavigator()

export const ActivityScreen = () => {
    const { LL } = useI18nContext()
    useResetActivityStack()

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
                    <Tab.Navigator
                        screenOptions={{
                            animationEnabled: false,
                            lazy: true,
                            swipeEnabled: false,
                        }}
                        tabBar={ActivityTabBar}>
                        <Tab.Screen
                            name={Routes.ACTIVITY_ALL}
                            component={ActivityAllScreen}
                            options={{ title: LL.ACTIVITY_ALL_LABEL() }}
                        />
                        <Tab.Screen
                            name={Routes.ACTIVITY_B3TR}
                            component={ActivityB3trScreen}
                            options={{ title: LL.ACTIVITY_B3TR_LABEL() }}
                        />
                        <Tab.Screen
                            name={Routes.ACTIVITY_TRANSFER}
                            component={ActivityTransferScreen}
                            options={{ title: LL.ACTIVITY_TRANSFER_LABEL() }}
                        />
                        <Tab.Screen
                            name={Routes.ACTIVITY_SWAP}
                            component={ActivitySwapScreen}
                            options={{ title: LL.ACTIVITY_SWAP_LABEL() }}
                        />
                        <Tab.Screen
                            name={Routes.ACTIVITY_NFT}
                            component={ActivityNftScreen}
                            options={{ title: LL.ACTIVITY_NFT_LABEL() }}
                        />
                        <Tab.Screen
                            name={Routes.ACTIVITY_DAPPS}
                            component={ActivityDappsScreen}
                            options={{ title: LL.ACTIVITY_DAPPS_LABEL() }}
                        />
                    </Tab.Navigator>
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
