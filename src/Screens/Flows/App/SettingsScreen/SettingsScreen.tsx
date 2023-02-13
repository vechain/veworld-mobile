import React from "react"
import { BaseSafeArea, BaseSpacer, BaseText, BaseView } from "~Components"
import { EnableBiometrics, SecureApp } from "./Components"

export const SettingsScreen = () => {
    return (
        <>
            <BaseSafeArea />
            <BaseView align="center" justify="center" mx={20}>
                <BaseText>Settings Screen</BaseText>
                <BaseSpacer height={40} />
                <SecureApp />
                <BaseSpacer height={20} />
                <EnableBiometrics />
            </BaseView>
        </>
    )
}
