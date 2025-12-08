import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { IconKey } from "~Model"
import { useI18nContext } from "~i18n"
import { SendFlowStep, useSendContext } from "../Provider"

const TOKEN_TOTAL_STEPS = 3
const NFT_TOTAL_STEPS = 2

export const SendContentHeader = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { step, flowState } = useSendContext()

    const isNFTFlow = !flowState.token

    const { iconName, title, currentStep, totalSteps } = useMemo(
        () => getStepConfig(step, LL, isNFTFlow),
        [step, LL, isNFTFlow],
    )

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" pt={16}>
            <BaseView flexDirection="row" justifyContent="flex-start" alignItems="center" gap={12}>
                <BaseIcon color={theme.colors.defaultIcon.color} name={iconName} size={16} style={styles.icon} />
                <BaseText typographyFont="bodyMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                    {title}
                </BaseText>
            </BaseView>
            <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}>
                {LL.SEND_RECEIVER_DETAILS_COUNT({ current: currentStep, total: totalSteps })}
            </BaseText>
        </BaseView>
    )
}

const getStepConfig = (
    step: SendFlowStep,
    LL: ReturnType<typeof useI18nContext>["LL"],
    isNFTFlow: boolean,
): { iconName: IconKey; title: string; currentStep: number; totalSteps: number } => {
    if (isNFTFlow) {
        switch (step) {
            case "insertAddress":
                return {
                    iconName: "icon-user-check",
                    title: LL.ADDITIONAL_DETAIL_RECEIVER(),
                    currentStep: 1,
                    totalSteps: NFT_TOTAL_STEPS,
                }
            case "summary":
            default:
                return {
                    iconName: "icon-list-checks",
                    title: LL.SEND_RECEIVER_DETAILS(),
                    currentStep: 2,
                    totalSteps: NFT_TOTAL_STEPS,
                }
        }
    }

    switch (step) {
        case "selectAmount":
            return {
                iconName: "icon-coins",
                title: LL.SEND_TOKEN_AMOUNT(),
                currentStep: 1,
                totalSteps: TOKEN_TOTAL_STEPS,
            }
        case "insertAddress":
            return {
                iconName: "icon-user-check",
                title: LL.ADDITIONAL_DETAIL_RECEIVER(),
                currentStep: 2,
                totalSteps: TOKEN_TOTAL_STEPS,
            }
        case "summary":
        default:
            return {
                iconName: "icon-list-checks",
                title: LL.SEND_RECEIVER_DETAILS(),
                currentStep: 3,
                totalSteps: TOKEN_TOTAL_STEPS,
            }
    }
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        icon: {
            borderColor: theme.colors.defaultIcon.border,
            borderWidth: 1,
            backgroundColor: theme.colors.defaultIcon.background,
            color: theme.colors.defaultIcon.color,
            padding: 8,
            borderRadius: 16,
        },
    })
