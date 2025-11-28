import React from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { ColorThemeType, COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { useI18nContext } from "~i18n"

type SendFlowStep = "selectAmount" | "insertAddress" | "summary"

type SendFlowHeaderProps = {
    step: SendFlowStep
}

const TOTAL_STEPS = 3

export const SendFlowHeader: React.FC<SendFlowHeaderProps> = ({ step }) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const { iconName, title, currentStep } = getStepConfig(step, LL)

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" pb={16}>
            <BaseView flexDirection="row" justifyContent="flex-start" alignItems="center" gap={12}>
                <BaseView style={[styles.iconContainer]}>
                    <BaseIcon color={theme.colors.defaultIcon.color} name={iconName} size={16} />
                </BaseView>
                <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                    {title}
                </BaseText>
            </BaseView>
            <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                {LL.SEND_RECEIVER_DETAILS_COUNT({ current: currentStep, total: TOTAL_STEPS })}
            </BaseText>
        </BaseView>
    )
}

const getStepConfig = (
    step: SendFlowStep,
    LL: ReturnType<typeof useI18nContext>["LL"],
): { iconName: IconKey; title: string; currentStep: number } => {
    switch (step) {
        case "selectAmount":
            return {
                iconName: "icon-coins",
                title: LL.SEND_TOKEN_AMOUNT(),
                currentStep: 1,
            }
        case "insertAddress":
            return {
                iconName: "icon-user-check",
                title: LL.ADDITIONAL_DETAIL_RECEIVER(),
                currentStep: 2,
            }
        case "summary":
        default:
            return {
                iconName: "icon-list-checks",
                title: LL.SEND_RECEIVER_DETAILS(),
                currentStep: 3,
            }
    }
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        iconContainer: {
            borderColor: theme.colors.defaultIcon.border,
            borderWidth: 1,
            backgroundColor: theme.colors.defaultIcon.background,
            color: theme.colors.defaultIcon.color,
            padding: 8,
            borderRadius: 16,
            width: 32,
            height: 32,
        },
    })
