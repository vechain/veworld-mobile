import React from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { EnableBiometrics, Reset, SecureApp } from "./Components"
import { ChangeTheme } from "./Components/ChangeTheme"

export const SettingsScreen = () => {
    return (
        <BaseSafeArea>
            <BaseView alignItems="center" justifyContent="center" mx={20}>
                <BaseText>Settings Screen</BaseText>
                <BaseSpacer height={40} />
                <SecureApp />
                <BaseSpacer height={20} />
                <EnableBiometrics />
                <BaseSpacer height={20} />
                <ChangeTheme />
                <BaseSpacer height={60} />
                <Reset />
            </BaseView>
        </BaseSafeArea>
    )
}
