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
                    <BaseText typographyFont="largeTitle">
                        {LL.VEWORLD()}
                    </BaseText>
                </BaseView>

                <BaseSpacer height={80} />

                <BaseView alignItems="center" w={100} flexGrow={1}>
                    <VeChainVetLogoSVG />
                    <BaseSpacer height={40} />
                    <BaseText
                        align="left"
                        typographyFont="buttonPrimary"
                        py={20}>
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

                <BaseSpacer height={40} />
            </BaseView>
        </BaseSafeArea>
    )
}
