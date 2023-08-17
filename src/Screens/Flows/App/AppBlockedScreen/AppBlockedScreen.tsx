import React, { useMemo } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useAppReset, useTheme } from "~Hooks"
import LottieView from "lottie-react-native"
import { StyleSheet } from "react-native"
import { BlockedAppDark, BlockedAppLight } from "~Assets/Lottie/BlockedApp"

export const AppBlockedScreen = () => {
    const { LL } = useI18nContext()
    const appReset = useAppReset()
    const theme = useTheme()

    const lottieSource = useMemo(
        () => (theme.isDark ? BlockedAppDark : BlockedAppLight),
        [theme],
    )

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />

            <BaseView
                alignItems="flex-start"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignItems="flex-start">
                    <BaseText typographyFont="title" align="left">
                        {LL.TITLE_SECURITY_DOWNGRADE()}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={48} />

                <BaseView alignItems="center" w={100} flexGrow={1}>
                    <LottieView
                        source={lottieSource}
                        autoPlay
                        style={styles.lottie}
                    />
                    <BaseSpacer height={40} />
                    <BaseText align="left" py={20}>
                        {LL.BD_APP_BLOCKED()}
                    </BaseText>
                </BaseView>

                <BaseView alignItems="center" w={100}>
                    <BaseButton
                        action={appReset}
                        w={100}
                        title={LL.BTN_RESET_APP().toUpperCase()}
                        haptics="Medium"
                    />
                </BaseView>

                <BaseSpacer height={40} />
            </BaseView>
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    lottie: {
        width: 320,
        height: 320,
    },
})
