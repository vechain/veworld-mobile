import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseSwitch, BaseText, BaseView, Layout } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Routes } from "~Navigation"
import { acceptB3moDisclaimer, useAppDispatch } from "~Storage/Redux"

type Nav = NativeStackNavigationProp<{ [Routes.B3MO_ONBOARDING_WALLET_CHOICE]: undefined }>

export const B3moIntroScreen = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const dispatch = useAppDispatch()
    const nav = useNavigation<Nav>()
    const [agreed, setAgreed] = useState(false)

    const onContinue = useCallback(() => {
        dispatch(acceptB3moDisclaimer())
        nav.navigate(Routes.B3MO_ONBOARDING_WALLET_CHOICE)
    }, [dispatch, nav])

    return (
        <Layout
            title={LL.B3MO_AGENT_INTRO_TITLE()}
            body={
                <BaseView pt={24} px={4}>
                    <BaseView alignItems="center" mb={24}>
                        <BaseIcon name="icon-bot" size={56} color={theme.colors.primary} />
                    </BaseView>
                    <BaseText typographyFont="bodyMedium" align="center">
                        {LL.B3MO_AGENT_INTRO_SUBTITLE()}
                    </BaseText>
                    <BaseSpacer height={16} />
                    <BaseText typographyFont="body" align="center">
                        {LL.B3MO_AGENT_INTRO_BODY()}
                    </BaseText>
                </BaseView>
            }
            footer={
                <BaseView>
                    <BaseView style={styles.disclaimerRow}>
                        <BaseSwitch value={agreed} onValueChange={setAgreed} testID="b3mo-disclaimer-toggle" />
                        <BaseSpacer width={12} />
                        <BaseText typographyFont="captionRegular" flex={1}>
                            {LL.B3MO_AGENT_INTRO_DISCLAIMER()}
                        </BaseText>
                    </BaseView>
                    <BaseSpacer height={16} />
                    <BaseButton
                        title={LL.B3MO_AGENT_INTRO_CTA()}
                        action={onContinue}
                        disabled={!agreed}
                        testID="b3mo-intro-continue"
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        disclaimerRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: theme.colors.card,
            padding: 12,
            borderRadius: 12,
        },
    })
