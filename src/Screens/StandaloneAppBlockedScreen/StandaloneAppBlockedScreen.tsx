import React, { useEffect, useMemo } from "react"
import { useI18nContext } from "~i18n"
import { useThemedStyles } from "~Hooks"
import LottieView from "lottie-react-native"
import { StyleSheet, Text, View } from "react-native"
import { BlockedAppDark, BlockedAppLight } from "~Assets/Lottie/BlockedApp"
import { SafeAreaView } from "react-native-safe-area-context"
import { PlatformUtils } from "~Utils"
import { ColorThemeType } from "~Constants"
import RNBootSplash from "react-native-bootsplash"

export const StandaloneAppBlockedScreen = () => {
    const { LL } = useI18nContext()

    useEffect(() => {
        RNBootSplash.hide({ fade: true, duration: 500 })
    }, [])

    const { styles, theme } = useThemedStyles(baseStyles)

    const lottieSource = useMemo(
        () => (theme.isDark ? BlockedAppDark : BlockedAppLight),
        [theme],
    )

    return (
        <SafeAreaView
            style={[
                PlatformUtils.isAndroid() ? styles.androidTopPadding : {},
                styles.safeArea,
            ]}>
            <View style={styles.innerContainer}>
                <View style={styles.title}>
                    <Text style={styles.titleText}>
                        {LL.TITLE_SECURITY_DOWNGRADE()}
                    </Text>
                </View>

                <View style={styles.imageContainer}>
                    <LottieView
                        source={lottieSource}
                        autoPlay
                        style={styles.lottie}
                    />
                    <Text style={styles.bodyText}>{LL.BD_APP_BLOCKED()}</Text>
                </View>
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
        title: {
            alignItems: "flex-start",
        },
        titleText: {
            textAlign: "left",
            fontSize: 22,
            fontWeight: "700",
            lineHeight: 28,
            color: theme.colors.text,
        },
        imageContainer: {
            alignItems: "center",
            flexGrow: 1,
            width: "100%",
            marginTop: 48,
        },
        lottie: {
            width: 320,
            height: 320,
        },
        bodyText: {
            textAlign: "center",
            fontSize: 15,
            fontWeight: "600",
            color: theme.colors.text,
            paddingVertical: 20,
            marginTop: 40,
        },
    })
