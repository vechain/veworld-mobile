import React from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { EnableBiometrics, SecureApp } from "./Components"
import { TouchableOpacity } from "react-native"
import { Config, useRealm } from "~Storage"

export const SettingsScreen = () => {
    const { store } = useRealm()

    return (
        <BaseSafeArea>
            <BaseView align="center" justify="center" mx={20}>
                <BaseText>Settings Screen</BaseText>
                <BaseSpacer height={40} />
                <SecureApp />
                <BaseSpacer height={20} />
                <EnableBiometrics />
                <BaseSpacer height={20} />
                <TouchableOpacity
                    onPress={() => {
                        store.write(() => {
                            const config = store.objectForPrimaryKey<Config>(
                                Config.getName(),
                                Config.getPrimaryKey(),
                            )
                            if (config) config.isResettingApp = true
                        })
                    }}>
                    <BaseText>Logout</BaseText>
                </TouchableOpacity>
            </BaseView>
        </BaseSafeArea>
    )
}
