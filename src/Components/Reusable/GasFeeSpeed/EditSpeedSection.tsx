import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { ColorThemeType, GasPriceCoefficient } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { SPEED_MAP } from "./constants"

type Props = {
    speedChangeEnabled: boolean
    selectedFeeOption: GasPriceCoefficient
    onOpen: () => void
}

export const EditSpeedSection = ({ speedChangeEnabled, selectedFeeOption, onOpen }: Props) => {
    const { LL } = useI18nContext()
    const { theme, styles } = useThemedStyles(baseStyles)
    if (!speedChangeEnabled) return null

    return (
        <>
            <BaseView flexDirection="row" gap={12} justifyContent="space-between" w={100} style={styles.section}>
                <BaseView flexDirection="column" gap={4}>
                    <BaseText color={theme.colors.textLight} typographyFont="captionMedium">
                        {LL.SEND_ESTIMATED_TIME()}
                    </BaseText>
                    <BaseView flexDirection="row" gap={8}>
                        <BaseIcon name="icon-timer" size={16} color={theme.colors.textLight} />
                        <BaseText typographyFont="subSubTitleBold" color={theme.colors.assetDetailsCard.title}>
                            {LL.UNDER_SECONDS({ seconds: SPEED_MAP[selectedFeeOption].asSeconds() })}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseButton
                    leftIcon={
                        <BaseIcon name="icon-thunder" color={theme.colors.cardButton.text} size={16} px={0} py={0} />
                    }
                    action={onOpen}
                    variant="solid"
                    bgColor={theme.colors.cardButton.background}
                    style={styles.cardButton}
                    px={12}
                    py={8}
                    textColor={theme.colors.cardButton.text}
                    testID="GAS_FEE_SPEED_EDIT">
                    {LL.EDIT_SPEED()}
                </BaseButton>
            </BaseView>
            <BaseSpacer
                height={1}
                background={theme.isDark ? theme.colors.background : theme.colors.pressableCardBorder}
            />
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        section: {
            padding: 16,
        },
        cardButton: {
            borderColor: theme.colors.cardButton.border,
            borderWidth: 1,
            backgroundColor: theme.colors.cardButton.background,
            gap: 8,
        },
    })
