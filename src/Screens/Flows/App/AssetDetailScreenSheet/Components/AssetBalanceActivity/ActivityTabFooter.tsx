import React from "react"
import { StyleSheet } from "react-native"
import { BaseButton, BaseIcon } from "~Components"
import { COLORS } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { SkeletonActivityBox } from "~Screens/Flows/App/ActivityScreen/Components"

export const ActivityTabFooter = ({
    onClick,
    show,
    isLoading,
}: {
    onClick: () => void
    show: boolean
    isLoading: boolean
}) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    if (isLoading) return <SkeletonActivityBox style={styles.skeleton} />
    if (!show) return null

    return (
        <BaseButton
            action={onClick}
            rightIcon={
                <BaseIcon name="icon-arrow-down" color={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_600} size={16} />
            }
            style={styles.btn}
            variant="solid"
            textColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.GREY_600}
            bgColor={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_200}
            typographyFont="smallCaptionSemiBold"
            testID="TOKEN_ACTIVITY_SHOW_MORE_BTN">
            {LL.COMMON_SHOW_MORE()}
        </BaseButton>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        icon: {
            marginLeft: 8,
        },
        btn: {
            gap: 8,
            marginTop: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
        },
        skeleton: {
            marginTop: 24,
        },
    })
