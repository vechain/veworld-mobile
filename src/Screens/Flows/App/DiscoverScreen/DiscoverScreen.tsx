import React from "react"
import {
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
    ChangeAccountButtonPill,
} from "~Components"
import { useI18nContext } from "~i18n"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { Dimensions } from "react-native"
import { TopTabbar } from "./TopTabbar"
import { FormattingUtils, PlatformUtils } from "~Utils"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { DiscoverAssets } from "./DiscoverAssets"
import { DiscoverDApps } from "./DiscoverDApps"

const Tab = createMaterialTopTabNavigator()

export const DiscoverScreen = () => {
    const { LL } = useI18nContext()
    const selectedAccount = useAppSelector(selectSelectedAccount)

    const onChangeAccountPress = () => {}

    return (
        <BaseSafeArea grow={1}>
            <BaseView flexDirection="row" mx={20}>
                <BaseText typographyFont="largeTitle">
                    {LL.TITLE_DISCOVER()}
                </BaseText>

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

            <BaseSpacer height={32} />

            <Tab.Navigator
                keyboardDismissMode="on-drag"
                initialLayout={{
                    width: Dimensions.get("window").width,
                }}
                tabBar={TopTabbar}
                screenOptions={{ animationEnabled: PlatformUtils.isIOS() }}>
                <Tab.Screen
                    name={LL.COMMON_ASSETS()}
                    component={DiscoverAssets}
                />
                <Tab.Screen
                    name={LL.COMMON_DAPPS()}
                    component={DiscoverDApps}
                />
            </Tab.Navigator>
        </BaseSafeArea>
    )
}
