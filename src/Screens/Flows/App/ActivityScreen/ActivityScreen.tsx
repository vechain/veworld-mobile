import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import React from "react"
import {
    BaseView,
    ChangeAccountButtonPill,
    HeaderStyleV2,
    HeaderTitle,
    Layout,
    SelectAccountBottomSheet,
} from "~Components"
import { useBottomSheetModal, useSetSelectedAccount } from "~Hooks"
import { AccountWithDevice, WatchedAccount } from "~Model"
import { Routes } from "~Navigation"
import { selectSelectedAccount, selectVisibleAccounts, useAppSelector } from "~Storage/Redux"
import { PlatformUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useResetActivityStack } from "./Hooks"
import { ActivityTabBar } from "./navigation"
import {
    ActivityAllScreen,
    ActivityB3trScreen,
    ActivityNftScreen,
    ActivityOtherScreen,
    ActivityStakingScreen,
    ActivitySwapScreen,
    ActivityTransferScreen,
} from "./screens"
import { ActivityDappsScreen } from "./screens/ActivityDappsScreen"
import { useDevice } from "~Components/Providers/DeviceProvider"

const Tab = createMaterialTopTabNavigator()

export const ActivityScreen = () => {
    const { LL } = useI18nContext()
    useResetActivityStack()

    const { onSetSelectedAccount } = useSetSelectedAccount()
    const { isLowEndDevice } = useDevice()

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
                <BaseView style={HeaderStyleV2}>
                    <HeaderTitle title={LL.BTN_HISTORY()} leftIconName="icon-history" />
                    <ChangeAccountButtonPill action={openSelectAccountBottomSheet} />
                </BaseView>
            }
            fixedBody={
                <>
                    <Tab.Navigator
                        tabBarPosition="top"
                        screenOptions={{
                            animationEnabled: !isLowEndDevice || PlatformUtils.isIOS(),
                            lazy: true,
                            swipeEnabled: true,
                            tabBarBounces: false,
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
                            name={Routes.ACTIVITY_STAKING}
                            component={ActivityStakingScreen}
                            options={{ title: LL.ACTIVITY_STAKING_LABEL() }}
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
                        <Tab.Screen
                            name={Routes.ACTIVITY_OTHER}
                            component={ActivityOtherScreen}
                            options={{ title: LL.ACTIVITY_OTHER_LABEL() }}
                        />
                    </Tab.Navigator>
                    <SelectAccountBottomSheet
                        closeBottomSheet={closeSelectAccountBottonSheet}
                        accounts={accounts}
                        setSelectedAccount={setSelectedAccount}
                        selectedAccount={selectedAccount}
                        ref={selectAccountBottomSheetRef}
                    />
                </>
            }
        />
    )
}
