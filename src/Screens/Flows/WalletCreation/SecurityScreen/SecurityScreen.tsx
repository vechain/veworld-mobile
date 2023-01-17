import React from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { Biometrics } from "~Common"
import { useI18nContext } from "~i18n"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"

export const SecurityScreen = () => {
    const { LL } = useI18nContext()
    const nav = useNavigation()

    const onBiometricsPress = async () => {
        let { success } = await Biometrics.authenticateWithbiometric()
        if (success) {
        } else {
            // handle failure message
        }
    }

    const onPasswordPress = () => {
        nav.navigate(Routes.USER_PASSWORD)
    }

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />
            <BaseView align="center" justify="space-between" grow={1} mx={20}>
                <BaseView selfAlign="flex-start">
                    <BaseText font="large_title">
                        {LL.TITLE_SECURITY()}
                    </BaseText>

                    <BaseText font="body" my={10}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                    </BaseText>
                </BaseView>

                <BaseView align="center" w={100}>
                    <BaseButton
                        filled
                        action={onBiometricsPress}
                        w={100}
                        mx={20}
                        my={20}
                        title={LL.BTN_SECURTY_USE_TYPE({
                            type: "getBiometricsType",
                        })}
                    />

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
