import React from "react"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import { Button, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { PlatformUtils } from "~Utils"
import { ColorThemeType } from "~Constants"

type IProps = {
    retryBiometrics: () => Promise<void>
}

export const StandaloneRetryBiometrics = ({ retryBiometrics }: IProps) => {
    const { LL } = useI18nContext()

    const { styles } = useThemedStyles(baseStyles)

    return (
        <SafeAreaView
            style={[
                PlatformUtils.isAndroid() ? styles.androidTopPadding : {},
                styles.safeArea,
            ]}>
            <View style={styles.innerContainer}>
                <Button onPress={retryBiometrics} title={LL.BTN_RETRY()} />
            </View>
        </SafeAreaView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        safeArea: {
            paddingBottom: 0,
            flexGrow: 1,
            backgroundColor: theme.colors.background,
        },
        androidTopPadding: {
            paddingTop: 12,
        },
        innerContainer: {
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexGrow: 1,
            marginHorizontal: 20,
            marginTop: 20,
        },
        imageContainer: {
            alignItems: "center",
            flexGrow: 1,
            width: "100%",
            marginTop: 48,
        },
    })
