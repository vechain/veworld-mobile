import React, { useCallback } from "react"
import {
    BaseButton,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useNavigation } from "@react-navigation/native"
import { Routes } from "~Navigation"
import VectorImage from "react-native-vector-image"
import { VeChainVetLogo } from "~Assets"
import { useTheme } from "~Common"
import { useI18nContext } from "~i18n"
import { Fonts } from "~Model"

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const theme = useTheme()
    const { LL } = useI18nContext()

    const onNavigate = useCallback(() => {
        nav.navigate(Routes.ONBOARDING)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />

            <BaseView align="center" mx={20} grow={1}>
                <BaseView orientation="row">
                    <BaseText font={Fonts.large_title}>
                        {LL.TITLE_WELCOME_TO()}
                    </BaseText>
                    <BaseText
                        font={Fonts.large_title}
                        color={theme.colors.button}>
                        VeWorld
                    </BaseText>
                </BaseView>

                <BaseSpacer height={120} />

                <BaseView
                    align="center"
                    justify="space-between"
                    w={100}
                    grow={1}>
                    <BaseView align="center">
                        <VectorImage source={VeChainVetLogo} />
                        <BaseText align="center" py={20}>
                            {LL.BD_WELCOME_SCREEN()}
                        </BaseText>
                    </BaseView>

                    <BaseView align="center" w={100}>
                        <BaseText font={Fonts.caption} py={10}>
                            {LL.BD_GDPR()}
                        </BaseText>

                        <BaseButton
                            filled
                            action={onNavigate}
                            w={100}
                            title={LL.BTN_GET_STARTED()}
                            testID="GET_STARTED_BTN"
                            haptics="medium"
                        />
                    </BaseView>
                </BaseView>

                <BaseSpacer height={40} />
            </BaseView>
        </BaseSafeArea>
    )
}
