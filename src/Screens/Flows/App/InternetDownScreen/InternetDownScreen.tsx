import React, { useMemo } from "react"
import Lottie from "lottie-react-native"
import { useTheme } from "~Hooks"
import { InternetDownDark, InternetDownLight } from "~Assets"
import { useI18nContext } from "~i18n"
import { StyleSheet, Text, View } from "react-native"

export const InternetDownScreen = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const lottieSource = useMemo(
        () => (theme.isDark ? InternetDownDark : InternetDownLight),
        [theme],
    )
    return (
        <View
            style={[
                { backgroundColor: theme.colors.background },
                styles.container,
            ]}>
            <Lottie
                source={lottieSource}
                autoPlay
                loop
                style={styles.animation}
            />
            <Text style={[{ color: theme.colors.text }, styles.text]}>
                {LL.ALERT_MSG_INTERNET_DOWN()}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
    },
    animation: {
        width: 300,
        height: 300,
    },
    text: {
        textAlign: "center",
    },
})
