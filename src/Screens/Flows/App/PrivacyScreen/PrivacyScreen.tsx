import React from "react"
import { BaseSafeArea, BaseView } from "~Components"
import { EnableBiometrics, SecureApp } from "./Components"

export const PrivacyScreen = () => {
    return (
        <BaseSafeArea grow={1}>
            <BaseView mx={20}>
                <SecureApp />
                <EnableBiometrics />
            </BaseView>
        </BaseSafeArea>
    )
}
