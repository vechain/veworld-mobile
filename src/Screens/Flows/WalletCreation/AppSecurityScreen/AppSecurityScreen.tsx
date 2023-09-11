import React, { useCallback, useMemo } from "react"
import {
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    Layout,
    useEncryptedStorage,
} from "~Components"
import { useBiometrics, useBiometricType, useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { SecurityLevelType } from "~Model"
import { StyleSheet } from "react-native"
import Lottie from "lottie-react-native"
import { ProtectWalletDark, ProtectWalletLight } from "~Assets"

export const AppSecurityScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const { currentSecurityLevel } = useBiometricType()
    useBiometrics()

    const { migrateOnboarding } = useEncryptedStorage()

    const onBiometricsPress = useCallback(async () => {
        await migrateOnboarding(SecurityLevelType.BIOMETRIC)

        nav.navigate(Routes.WALLET_SUCCESS, {
            securityLevelSelected: SecurityLevelType.BIOMETRIC,
        })
    }, [migrateOnboarding, nav])

    const onPasswordPress = useCallback(() => {
        nav.navigate(Routes.USER_CREATE_PASSWORD)
    }, [nav])

    const { isDark } = useTheme()

    const protectWalletImage = useMemo(() => {
        return isDark ? (
            <Lottie source={ProtectWalletDark} autoPlay style={styles.lottie} />
        ) : (
            <Lottie
                source={ProtectWalletLight}
                autoPlay
                style={styles.lottie}
            />
        )
    }, [isDark])

    return (
        <Layout
            body={
                <BaseView
                    alignItems="center"
                    justifyContent="space-between"
                    flexGrow={1}>
                    <BaseView alignSelf="flex-start">
                        <BaseText typographyFont="title">
                            {LL.TITLE_SECURITY()}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={24} />
                    {protectWalletImage}
                    <BaseView alignSelf="flex-start">
                        <BaseText typographyFont="body" my={10}>
                            {LL.SB_SECURITY()}
                        </BaseText>
                    </BaseView>
                </BaseView>
            }
            footer={
                <BaseView alignItems="center" w={100}>
                    <BaseButton
                        haptics="Medium"
                        action={onBiometricsPress}
                        w={100}
                        mx={20}
                        my={20}
                        title={LL.BTN_SECURTY_USE_TYPE({
                            type: currentSecurityLevel!,
                        })}
                    />

                    <BaseButton
                        haptics="Medium"
                        variant="outline"
                        action={onPasswordPress}
                        w={100}
                        mx={20}
                        title={LL.BTN_SECURITY_CREATE_PASSWORD()}
                    />
                </BaseView>
            }
        />
    )
}

const styles = StyleSheet.create({
    lottie: {
        width: "100%",
        height: 300,
    },
})
