import React, { useCallback } from "react"
import {
    BackButtonHeader,
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import {
    useBiometricType,
    useBiometrics,
    useBiometricsValidation,
} from "~Hooks"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { SecurityLevelType } from "~Model"

export const AppSecurityScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const { currentSecurityLevel } = useBiometricType()
    useBiometrics()
    const { authenticateBiometrics } = useBiometricsValidation()

    const onBiometricsPress = useCallback(async () => {
        authenticateBiometrics(() => {
            nav.navigate(Routes.WALLET_SUCCESS, {
                securityLevelSelected: SecurityLevelType.BIOMETRIC,
            })
        })
    }, [authenticateBiometrics, nav])

    const onPasswordPress = useCallback(() => {
        nav.navigate(Routes.USER_CREATE_PASSWORD)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView
                alignItems="center"
                justifyContent="space-between"
                flexGrow={1}
                mx={20}>
                <BaseView alignSelf="flex-start">
                    <BaseText typographyFont="title">
                        {LL.TITLE_SECURITY()}
                    </BaseText>
                    <BaseText typographyFont="body" my={10}>
                        {LL.SB_SECURITY()}
                    </BaseText>
                </BaseView>

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
            </BaseView>

            <BaseSpacer height={40} />
        </BaseSafeArea>
    )
}
