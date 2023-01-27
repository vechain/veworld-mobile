import React, { useMemo } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Tabbar } from "~Navigation/Tabs"
import { OnboardingStack } from "./OnboardingStack"
import { WalletStack } from "./WalletStack"
import { Config, useQuery } from "~Storage/Realm"

export type RootStackParamListSwitch = {
    OnboardingStack: undefined
    WalletStack: undefined
    Tabbar: undefined
}
const Switch = createNativeStackNavigator<RootStackParamListSwitch>()

export const SwitchStack = () => {
    // const appConfig = useObject(Config, "APP_CONFIG")
    // this is a workaround until the new version is installed, then use the above
    const result = useQuery(Config)
    const appConfig = useMemo(() => result.sorted("_id"), [result])

    console.log(appConfig)

    const RenderStacks = useMemo(() => {
        if (appConfig[0]?.isWallet) {
            return (
                <Switch.Screen
                    name="Tabbar"
                    component={Tabbar}
                    options={{ headerShown: false }}
                />
            )
        } else if (appConfig[0]?.isEncryptionKey) {
            return (
                <Switch.Screen
                    name="WalletStack"
                    component={WalletStack}
                    options={{ headerShown: false }}
                />
            )
        } else {
            return (
                <Switch.Screen
                    name="OnboardingStack"
                    component={OnboardingStack}
                    options={{ headerShown: false }}
                />
            )
        }
    }, [appConfig])

    return (
        <Switch.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            {RenderStacks}
        </Switch.Navigator>
    )
}
