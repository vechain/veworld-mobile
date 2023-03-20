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
import { VeChainVetLogoSVG } from "~Assets"
import { useI18nContext } from "~i18n"

export const WelcomeScreen = () => {
    const nav = useNavigation()
    const { LL } = useI18nContext()

    const onNavigate = useCallback(() => {
        nav.navigate(Routes.ONBOARDING)
    }, [nav])

    return (
        <BaseSafeArea grow={1}>
            <BaseSpacer height={20} />

            <BaseView alignItems="center" mx={20} flexGrow={1}>
                <BaseView flexDirection="row">
                    <BaseText
                        typographyFont="largeTitle"
                        testID="welcome-title-id">
                        {LL.TITLE_WELCOME_TO()}
                    </BaseText>
                    <BaseText typographyFont="largeTitle">VeWorld</BaseText>
                </BaseView>

                <BaseSpacer height={120} />

                <BaseView
                    alignItems="center"
                    justifyContent="space-between"
                    w={100}
                    grow={1}>
                    <BaseView alignItems="center">
                        <VeChainVetLogoSVG />
                        <BaseText align="center" py={20}>
                            {LL.BD_WELCOME_SCREEN()}
                        </BaseText>
                    </BaseView>

                    <BaseView alignItems="center" w={100}>
                        <BaseText typographyFont="caption" py={10}>
                            {LL.BD_GDPR()}
                        </BaseText>

                        <BaseButton
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
