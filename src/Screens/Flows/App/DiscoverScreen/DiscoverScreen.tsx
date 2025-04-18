import React from "react"
import { Layout } from "~Components"
import { Routes } from "~Navigation"
import { Header } from "./Components"

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { useI18nContext } from "~i18n"
import { DiscoverTabBar } from "./Components/DiscoverTabBar"
import { DappsScreen } from "./DappsScreen"
import { VeBetterScreen } from "./VeBetterScreen"

const Tab = createMaterialTopTabNavigator()

export const DiscoverScreen: React.FC = () => {
    const { LL } = useI18nContext()
    return (
        <Layout
            fixedHeader={<Header />}
            noBackButton
            hasSafeArea
            fixedBody={
                <Tab.Navigator tabBar={DiscoverTabBar}>
                    <Tab.Screen
                        name={Routes.DISCOVER_DAPPS_SECTION}
                        component={DappsScreen}
                        options={{ title: LL.DISCOVER_DAPPS_SECTION() }}
                    />
                    <Tab.Screen
                        name={Routes.DISCOVER_VEBETTER_SECTION}
                        component={VeBetterScreen}
                        options={{ title: LL.DISCOVER_VEBETTER_SECTION() }}
                    />
                </Tab.Navigator>
            }
        />
    )
}
