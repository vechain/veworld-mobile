import React, { useCallback } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useBiometricType } from "~Common"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import { Fonts } from "~Model"

export const AppSecurityScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { isBiometrics, currentSecurityLevel } = useBiometricType()

    const onBiometricsPress = useCallback(async () => {
        nav.navigate(Routes.WALLET_TPYE_CREATION)
    }, [nav])

    const onPasswordPress = useCallback(() => {
        nav.navigate(Routes.USER_CREATE_PASSWORD)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font={Fonts.large_title}>
                        {LL.TITLE_SECURITY()}
                    </BaseText>

                    <BaseText font={Fonts.body} my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    {isBiometrics && (
                        <BaseButton
                            filled
                            action={onBiometricsPress}
                            w={100}
                            mx={20}
                            my={20}
                            title={LL.BTN_SECURTY_USE_TYPE({
                                type: currentSecurityLevel!,
                            })}
                        />
                    )}

                    <BaseButton
                        bordered
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
