import React from "react"
import { BaseView } from "~Components/Base"
import { useI18nContext } from "~i18n"
import { AlertInline } from "~Components"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

export const MnemonicAvoidScreenshotAlert = () => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView style={styles.container}>
            <AlertInline message={LL.ALERT_DONT_SCREENSHOT_MNEMONIC()} status="info" />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            paddingRight: 48,
        },
    })
