import React from "react"
import { BaseView } from "~Components/Base"
import { useI18nContext } from "~i18n"
import { AlertInline } from "~Components"
import { StyleSheet } from "react-native"
import { useThemedStyles } from "~Hooks"

type Props = {
    credential: string[] | string
}
export const CredentialAvoidScreenshotAlert = ({ credential }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    const isMnemonic = Array.isArray(credential)

    return (
        <BaseView style={styles.container}>
            <AlertInline
                message={isMnemonic ? LL.ALERT_DONT_SCREENSHOT_MNEMONIC() : LL.ALERT_DONT_SCREENSHOT_PRIVATE_KEY()}
                status="info"
            />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        container: {
            paddingRight: 48,
        },
    })
